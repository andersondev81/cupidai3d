import { Environment } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { Perf } from "r3f-perf";
import React, { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Castle from "../assets/models/Castle";
import { CastleUi } from "../assets/models/CastleUi";
import { HeartText } from "../assets/models/HeartText";
import { Pole } from "../assets/models/Pole";
import { Stairs } from "../assets/models/Stairs";
import { CAMERA_CONFIG } from "../components/cameraConfig";
import { EffectsTree } from "../components/helpers/EffectsTree";
// Iframes
import AtmIframe from "../assets/models/AtmIframe";
import MirrorIframe from "../assets/models/MirrorIframe";
import ScrolIframe from "../assets/models/ScrolIframe";

import Orb from "../assets/models/Orb";
// import OldOrb from "../assets/models/OldOrb"

import CloudsD from "../assets/models/CloudsD";
// import OldCloudsD from "../assets/models/OldCloudsD"

import Modeload from "../components/helpers/Modeload";


// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("3D Scene Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center p-8">
            <h2 className="text-xl mb-4">Unable to load 3D scene</h2>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// HDR Environment options
const ENVIRONMENT_OPTIONS = {
  "Sky Linekotsi": "/images/sky_linekotsi_16_HDRI.hdr",
  "Sky 20": "/images/sky20.hdr",
  "Vino Sky": "/images/VinoSky.hdr",
};

// Environment presets
const ENVIRONMENT_PRESETS = {
  "None": null,
  "Apartment": "apartment",
  "City": "city",
  "Dawn": "dawn",
  "Forest": "forest",
  "Lobby": "lobby",
  "Night": "night",
  "Park": "park",
  "Studio": "studio",
  "Sunset": "sunset",
  "Warehouse": "warehouse",
};

// Optimized Canvas configuration
const CANVAS_CONFIG = {
  gl: {
    antialias: false,
    powerPreference: "high-performance",
    stencil: false,
    depth: true,
    alpha: false,
  },
  dpr: [1, 1.5], // Limit pixel ratio for better performance
  camera: {
    fov: 50,
    near: 0.1,
    far: 1000,
    position: [15.9, 6.8, -11.4],
  },
};

const useCameraAnimation = (section, cameraRef) => {
  const { camera } = useThree();
  const animationRef = useRef({
    progress: 0,
    isActive: false,
    startPosition: new THREE.Vector3(),
    startFov: 50,
  });

  useEffect(() => {
    if (!camera) return;

    const sectionKey = section in CAMERA_CONFIG.sections ? section : "intro";
    const config = CAMERA_CONFIG.sections[sectionKey];
    const { intensity, curve } = CAMERA_CONFIG.transitions;

    animationRef.current = {
      ...animationRef.current,
      isActive: true,
      startPosition: camera.position.clone(),
      startFov: camera.fov,
      config,
    };

    let animationFrameId;

    const animate = () => {
      if (!animationRef.current.isActive) return;

      animationRef.current.progress += intensity;
      const t = Math.min(animationRef.current.progress, 1);
      const { config, startPosition, startFov } = animationRef.current;

      const curveValue = curve(t);
      const offsetZ = curveValue * config.transition.zOffset;
      const targetFovOffset =
        curveValue * config.fov * config.transition.fovMultiplier;

      const targetPosition = new THREE.Vector3()
        .lerpVectors(startPosition, config.position, t)
        .add(new THREE.Vector3(0, 0, offsetZ));

      const targetFov =
        THREE.MathUtils.lerp(startFov, config.fov, t) - targetFovOffset;

      camera.position.copy(targetPosition);
      camera.fov = targetFov;
      camera.updateProjectionMatrix();

      if (t < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        animationRef.current.isActive = false;
        animationRef.current.progress = 0;
      }
    };

    animate();

    if (cameraRef) {
      cameraRef.current = {
        goToHome: () => {
          camera.position.set(15.9, 6.8, -11.4);
          camera.updateProjectionMatrix();
          animationRef.current.isActive = false;
          animationRef.current.progress = 0;
        },
      };
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      animationRef.current.isActive = false;
    };
  }, [section, camera, cameraRef]);
};

// Scene Controller component with environment controls
const SceneController = React.memo(({ section, cameraRef }) => {
  useCameraAnimation(section, cameraRef);
  const { scene } = useThree();

  // Environment control using Leva
  const {
    environment,
    showBackground,
    preset,
    presetIntensity,
    backgroundBlur,
    environmentIntensity
  } = useControls(
    "Environment",
    {
      environment: {
        value: "Vino Sky",
        options: Object.keys(ENVIRONMENT_OPTIONS),
        label: "HDR File",
      },
      showBackground: {
        value: true,
        label: "Show Background",
      },
      preset: {
        value: "Night",
        options: Object.keys(ENVIRONMENT_PRESETS),
        label: "Lighting Preset"
      },
    },
    { collapsed: false }
  );

  // Get the file path for the selected environment
  const environmentFile = ENVIRONMENT_OPTIONS[environment];
  const presetValue = ENVIRONMENT_PRESETS[preset];

  useEffect(() => {
    if (!showBackground) {
      scene.background = null;
    }
  }, [showBackground, scene]);

  return (
    <>
      <Environment
        files={environmentFile}
        resolution={256}
        background={showBackground}
        backgroundBlurriness={backgroundBlur}
        environmentIntensity={environmentIntensity}
        preset={null}
      />

      {/* Only render second Environment component when preset is not "None" */}
      {presetValue && (
        <Environment
          preset={presetValue}
          environmentIntensity={presetIntensity}
        />
      )}

      {process.env.NODE_ENV !== "production" && <Perf position="top-left" />}
    </>
  );
});

// Split the scene content into smaller components for better performance
const PrimaryContent = React.memo(({ activeSection, onSectionChange }) => (
  <>
    <Castle activeSection={activeSection} receiveShadow scale={[2, 2, 2]} />
    <Pole
      position={[-0.8, 0, 5.8]}
      scale={[0.6, 0.6, 0.6]}
      onSectionChange={onSectionChange}
    />
  </>
));

const SecondaryContent = React.memo(() => (
  <>
    <CloudsD />
    <Orb />
    <Stairs />
    <HeartText />
  </>
));

const TertiaryContent = React.memo(() => (
  <>
    <ScrolIframe />
    <AtmIframe />
    <MirrorIframe />
  </>
));

const SceneContent = React.memo(({ activeSection, onSectionChange }) => {
  const [loadingStage, setLoadingStage] = useState(0);

  useEffect(() => {
    const primaryTimer = setTimeout(() => setLoadingStage(1), 100);
    const secondaryTimer = setTimeout(() => setLoadingStage(2), 1000);

    return () => {
      clearTimeout(primaryTimer);
      clearTimeout(secondaryTimer);
    };
  }, []);

  return (
    <>
      <EffectsTree />
      <PrimaryContent
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />
      {loadingStage >= 1 && <SecondaryContent />}
      {loadingStage >= 2 && <TertiaryContent />}
    </>
  );
});

// Main Experience Component
const Experience = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [activeSection, setActiveSection] = useState("intro");
  const cameraRef = useRef(null);

  const handleSectionChange = (index, sectionName) => {
    setCurrentSection(index);
    setActiveSection(sectionName);
  };

  const handleStart = () => {
    setIsStarted(true);
  };

  if (!isStarted) {
    return (
      <div className="relative w-full h-screen">
        <Canvas>
          <Modeload onStart={handleStart} />
        </Canvas>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <ErrorBoundary>
        <div className="absolute inset-0 z-0">
          <Canvas {...CANVAS_CONFIG} className="w-full h-full">
            <Suspense fallback={null}>
              <SceneController section={currentSection} cameraRef={cameraRef} />
              <SceneContent
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
              />
            </Suspense>
          </Canvas>
        </div>

        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="w-full h-full">
            <CastleUi
              section={currentSection}
              onSectionChange={handleSectionChange}
              cameraRef={cameraRef.current}
              className="pointer-events-auto"
            />
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default Experience;
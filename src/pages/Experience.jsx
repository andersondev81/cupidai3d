import { Environment } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { Perf } from "r3f-perf";
import React, { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Castle from "../assets/models/Castle";
import { CastleUi } from "../assets/models/CastleUi";

import { Pole } from "../assets/models/Pole";
import { Stairs } from "../assets/models/Stairs";
import { CAMERA_CONFIG } from "../components/cameraConfig";
import { EffectsTree } from "../components/helpers/EffectsTree";
import { Flowers } from "../assets/models/Flowers";

// Iframes
import AtmIframe from "../assets/models/AtmIframe";
import MirrorIframe from "../assets/models/MirrorIframe";

import Orb from "../assets/models/Orb";
// import OldOrb from "../assets/models/OldOrb"

import CloudsD from "../assets/models/CloudsD";
// import OldCloudsD from "../assets/models/OldCloudsD"

import EnvMapLoader from "../components/helpers/EnvMapLoader";
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
  "Vino Sky V1": "/images/VinoSkyV1.hdr",
  "Vino Sky V2": "/images/clouds-vino.hdr",
  "Vino Sky V3": "/images/VinoSkyV2.hdr",
};

// Environment presets
const ENVIRONMENT_PRESETS = {
  None: null,
  Apartment: "apartment",
  City: "city",
  Dawn: "dawn",
  Forest: "forest",
  Lobby: "lobby",
  Night: "night",
  Park: "park",
  Studio: "studio",
  Sunset: "sunset",
  Warehouse: "warehouse",
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
  dpr: [1, 1.5],
  camera: {
    fov: 50,
    near: 0.1,
    far: 1000,
    position: [15.9, 6.8, -11.4],
  },
  shadows: false, // Disable shadows in the renderer
};

const useCameraAnimation = (section, cameraRef) => {
  const { camera } = useThree();
  const [isStarted, setIsStarted] = useState(false);
  const animationRef = useRef({
    progress: 0,
    isActive: false,
    startPosition: new THREE.Vector3(),
    startRotation: new THREE.Euler(),
    startFov: 50,
    lastTime: 0,
  });

  useEffect(() => {
    if (!camera) return;

    const sectionKey = section in CAMERA_CONFIG.sections ? section : "intro";
    const config = CAMERA_CONFIG.sections[sectionKey];

    // Use uma curva de easing mais suave para transições
    const easing = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    // Armazene a posição e rotação inicial da câmera
    animationRef.current = {
      ...animationRef.current,
      isActive: true,
      startPosition: camera.position.clone(),
      startRotation: camera.rotation.clone(),
      startFov: camera.fov,
      lastTime: performance.now(),
      config,
    };

    let animationFrameId;

    const animate = (currentTime) => {
      if (!animationRef.current.isActive) return;

      // Calcule delta de tempo para ter uma velocidade consistente
      const deltaTime = Math.min(
        (currentTime - animationRef.current.lastTime) / 1000,
        0.1
      ); // Limita o delta para evitar saltos grandes

      animationRef.current.lastTime = currentTime;

      // Velocidade de transição ajustável - quanto menor, mais suave
      const transitionSpeed = 1.5; // Ajuste este valor para mais lento (menor) ou mais rápido (maior)

      animationRef.current.progress += deltaTime * transitionSpeed;
      const t = Math.min(animationRef.current.progress, 1);
      const { config, startPosition, startFov } = animationRef.current;

      // Usa a função de easing para suavizar a transição
      const curveValue = easing(t);

      // Calcule a posição de destino com interpolação suave
      const targetPosition = new THREE.Vector3().lerpVectors(
        startPosition,
        config.position,
        curveValue
      );

      // Reduz o FOV máximo e usa um valor alvo mais baixo para evitar FOV alto
      // Limita o FOV entre 35 e 60 para uma visualização mais confortável
      const configFov = config.fov || 50; // Usa 50 como padrão se config.fov não estiver definido
      const targetFov = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(startFov, Math.min(configFov, 55), curveValue),
        35, // valor mínimo de FOV
        60 // valor máximo de FOV (reduzido para evitar FOV alto)
      );

      // Aplique as mudanças
      camera.position.copy(targetPosition);
      camera.fov = targetFov;
      camera.updateProjectionMatrix();

      // Continuar animação se não estiver completa
      if (t < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        animationRef.current.isActive = false;
        animationRef.current.progress = 0;

        // Define o FOV final para um valor confortável
        camera.fov = Math.min(configFov, 55);
        camera.updateProjectionMatrix();
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    if (cameraRef) {
      cameraRef.current = {
        goToHome: () => {
          // Inicie uma nova animação para retornar à posição inicial
          animationRef.current = {
            ...animationRef.current,
            isActive: true,
            progress: 0,
            startPosition: camera.position.clone(),
            startRotation: camera.rotation.clone(),
            startFov: camera.fov,
            lastTime: performance.now(),
            config: {
              position: new THREE.Vector3(15.9, 6.8, -11.4),
              fov: 50, // FOV padrão para a posição inicial
              transition: { fovMultiplier: 0, zOffset: 0 },
            },
          };

          // Inicie a animação
          requestAnimationFrame(animate);
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

  return isStarted;
};

// Scene Controller component with environment controls
const SceneController = React.memo(({ section, cameraRef }) => {
  useCameraAnimation(section, cameraRef);
  const { scene } = useThree();

  const {
    environment,
    showBackground,
    preset,
    presetIntensity,
    backgroundBlur,
    environmentIntensity,
  } = useControls(
    "Environment",
    {
      environment: {
        value: "Vino Sky V1",
        options: Object.keys(ENVIRONMENT_OPTIONS),
        label: "HDR File",
      },
      showBackground: {
        value: true,
        label: "Show Background",
      },
      preset: {
        value: "Sunset",
        options: Object.keys(ENVIRONMENT_PRESETS),
        label: "Lighting Preset",
      },
    },
    { collapsed: false }
  );

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
        ground={{ height: 5, radius: 40, scale: 30 }}
      />

      {/* Only render second Environment component when preset is not "None" */}
      {presetValue && (
        <Environment
          preset={presetValue}
          environmentIntensity={presetIntensity}
        />
      )}

      <EnvMapLoader />

      {process.env.NODE_ENV !== "development" && <Perf position="top-left" />}
    </>
  );
});

// Split the scene content into smaller components for better performance
const PrimaryContent = React.memo(({ activeSection, onSectionChange }) => (
  <>
    <EffectsTree />
    <Castle activeSection={activeSection} scale={[2, 2, 2]} />
    <Flowers />
    {/* <Stairs /> */}
    <CloudsD />
    <Orb />
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
    <Stairs />
  </>
));

const TertiaryContent = React.memo(() => (
  <>
    {/* <ScrolIframe /> */}

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
  const [isStarted, setIsStarted] = useState(false); // Adiciona o estado isStarted
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
            <AtmIframe
              section={currentSection}
              onSectionChange={handleSectionChange}
              cameraRef={cameraRef.current}
            />
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default Experience;
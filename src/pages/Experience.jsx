import React, { Suspense, useState, useRef, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import * as THREE from "three"
import { CAMERA_CONFIG } from "../components/cameraConfig"
import Castle from "../assets/models/Castle"
import { CastleUi } from "../assets/models/CastleUi"
import { Pole } from "../assets/models/Pole"
import { Perf } from "r3f-perf"

import Orb from "../assets/models/Orb"
// import OldOrb from "../assets/models/OldOrb"

import CloudsD from "../assets/models/CloudsD"
// import OldCloudsD from "../assets/models/OldCloudsD"

import Modeload from "../components/helpers/Modeload"

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("3D Scene Error:", error, errorInfo)
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
      )
    }
    return this.props.children
  }
}

// Optimized Canvas configuration
const CANVAS_CONFIG = {
  gl: {
    antialias: true,
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
}
const useCameraAnimation = (section, cameraRef) => {
  const { camera } = useThree()

  const [isStarted, setIsStarted] = useState(false)
  const animationRef = useRef({
    progress: 0,
    isActive: false,
    startPosition: new THREE.Vector3(),
    startFov: 50,
  })

  useEffect(() => {
    if (!camera) return

    const sectionKey = section in CAMERA_CONFIG.sections ? section : "intro"
    const config = CAMERA_CONFIG.sections[sectionKey]
    const { intensity, curve } = CAMERA_CONFIG.transitions

    animationRef.current = {
      ...animationRef.current,
      isActive: true,
      startPosition: camera.position.clone(),
      startFov: camera.fov,
      config,
    }

    let animationFrameId

    const animate = () => {
      if (!animationRef.current.isActive) return

      animationRef.current.progress += intensity
      const t = Math.min(animationRef.current.progress, 1)
      const { config, startPosition, startFov } = animationRef.current

      const curveValue = curve(t)
      const offsetZ = curveValue * config.transition.zOffset
      const targetFovOffset =
        curveValue * config.fov * config.transition.fovMultiplier

      const targetPosition = new THREE.Vector3()
        .lerpVectors(startPosition, config.position, t)
        .add(new THREE.Vector3(0, 0, offsetZ))

      const targetFov =
        THREE.MathUtils.lerp(startFov, config.fov, t) - targetFovOffset

      camera.position.copy(targetPosition)
      camera.fov = targetFov
      camera.updateProjectionMatrix()

      if (t < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        animationRef.current.isActive = false
        animationRef.current.progress = 0
      }
    }

    animate()

    if (cameraRef) {
      cameraRef.current = {
        goToHome: () => {
          camera.position.set(15.9, 6.8, -11.4)
          camera.updateProjectionMatrix()
          animationRef.current.isActive = false
          animationRef.current.progress = 0
        },
      }
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      animationRef.current.isActive = false
    }
  }, [section, camera, cameraRef])

  return isStarted
}

// Scene components permanecem os mesmos...
const SceneController = React.memo(({ section, cameraRef }) => {
  useCameraAnimation(section, cameraRef)

  return (
    <>
      <fog attach="fog" args={["#ffff", 0, 40]} />
      <Environment
        files="/images/PanoramaV1.hdr"
        background
        blur={0.6}
        envMapIntensity={1.5}
        resolution={256}
      />
      {process.env.NODE_ENV === "development" && <Perf position="top-left" />}
    </>
  )
})

const SceneContent = React.memo(({ activeSection, onSectionChange }) => (
  <>
    <Castle activeSection={activeSection} receiveShadow scale={[2, 2, 2]} />
    <CloudsD />
    <Orb />
    <Pole
      position={[-0.8, 0, 5.8]}
      scale={[0.6, 0.6, 0.6]}
      onSectionChange={onSectionChange}
    />
  </>
))

// Main Experience Component
const Experience = () => {
  // const [isStarted, setIsStarted] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [activeSection, setActiveSection] = useState("intro")
  const cameraRef = useRef(null)

  const handleSectionChange = (index, sectionName) => {
    setCurrentSection(index)
    setActiveSection(sectionName)
  }

  const handleStart = () => {
    setIsStarted(true)
  }

  // if (!isStarted) {
  //   return (
  //     <div className="relative w-full h-screen">
  //       <Canvas>
  //         <Modeload onStart={handleStart} />
  //       </Canvas>
  //     </div>
  //   )
  // }

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
  )
}

export default Experience
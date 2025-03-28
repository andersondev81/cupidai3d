// pages/ExperienceMobile.jsx
import { Environment } from "@react-three/drei"
import { Canvas, useThree } from "@react-three/fiber"
import React, { Suspense, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import Castle from "../assets/models/Castle"
import { CastleUi } from "../assets/models/CastleUi"
import Modeload from "../components/helpers/Modeload"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Mobile 3D Scene Error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center p-8">
            <h2 className="text-xl mb-4">Unable to load 3D scene on your device</h2>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const MOBILE_CANVAS_CONFIG = {
  gl: {
    antialias: false,
    powerPreference: "default",
    stencil: false,
    depth: true,
    alpha: false,
  },
  dpr: 1,
  camera: {
    fov: 60,
    near: 0.1,
    far: 1000,
    position: [15.9, 6.8, -11.4],
  },
  shadows: false,
}

const CameraController = ({ cameraRef }) => {
  const { camera } = useThree()

  useEffect(() => {
    if (cameraRef) {
      cameraRef.current = {
        goToHome: () => {
          camera.position.set(15.9, 6.8, -11.4)
          camera.lookAt(0, 0, 0)
          camera.updateProjectionMatrix()
        }
      }
    }
  }, [camera, cameraRef])

  return null
}

const MobileSceneContent = React.memo(({ onSectionChange }) => {
  return (
    <>
      <Environment
        files={"/images/VinoSkyV1.hdr"}
        resolution={128}
        background={true}
        backgroundBlurriness={0}
        environmentIntensity={1.0}
        environmentRotation={[0, Math.PI / 2, 0]}
      />

      <Environment
        preset="sunset"
        environmentIntensity={4.0}
        environmentRotation={[0, Math.PI / 2, 0]}
      />

      <Castle
        activeSection="nav"
        scale={[2, 2, 2]}
      />

      {/* <Pole
        position={[-0.8, 0, 5.8]}
        scale={[0.6, 0.6, 0.6]}
        onSectionChange={onSectionChange}
      /> */}

      <ambientLight intensity={0.5} />
    </>
  )
})


const ExperienceMobile = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const cameraRef = useRef(null)

  const handleSectionChange = (index, sectionName) => {
    setCurrentSection(index)
  }

  // Handle start button from loading screen
  const handleStart = () => {
    setIsLoaded(true)
  }

  if (!isLoaded) {
    return (
      <div className="relative w-full h-screen">
        <Canvas>
          <Modeload onStart={handleStart} />
        </Canvas>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen">
      <ErrorBoundary>
        <div className="absolute inset-0 z-0">
          <Canvas {...MOBILE_CANVAS_CONFIG} className="w-full h-full">
            <Suspense fallback={null}>
              <CameraController cameraRef={cameraRef} />
              <MobileSceneContent onSectionChange={handleSectionChange} />
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

export default ExperienceMobile
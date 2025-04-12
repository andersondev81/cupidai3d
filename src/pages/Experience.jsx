import {
  useMask,
  useGLTF,
  Environment,
  Points,
  PointMaterial,
  Sparkles,
} from "@react-three/drei"
import { Canvas, useThree } from "@react-three/fiber"
import { Perf } from "r3f-perf"
import React, { Suspense, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import Castle from "../assets/models/Castle"
import { CastleUi } from "../assets/models/CastleUi"
import { Flowers } from "../assets/models/Flowers"
import { Pole } from "../assets/models/Pole"
import { Stairs } from "../assets/models/Stairs"
import { CAMERA_CONFIG } from "../components/cameraConfig"
import { EffectsTree } from "../components/helpers/EffectsTree"
import { CloudGroup } from "../assets/models/CloudsGroup"
import AtmIframe from "../assets/models/AtmIframe"
import MirrorIframe from "../assets/models/MirrorIframe"
import Orb from "../assets/models/Orb"
import EnvMapLoader from "../components/helpers/EnvMapLoader"
import Modeload from "../components/helpers/Modeload"
import StarParticles from "../components/StarParticles"

// Constants
const CANVAS_CONFIG = {
  gl: {
    antialias: false,
    powerPreference: "high-performance",
    stencil: true,
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
  shadows: false,
}

// Components
const CloudMask = React.memo(() => {
  const stencil = useMask(1, true)
  const { scene } = useGLTF("/models/castleClouds.glb")

  useEffect(() => {
    scene.traverse(obj => {
      if (obj.isMesh) {
        obj.material = new THREE.MeshBasicMaterial({
          ...stencil,
          colorWrite: false,
        })
      }
    })
  }, [scene, stencil])

  return (
    <primitive object={scene} position={[0, 0, 0]} scale={1} visible={false} />
  )
})

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("3D Scene Error:", error, errorInfo)
  }

  handleReload = () => window.location.reload()

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center p-8">
            <h2 className="text-xl mb-4">Unable to load 3D scene</h2>
            <button
              onClick={this.handleReload}
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

const useCameraAnimation = (section, cameraRef) => {
  const { camera } = useThree()
  const animationRef = useRef({
    progress: 0,
    isActive: false,
    startPosition: new THREE.Vector3(),
    startRotation: new THREE.Euler(),
    startFov: 50,
    lastTime: 0,
  })

  useEffect(() => {
    if (!camera) return

    const sectionKey = section in CAMERA_CONFIG.sections ? section : "intro"
    const config = CAMERA_CONFIG.sections[sectionKey]

    const easing = t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

    const updateAnimationState = () => {
      animationRef.current = {
        ...animationRef.current,
        isActive: true,
        startPosition: camera.position.clone(),
        startRotation: camera.rotation.clone(),
        startFov: camera.fov,
        lastTime: performance.now(),
        config,
      }
    }

    updateAnimationState()

    let animationFrameId

    const animate = currentTime => {
      if (window.blockAllCameraMovement) return
      if (!animationRef.current.isActive) return

      const deltaTime = Math.min(
        (currentTime - animationRef.current.lastTime) / 1000,
        0.1
      )
      animationRef.current.lastTime = currentTime

      const transitionSpeed = 1.5
      animationRef.current.progress += deltaTime * transitionSpeed
      const t = Math.min(animationRef.current.progress, 1)
      const { config, startPosition, startFov } = animationRef.current

      const curveValue = easing(t)

      const targetPosition = new THREE.Vector3().lerpVectors(
        startPosition,
        config.position,
        curveValue
      )

      const targetFov = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(
          startFov,
          Math.min(config.fov || 50, 55),
          curveValue
        ),
        35,
        60
      )

      camera.position.copy(targetPosition)
      camera.fov = targetFov
      camera.updateProjectionMatrix()

      if (t < 1) {
        animationFrameId = requestAnimationFrame(animate)
      } else {
        animationRef.current.isActive = false
        animationRef.current.progress = 0
        camera.fov = Math.min(config.fov || 50, 55)
        camera.updateProjectionMatrix()
      }
    }

    animationFrameId = requestAnimationFrame(animate)

    if (cameraRef) {
      cameraRef.current = {
        goToHome: () => {
          updateAnimationState()
          animationRef.current.config = {
            position: new THREE.Vector3(15.9, 6.8, -11.4),
            fov: 50,
            transition: { fovMultiplier: 0, zOffset: 0 },
          }
          requestAnimationFrame(animate)
        },
      }
    }

    return () => {
      cancelAnimationFrame(animationFrameId)
      animationRef.current.isActive = false
    }
  }, [section, camera, cameraRef])
}

const SceneController = React.memo(({ section, cameraRef }) => {
  const { camera } = useThree()
  useCameraAnimation(section, cameraRef)

  useEffect(() => {
    window.threeCamera = camera
    return () => {
      delete window.threeCamera
    }
  }, [camera])

  return (
    <>
      <EnvMapLoader />
      {process.env.NODE_ENV !== "development" && <Perf position="top-left" />}
    </>
  )
})

const PrimaryContent = React.memo(({ activeSection, onSectionChange }) => (
  <>
    <EffectsTree />
    <Castle
      activeSection={activeSection}
      scale={[2, 1.6, 2]}
      onCustomCamera={handleCustomCameraPosition}
    />
    <Flowers />
    <Stairs />
    <Orb />
    <Pole
      position={[-0.8, 0, 5.8]}
      scale={[0.6, 0.6, 0.6]}
      onSectionChange={onSectionChange}
    />
  </>
))

const SecondaryContent = React.memo(() => (
  <>
    <CloudMask />
    <CloudGroup
      commonProps={
        {
          // concentration: 1.2,
          // sizeAttenuation: false,
          // color: "#ffffff",
          // depthWrite: false,
          // stencilRef: 1, // Adicione esta linha
          // stencilWrite: true, // E esta
          // stencilFunc: THREE.EqualStencilFunc, // E esta
        }
      }
      clouds={[
        //Front clouds
        {
          position: [0, 0, 4.3],
          bounds: [9, 1, 1],
          // scale: [0.4, 0.4, 0.4]
        },
        // right side
        { position: [0.3, 0, 3.85], rotation: [0, 1.8, 0] },
        { position: [1.15, 0.1, 2.8], rotation: [0, Math.PI / 6, 0] },
        { position: [2.25, 0.05, 2], rotation: [0, Math.PI / 3, 0] },
        { position: [2.65, 0.1, 0.5], rotation: [0, Math.PI / 2, 0] },
        { position: [2.9, 0.1, -1.6], rotation: [0, Math.PI / 2, 0] },

        // rear side
        { position: [1.85, 0.1, -2.5], rotation: [0, -Math.PI / 4, 0] },
        { position: [1, 0.2, -3.5], rotation: [Math.PI, 0, 0] },
        { position: [-0.7, 0.15, -3.5], rotation: [Math.PI, 0, 0] },
        { position: [-1.85, 0.1, -2.45], rotation: [0, 0.6, 0] },
        //left side
        { position: [-2.65, 0.1, -1], rotation: [0, 1.65, Math.PI] },
        { position: [-2.85, 0.1, 0.4], rotation: [Math.PI, 1.6, Math.PI] },
        { position: [-2.1, 0.1, 2.4], rotation: [0, -1, 0] },
        { position: [-1.5, 0.1, 2.6], rotation: [0, -0.3, 0] },
        { position: [-0.3, 0, 3.95], rotation: [0, -1.7, 0] },
        // //line 1 left
        //{ position: [-1, -0.6, 5.85] ,bounds: [1, 1, 1]}
        // { position: [-1.4, -0.5, 2] },
        // { position: [-2.4, -0.4, 1] },
        // { position: [-2.5, -0.3, -0.5] },
        // { position: [-2.4, -0.3, -2] },

        // // line 2 left
        // { position: [-3.6, -0.3, 1] },
        // { position: [-4.2, -0.3, -0.5] },
        // { position: [-3.6, -0.3, -2] },
        // //Back clouds
        // { position: [0, -0.3, -2.2] },
      ]}
    />
  </>
))

const TertiaryContent = React.memo(() => (
  <>
    <MirrorIframe />
  </>
))

const SceneContent = React.memo(({ activeSection, onSectionChange }) => {
  const [loadingStage, setLoadingStage] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setLoadingStage(1), 100),
      setTimeout(() => setLoadingStage(2), 1000),
    ]
    return () => timers.forEach(timer => clearTimeout(timer))
  }, [])

  return (
    <>
      <Sparkles
        count={200}
        size={3}
        speed={0}
        color="#f0a0ff" // Roxo claro
        opacity={0.7}
        scale={[10, 8, 10]}
        position={[0, 8, 0]}
        noise={2}
      />

      <EffectsTree />
      <StarParticles
        count={150}
        size={4}
        color="#ffd700"
        position={[0, 15, -10]}
        scale={[40, 40, 40]}
      />
      <Environment
        files="/public/images/bg1.hdr"
        background
        ground={{
          height: 5,
          radius: 20,
          scale: 14,
        }}
      />

      <PrimaryContent
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />
      {loadingStage >= 1 && <SecondaryContent />}
      {loadingStage >= 2 && <TertiaryContent />}
    </>
  )
})

const handleCustomCameraPosition = (position, target) => {
  if (cameraRef.current && cameraRef.current.camera) {
    cameraRef.current.camera.position.set(...position)
    cameraRef.current.camera.lookAt(...target)
    cameraRef.current.camera.updateProjectionMatrix()
  }
}

const Experience = () => {
  const [isStarted, setIsStarted] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const [activeSection, setActiveSection] = useState("intro")
  const cameraRef = useRef(null)

  const handleSectionChange = (index, sectionName) => {
    setCurrentSection(index)
    setActiveSection(sectionName)
  }

  useEffect(() => {
    window.customCameraNavigation = handleCustomCameraPosition
    window.onSectionChange = handleSectionChange

    const handleSectionChangeEvent = event => {
      if (event.detail?.sectionIndex !== undefined) {
        handleSectionChange(event.detail.sectionIndex, event.detail.sectionName)
      }
    }

    const forceAudioPlay = () => {
      if (window.audioManager) {
        window.audioManager.startAmbient()
      }
      document.removeEventListener("click", forceAudioPlay)
    }

    window.addEventListener("sectionChange", handleSectionChangeEvent)
    document.addEventListener("click", forceAudioPlay)

    return () => {
      window.removeEventListener("sectionChange", handleSectionChangeEvent)
      document.removeEventListener("click", forceAudioPlay)
      delete window.customCameraNavigation
      delete window.onSectionChange
    }
  }, [])

  const handleStart = () => setIsStarted(true)

  if (!isStarted) {
    return (
      <div className="relative w-full h-screen">
        <Canvas dpr={1}>
          <Modeload onStart={handleStart} />
        </Canvas>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen">
      <ErrorBoundary>
        <div className="absolute inset-0 z-0">
          <Canvas {...CANVAS_CONFIG} className="w-full h-full" dpr={1}>
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
  )
}

export default Experience

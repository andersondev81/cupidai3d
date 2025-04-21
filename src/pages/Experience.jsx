import { Perf } from "r3f-perf"
import React, { Suspense, useState, useEffect, useCallback, useRef } from "react"
import { useGLTF, Environment, Sparkles, useMask } from "@react-three/drei"
import { Canvas, useThree } from "@react-three/fiber"
import * as THREE from "three"

// Assets & Models
import Castle from "../assets/models/Castle"
import { CastleUi } from "../assets/models/CastleUi"
import { Flowers } from "../assets/models/Flowers"
import { Pole } from "../assets/models/Pole"
import { Stairs } from "../assets/models/Stairs"
import { CloudGroup } from "../assets/models/CloudsGroup"
import AtmIframe from "../assets/models/AtmIframe"
import MirrorIframe from "../assets/models/MirrorIframe"
import Orb from "../assets/models/Orb"

// Helpers & Configs
import { CAMERA_CONFIG } from "../components/cameraConfig"
import { EffectsTree } from "../components/helpers/EffectsTree"
import EnvMapLoader from "../components/helpers/EnvMapLoader"
import Canvasload from "../components/helpers/Canvasload"

// Mobile Detection Hook
const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      setIsMobile(mobileRegex.test(userAgent) || window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

// Canvas Configuration
const getCanvasConfig = isMobile => ({
  dpr: isMobile ? 1 : 1.5,
  gl: {
    antialias: false,
    powerPreference: isMobile ? "low-power" : "high-performance",
    alpha: false,
    depth: true,
    stencil: true,
  },
  performance: { min: 0.1 },
  camera: {
    fov: 50,
    near: 0.1,
    far: 1000,
    position: [15.9, 6.8, -11.4],
  },
  shadows: !isMobile,
})

// Cloud Mask Component that uses loaded assets
const CloudMask = React.memo(({ loadedAssets }) => {
  const stencil = useMask(1, true)
  // Use pre-loaded model if available
  const cloudModel = loadedAssets?.models?.clouds?.scene || useGLTF("/models/castleClouds.glb").scene

  useEffect(() => {
    if (!cloudModel) return

    cloudModel.traverse(obj => {
      if (obj.isMesh) {
        obj.material = new THREE.MeshBasicMaterial({
          ...stencil,
          colorWrite: false,
        })
      }
    })
  }, [cloudModel, stencil])

  if (!cloudModel) return null

  return (
    <primitive object={cloudModel.clone()} position={[0, 0, 0]} scale={1} visible={false} />
  )
})

// Camera Animation Hook
const useCameraAnimation = (section, cameraRef) => {
  const { camera } = useThree()
  const animationRef = React.useRef({
    progress: 0,
    isActive: false,
    startPosition: new THREE.Vector3(),
    startFov: 50,
    lastTime: 0,
    config: null,
  })

  useEffect(() => {
    if (!camera) return

    const config =
      CAMERA_CONFIG.sections[section] || CAMERA_CONFIG.sections["intro"]
    const ease = t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

    const setAnimationStart = () => {
      animationRef.current = {
        ...animationRef.current,
        isActive: true,
        startPosition: camera.position.clone(),
        startFov: camera.fov,
        lastTime: performance.now(),
        config,
      }
    }

    const animate = now => {
      if (window.blockAllCameraMovement || !animationRef.current.isActive)
        return

      const { startPosition, startFov, config } = animationRef.current
      const delta = Math.min((now - animationRef.current.lastTime) / 1000, 0.1)
      animationRef.current.lastTime = now
      animationRef.current.progress += delta * 1.5

      const t = Math.min(animationRef.current.progress, 1)
      const k = ease(t)

      camera.position.lerpVectors(startPosition, config.position, k)
      camera.fov = THREE.MathUtils.clamp(
        THREE.MathUtils.lerp(startFov, Math.min(config.fov || 50, 55), k),
        35,
        60
      )
      camera.updateProjectionMatrix()

      if (t < 1) {
        requestAnimationFrame(animate)
      } else {
        animationRef.current.isActive = false
        animationRef.current.progress = 0
        camera.fov = Math.min(config.fov || 50, 55)
        camera.updateProjectionMatrix()
      }
    }

    const timeout = setTimeout(() => {
      setAnimationStart()
      requestAnimationFrame(animate)
    }, 50)

    if (cameraRef) {
      cameraRef.current = {
        goToHome: () => {
          setAnimationStart()
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
      clearTimeout(timeout)
      animationRef.current.isActive = false
    }
  }, [section, camera, cameraRef])
}

// Scene Controller Component
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
      {process.env.NODE_ENV !== "production" && <Perf position="top-left" />}
    </>
  )
})

// Scene Content Components with loaded assets
const PrimaryContent = React.memo(({ activeSection, onSectionChange, loadedAssets }) => (
  <>
    <Environment
      files="/images/bg1.hdr"
      background
      resolution={256}
      ground={{ height: 5, radius: 20, scale: 14 }}
    />
    <EffectsTree />
    <Castle
      activeSection={activeSection}
      scale={[2, 1.6, 2]}
      loadedAssets={loadedAssets}
    />
    <Flowers />
    <Stairs />
    <Orb loadedAssets={loadedAssets} />
    <Pole
      position={[-0.8, 0, 5.8]}
      scale={[0.6, 0.6, 0.6]}
      onSectionChange={onSectionChange}
    />
  </>
))

const SecondaryContent = React.memo(({ loadedAssets }) => (
  <>
   <CloudMask loadedAssets={loadedAssets} />
   <CloudGroup
      commonProps={{
        concentration: 1.2,
        sizeAttenuation: false,
        color: "#ffffff",
        depthWrite: false,
        stencilRef: 1,
        stencilWrite: true,
        stencilFunc: THREE.EqualStencilFunc,
      }}
      clouds={[
        //Front clouds
        {
          position: [0, 0, 4.3],
          bounds: [9, 1, 1],
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
      ]}
    />
  </>
))

const TertiaryContent = React.memo(() => <MirrorIframe />)

// Scene Content Wrapper
const SceneContent = React.memo(({
  activeSection,
  onSectionChange,
  onSceneLoaded,
  loadedAssets
}) => {
  useEffect(() => {
    if (onSceneLoaded) {
      onSceneLoaded()
    }
  }, [onSceneLoaded])

  return (
    <>
      <PrimaryContent
        activeSection={activeSection}
        onSectionChange={onSectionChange}
        loadedAssets={loadedAssets}
      />
      <SecondaryContent loadedAssets={loadedAssets} />
      <TertiaryContent />
    </>
  )
})

// Main Experience Component - Modified for loading system
const Experience = ({ onSceneReady, loadedAssets, isReady }) => {
  const [currentSection, setCurrentSection] = useState(0)
  const [activeSection, setActiveSection] = useState("intro")
  const [sceneLoaded, setSceneLoaded] = useState(false)
  const cameraRef = useRef(null)

  const isMobile = useMobileDetection()
  const canvasConfig = getCanvasConfig(isMobile)

  const handleSceneLoaded = useCallback(() => {
    setSceneLoaded(true)
    if (onSceneReady) {
      onSceneReady()
    }

    // Dispatch scene-ready event
    window.dispatchEvent(new CustomEvent('scene-ready'))
  }, [onSceneReady])

  const handleSectionChange = useCallback((index, sectionName) => {
    setCurrentSection(index)
    setActiveSection(sectionName)
  }, [])

  const handleCustomCameraPosition = useCallback((position, target) => {
    if (cameraRef.current?.camera) {
      cameraRef.current.camera.position.set(...position)
      cameraRef.current.camera.lookAt(...target)
      cameraRef.current.camera.updateProjectionMatrix()
    }
  }, [])

  useEffect(() => {
    window.customCameraNavigation = handleCustomCameraPosition
    window.onSectionChange = handleSectionChange

    const handleSectionChangeEvent = event => {
      if (event.detail?.sectionIndex !== undefined) {
        handleSectionChange(event.detail.sectionIndex, event.detail.sectionName)
      }
    }

    window.addEventListener("sectionChange", handleSectionChangeEvent)

    return () => {
      window.removeEventListener("sectionChange", handleSectionChangeEvent)
    }
  }, [handleSectionChange, handleCustomCameraPosition])

  return (
    <div className="relative w-full h-screen">
      <div className="absolute inset-0 z-0">
        <Canvas {...canvasConfig} className="w-full h-full">
          {/* Main scene content with loading fallback */}
          <Suspense fallback={<Canvasload insideCanvas={true} />}>
            <SceneController section={currentSection} cameraRef={cameraRef} />
            <SceneContent
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              onSceneLoaded={handleSceneLoaded}
              loadedAssets={loadedAssets}
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
          />
        </div>
      </div>
    </div>
  )
}

export default Experience
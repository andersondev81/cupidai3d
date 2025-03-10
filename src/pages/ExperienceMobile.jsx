// pages/ExperienceMobile.jsx
import { Environment } from "@react-three/drei"
import { Canvas, useThree } from "@react-three/fiber"
import React, { Suspense, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { CAMERA_CONFIG } from "../components/cameraConfig"
import Modeload from "../components/helpers/Modeload"
import WebGLCheck from "../components/WebGLCheck" // Importando do arquivo separado

// Reduzindo a quantidade de importações para inicialização mais rápida
import { EffectsTree } from "../components/helpers/EffectsTree"
import CastleModel from "../assets/models/Castle"
import { CastleUi } from "../assets/models/CastleUi"

// Configuração de Canvas otimizada para dispositivos móveis
const MOBILE_CANVAS_CONFIG = {
  gl: {
    antialias: false,
    powerPreference: "default", // Menos agressivo que "high-performance"
    stencil: false,
    depth: true,
    alpha: false,
  },
  dpr: window.devicePixelRatio > 2 ? 1 : window.devicePixelRatio, // Limita DPR para dispositivos móveis
  camera: {
    fov: 50,
    near: 0.1,
    far: 1000,
    position: [15.9, 6.8, -11.4],
  },
  shadows: false,
}

// Detector de dispositivo iOS - mais preciso que user-agent
const isIOS = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.platform) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  )
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

    // Otimização para iOS - transições mais leves
    const mobileIntensity = isIOS() ? intensity * 0.7 : intensity

    animationRef.current = {
      ...animationRef.current,
      isActive: true,
      startPosition: camera.position.clone(),
      startFov: camera.fov,
      config,
    }

    let animationFrameId
    let lastFrameTime = 0

    const animate = time => {
      if (!animationRef.current.isActive) return

      // Limita a taxa de atualização em dispositivos móveis
      const deltaTime = time - lastFrameTime
      if (isIOS() && deltaTime < 32) {
        // Aproximadamente 30fps no iOS
        animationFrameId = requestAnimationFrame(animate)
        return
      }

      lastFrameTime = time
      animationRef.current.progress += mobileIntensity
      const t = Math.min(animationRef.current.progress, 1)
      const { config, startPosition, startFov } = animationRef.current

      const curveValue = curve(t)

      // Reduz efeitos de câmera intensos no iOS
      const zOffsetScale = isIOS() ? 0.5 : 1.0
      const offsetZ = curveValue * config.transition.zOffset * zOffsetScale

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

    animationFrameId = requestAnimationFrame(animate)

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

// Scene Controller com configurações simplificadas para iOS
const SceneController = React.memo(({ section, cameraRef }) => {
  useCameraAnimation(section, cameraRef)

  return (
    <>
      <Environment
        files={"/images/VinoSkyV1.hdr"}
        resolution={isIOS() ? 128 : 256} // Resolução mais baixa para iOS
        background={true}
        backgroundBlurriness={0.1}
        environmentIntensity={0.8} // Intensidade reduzida para melhor desempenho
        preset={null}
      />

      {/* Simplificado para dispositivos móveis - usar apenas um Environment */}
      {!isIOS() && <Environment preset="sunset" environmentIntensity={0.5} />}
    </>
  )
})

// Versão simplificada do conteúdo da cena para iOS
const MobileFriendlyContent = React.memo(
  ({ activeSection, onSectionChange }) => (
    <>
      <EffectsTree mobile={isIOS()} />
      <CastleModel
        activeSection={activeSection}
        scale={[2, 2, 2]}
        optimizeForMobile={isIOS()}
      />
    </>
  )
)

// Main Experience Component
const ExperienceMobile = () => {
  const [isStarted, setIsStarted] = useState(false)
  const [webGLSupported, setWebGLSupported] = useState(true)
  const [currentSection, setCurrentSection] = useState(0)
  const [activeSection, setActiveSection] = useState("intro")
  const cameraRef = useRef(null)

  useEffect(() => {
    // Verifica se o WebGL é suportado
    const canvas = document.createElement("canvas")
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl")

    if (!gl) {
      setWebGLSupported(false)
    }
  }, [])

  const handleSectionChange = (index, sectionName) => {
    setCurrentSection(index)
    setActiveSection(sectionName)
  }

  const handleStart = () => {
    setIsStarted(true)
  }

  // Renderiza aviso se WebGL não for suportado
  if (!webGLSupported) {
    return <WebGLCheck />
  }

  if (!isStarted) {
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
      <div className="absolute inset-0 z-0">
        <Canvas {...MOBILE_CANVAS_CONFIG} className="w-full h-full">
          <Suspense fallback={null}>
            <SceneController section={activeSection} cameraRef={cameraRef} />
            <MobileFriendlyContent
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
    </div>
  )
}

export default ExperienceMobile

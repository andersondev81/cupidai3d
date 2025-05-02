import { Html, useGLTF } from "@react-three/drei"
import React, { useEffect, useState, useRef } from "react"
import * as THREE from "three"
import MirrorPage from "../../components/iframes/Mirror"

const MirrorIframe = ({ onReturnToMain, isActive, ...props }) => {
  // Estados
  const [uiState, setUiState] = useState({
    showContent: false,
    showButtons: false,
    opacity: 0,
    meshOpacity: 0, // Novo estado para a opacidade da mesh
  })

  // Referências
  const videoRef = useRef()
  const textureRef = useRef()

  // Modelo 3D
  const { nodes } = useGLTF("/models/mirrorPos.glb")

  // Inicializar textura de vídeo
  useEffect(() => {
    const video = document.createElement("video")
    video.src = "/video/Mirror.mp4"
    video.crossOrigin = "anonymous"
    video.loop = true
    video.muted = true
    video.playsInline = true
    videoRef.current = video

    const videoTexture = new THREE.VideoTexture(video)
    videoTexture.minFilter = THREE.LinearFilter
    videoTexture.magFilter = THREE.LinearFilter
    videoTexture.format = THREE.RGBFormat
    textureRef.current = videoTexture

    const playVideo = () => {
      video.play().catch(error => {
        console.warn("Auto-play prevented:", error)
      })
    }

    video.addEventListener("loadedmetadata", playVideo)

    return () => {
      video.removeEventListener("loadedmetadata", playVideo)
      videoTexture.dispose()
    }
  }, [])

  // Controlar reprodução do vídeo baseado no estado ativo
  useEffect(() => {
    if (!videoRef.current) return

    if (isActive) {
      videoRef.current.play().catch(console.warn)
    } else {
      videoRef.current.pause()
    }
  }, [isActive])

  // Efeitos para animação
  useEffect(() => {
    if (isActive) {
      activateMirror()
      return () => deactivateMirror()
    } else {
      deactivateMirror()
    }
  }, [isActive])

  // Handlers atualizados para controlar a mesh também
  const activateMirror = () => {
    setUiState(prev => ({ ...prev, showContent: true }))
    playSound("mirror")

    // Animação para a mesh
    setTimeout(() => {
      setUiState(prev => ({ ...prev, meshOpacity: 1 }))
    }, 300)

    // Animação para o conteúdo HTML
    setTimeout(() => {
      setUiState(prev => ({ ...prev, opacity: 1 }))
      setTimeout(
        () => setUiState(prev => ({ ...prev, showButtons: true })),
        600
      )
    }, 800)
  }

  const deactivateMirror = () => {
    // Animar tudo para saída
    setUiState(prev => ({
      ...prev,
      opacity: 0,
      meshOpacity: 0,
      showButtons: false,
    }))
    stopSound("mirror")

    setTimeout(() => {
      setUiState(prev => ({ ...prev, showContent: false }))
    }, 500)
  }

  const handleBackToMain = () => {
    setUiState(prev => ({
      ...prev,
      opacity: 0,
      meshOpacity: 0,
      showButtons: false,
    }))

    const source = getNavigationSource("mirror")
    handleNavigation(source)

    setTimeout(() => {
      setUiState(prev => ({ ...prev, showContent: false }))
      onReturnToMain?.(source)
    }, 500)
  }

  // Funções auxiliares (mantidas iguais)
  const playSound = sound => window.audioManager?.sounds[sound]?.play()
  const stopSound = sound => window.audioManager?.sounds[sound]?.stop()
  const getNavigationSource = page =>
    window.navigationSystem?.getNavigationSource?.(page) || "direct"
  const handleNavigation = source => {
    if (source === "direct") setTimeout(() => playSound("transition"), 50)
    if (typeof document !== "undefined")
      document.dispatchEvent(new CustomEvent("returnToCastle"))
  }

  return (
    <>
      {/* Grupo independente para a mesh (vidro do espelho) */}
      <group
        position={[-1.638, 1.524, -0.825]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.01}
      >
        <mesh geometry={nodes.glassF.geometry}>
          {textureRef.current && (
            <meshStandardMaterial
              map={textureRef.current}
              transparent={true}
              opacity={uiState.meshOpacity * 0.9} // Controlado pelo estado
              emissiveMap={textureRef.current}
              emissiveIntensity={0.5 * uiState.meshOpacity} // Também animado
              emissive={new THREE.Color(0xffffff)}
            />
          )}
        </mesh>
      </group>

      {/* Grupo completamente independente para o HTML */}
      <group
        position={[-1.6, 1.466, -0.8]}
        rotation={[0, -Math.PI / 1.6, 0]}
        scale={0.0008}
        {...props}
      >
        {uiState.showContent && (
          <Html
            transform
            wrapperClass="mirror-html-wrapper"
            distanceFactor={100}
          >
            <div
              className="mirror-content"
              style={{ opacity: uiState.opacity }}
            >
              <div className="mirror-page-wrapper">
                <MirrorPage />
              </div>

              {uiState.showButtons && (
                <div className="mirror-buttons">
                  <button onClick={handleBackToMain} className="mirror-button">
                    {getNavigationSource("mirror") === "pole"
                      ? "Return to Cupid's Church"
                      : "Return to Castle"}
                  </button>
                </div>
              )}
            </div>
          </Html>
        )}
      </group>
    </>
  )
}

export default MirrorIframe

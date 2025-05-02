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
    meshOpacity: 0,
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
    } else {
      deactivateMirror()
    }
  }, [isActive])

  // Handlers atualizados para controlar a mesh também
  const activateMirror = () => {
    // Primeiro, mostrar o conteúdo (ainda com opacidade 0)
    setUiState(prev => ({ ...prev, showContent: true }))
    playSound("mirror")

    // Adicionar um pequeno delay antes de iniciar a animação da mesh
    setTimeout(() => {
      // Animação gradual para a mesh ao longo de 800ms
      const startTime = Date.now();
      const duration = 800;

      const animateMesh = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Função de easing para suavizar a transição
        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
        const easedProgress = easeOutCubic(progress);

        setUiState(prev => ({
          ...prev,
          meshOpacity: easedProgress
        }));

        if (progress < 1) {
          requestAnimationFrame(animateMesh);
        }
      };

      requestAnimationFrame(animateMesh);
    }, 800)

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
      showButtons: false
    }))
    stopSound("mirror")

    setTimeout(() => {
      setUiState(prev => ({ ...prev, showContent: false }))
    }, 800)
  }

  const handleBackToMain = () => {
    setUiState(prev => ({
      ...prev,
      opacity: 0,
      meshOpacity: 0,
      showButtons: false
    }))

    const source = getNavigationSource("mirror")
    handleNavigation(source)

    setTimeout(() => {
      setUiState(prev => ({ ...prev, showContent: false }))
      onReturnToMain?.(source)
    }, 800)
  }

  const playSound = sound => {
    if (window.audioManager?.sounds[sound]) {
      window.audioManager.sounds[sound].play()
      console.log(`Som do ${sound} iniciado`)
    }
  }

  const stopSound = sound => {
    if (window.audioManager?.sounds[sound]) {
      window.audioManager.sounds[sound].stop()
      console.log(`Som do ${sound} parado`)
    }
  }

  const getNavigationSource = page =>
    window.navigationSystem?.getNavigationSource?.(page) || "direct"

  const handleNavigation = source => {
    if (source === "direct") {
      setTimeout(() => {
        if (window.audioManager) {
          window.audioManager.play("transition")
          console.log("Som de transição reproduzido")
        }
      }, 50)
    }

    // Parar todos os sons se necessário
    if (window.audioManager?.stopAllAudio) {
      window.audioManager.stopAllAudio()
    }

    if (typeof document !== "undefined") {
      document.dispatchEvent(new CustomEvent("returnToCastle"))
    }
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
              opacity={uiState.meshOpacity * 0.9}
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
            distanceFactor={350}
          >
            <div
              className="mirror-content"
              style={{
                opacity: uiState.opacity,
                transition: "opacity 0.5s ease-in-out"
              }}
            >
              <div className="mirror-page-wrapper">
                <MirrorPage />
              </div>

              {uiState.showButtons && (
                <div
                  className="justify-center flex flex-col items-center"
                  style={{
                    opacity: uiState.showButtons ? 1 : 0,
                    transition: "opacity 0.5s ease-in-out"
                  }}
                >
                  <button
                    onClick={handleBackToMain}
                    className="text-white bg-pink-500 hover:bg-pink-600 border border-pink-400 rounded-lg px-4 py-2 mt-4"
                  >
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
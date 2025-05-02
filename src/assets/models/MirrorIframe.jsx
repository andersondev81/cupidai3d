import { Html, useGLTF } from "@react-three/drei"
import React, { useEffect, useState } from "react"
import MirrorPage from "../../components/iframes/Mirror"

const MirrorIframe = ({ onReturnToMain, isActive, ...props }) => {
  // Estados
  const [uiState, setUiState] = useState({
    showContent: false,
    showButtons: false,
    opacity: 0,
  })

  // Modelo 3D
  const { nodes } = useGLTF("/models/mirrorPos.glb")

  // Efeitos
  useEffect(() => {
    if (isActive) {
      activateMirror()
      return () => deactivateMirror()
    } else {
      deactivateMirror()
    }
  }, [isActive])

  // Handlers (mantidos iguais à versão anterior)
  const activateMirror = () => {
    setUiState(prev => ({ ...prev, showContent: true }))
    playSound("mirror")

    setTimeout(() => {
      setUiState(prev => ({ ...prev, opacity: 1 }))
      setTimeout(
        () => setUiState(prev => ({ ...prev, showButtons: true })),
        600
      )
    }, 800)
  }

  const deactivateMirror = () => {
    setUiState(prev => ({ ...prev, opacity: 0, showButtons: false }))
    stopSound("mirror")

    setTimeout(() => {
      setUiState(prev => ({ ...prev, showContent: false }))
    }, 500)
  }

  const handleBackToMain = () => {
    setUiState(prev => ({ ...prev, opacity: 0, showButtons: false }))

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
        position={[-1.638, 1.524, -0.825]} // Posição específica da mesh
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.01}
      >
        <mesh
          geometry={nodes.glassF.geometry}
          material={nodes.glassF.material}
        />
      </group>

      {/* Grupo completamente independente para o HTML */}
      <group
        position={[-1.6, 1.466, -0.8]} // Posição diferente do HTML
        rotation={[0, -Math.PI / 1.6, 0]} // Rotação levemente diferente
        scale={0.0008} // Escala diferente
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

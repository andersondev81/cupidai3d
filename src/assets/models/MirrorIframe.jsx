import { Html } from "@react-three/drei"
import React, { useEffect, useState, useRef } from "react"
import MirrorPage from "../../components/iframes/Mirror"
import MirrorBg from "../../components/iframes/MirrorBg"
import { useGLTF } from "@react-three/drei"

const MirrorIframe = ({ onReturnToMain, isActive, ...props }) => {
  const [showContent, setShowContent] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [opacity, setOpacity] = useState(0)
  const containerRef = useRef(null)
  const { nodes, materials } = useGLTF("/models/mirrorPos.glb")

  useEffect(() => {
    if (isActive) {
      setShowContent(true)

      if (window.audioManager && window.audioManager.sounds.mirror) {
        window.audioManager.play("mirror")
      }

      const fadeInTimer = setTimeout(() => {
        setOpacity(1)

        const buttonTimer = setTimeout(() => {
          setShowButtons(true)
        }, 600)

        return () => clearTimeout(buttonTimer)
      }, 800)

      return () => {
        clearTimeout(fadeInTimer)
        if (window.audioManager && window.audioManager.sounds.mirror) {
          window.audioManager.stop("mirror")
        }
      }
    } else {
      setOpacity(0)
      setShowButtons(false)

      if (window.audioManager && window.audioManager.sounds.mirror) {
        window.audioManager.stop("mirror")
      }

      const hideTimer = setTimeout(() => {
        setShowContent(false)
      }, 500)

      return () => clearTimeout(hideTimer)
    }
  }, [isActive])

  const handleBackToMain = () => {
    setShowButtons(false)
    setOpacity(0)

    const source =
      window.navigationSystem && window.navigationSystem.getNavigationSource
        ? window.navigationSystem.getNavigationSource("mirror")
        : "direct"

    if (source === "direct") {
      setTimeout(() => {
        if (window.audioManager) {
          window.audioManager.play("transition")
        } else {
          console.log("✗ audioManager não disponível")
        }
      }, 50)
    }

    if (window.audioManager && window.audioManager.sounds.mirror) {
      window.audioManager.stop("mirror")
    }

    if (window.audioManager && window.audioManager.stopAllAudio) {
      window.audioManager.stopAllAudio()
    }

    if (typeof document !== "undefined") {
      document.dispatchEvent(new CustomEvent("returnToCastle"))
    }

    setTimeout(() => {
      setShowContent(false)

      if (onReturnToMain) {
        onReturnToMain(source)
      }
    }, 500)
  }

  return (
    <group
      position={[-1.638, 1.524, -0.825]}
      rotation={[Math.PI / 2, 0, 0]}
      scale={0.01}
      {...props}
    >
      {showContent && (
        <Html
          transform
          scale={0.01}
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          className="mirror-screen"
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              transition: "opacity 0.8s ease-in-out",
              opacity: opacity,
              width: "3076px",
              height: "3076px",
            }}
          >
            {/* Adicione o MirrorBg como background */}
            {/* <div>
              <MirrorBg />
            </div> */}

            <div>
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  padding: "20px",
                  fontSize: "30px",
                  lineHeight: "1.7",
                  letterSpacing: "0.01em",
                }}
              >
                <div className="content-wrapper">
                  <MirrorPage />
                </div>
              </div>
            </div>

            <div
              className="text-center py-8"
              style={{
                opacity: showButtons ? 1 : 0,
                transition: "opacity 0.5s ease-in-out",
              }}
            >
              <button
                onClick={handleBackToMain}
                className="px-8 py-4 bg-pink-500 text-white rounded-full font-bold text-lg hover:bg-pink-600 transition-all duration-300 shadow-lg hover:shadow-pink-300"
              >
                {window.navigationSystem &&
                window.navigationSystem.getNavigationSource &&
                window.navigationSystem.getNavigationSource("mirror") === "pole"
                  ? "Return to Cupid's Church"
                  : "Return to Castle"}
              </button>
            </div>
          </div>
        </Html>
      )}
      <mesh
        geometry={nodes.glassF.geometry}
        material={nodes.glassF.material}
        position={[0, 0, -0.1]} // Ajuste a posição Z se necessário
      />
    </group>
  )
}

export default MirrorIframe

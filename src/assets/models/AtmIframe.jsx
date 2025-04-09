import { Html } from "@react-three/drei"
import React, { useEffect, useRef, useState } from "react"
import TokenPage from "../../components/iframes/Token"

const AtmIframe = ({ onReturnToMain, isActive, ...props }) => {
  const [showContent, setShowContent] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const containerRef = useRef(null)

  // Monitor changes in isActive state
  useEffect(() => {
    if (isActive) {
      // When component becomes active, show content with a small delay
      const timer = setTimeout(() => {
        setShowContent(true)
        // Show buttons after a delay to ensure content has loaded
        setTimeout(() => {
          setShowButtons(true)
        }, 500)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      // When component becomes inactive, hide content
      setShowContent(false)
      setShowButtons(false)
    }
  }, [isActive])

  // Handle navigation back to main menu with navigation source
  const handleHomeNavigation = () => {
    // First hide buttons for visual feedback
    setShowButtons(false)
    console.log("Botão de retorno clicado")

    // Primeiro, pare o som do mirror
    if (window.audioManager && window.audioManager.sounds.mirror) {
      window.audioManager.stop("mirror")
      console.log("Som do mirror parado (retorno ao main)")
    }

    // Verificar se precisamos parar todos os sons
    if (window.audioManager && window.audioManager.stopAllAudio) {
      window.audioManager.stopAllAudio()
      console.log("Todos os sons parados")
    }
    // Hide content after a short delay
    setTimeout(() => {
      setShowContent(false)

      // Get the navigation source
      const source =
        window.navigationSystem && window.navigationSystem.getNavigationSource
          ? window.navigationSystem.getNavigationSource("atm")
          : "direct"

      console.log(`ATM iframe returning with source: ${source}`)

      // Additional delay to complete visual transitions
      setTimeout(() => {
        // Call the callback function provided by parent component
        if (onReturnToMain) {
          onReturnToMain(source)
        }
      }, 100)
    }, 100)
  }

  const containerStyle = {
    width: "100%",
    height: "100%",
    position: "relative",
    pointerEvents: showContent ? "auto" : "none",
    backgroundColor: "transparent",
  }

  const contentStyle = {
    width: "100%",
    height: "100%",
    border: "none",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "transparent",
  }

  const buttonContainerStyle = {
    position: "absolute",
    bottom: "30px",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    zIndex: 1000,
  }

  return (
    <group
      position={[1.675, 1.185, 0.86]}
      rotation={[1.47, 0.194, -1.088]}
      {...props}
    >
      {/* HTML content - only shown when isActive is true */}
      {showContent && (
        <Html
          ref={containerRef}
          transform
          wrapperClass="atm-screen"
          distanceFactor={0.19}
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          style={{
            pointerEvents: isActive ? "auto" : "none",
            backgroundColor: "transparent",
          }}
        >
          <div style={containerStyle}>
            {/* Token page content */}
            <div style={contentStyle}>
              <TokenPage />
            </div>

            {/* Navigation buttons - exact styling from original */}
            {showButtons && (
              <div
                className="flex flex-col items-center gap-6"
                style={buttonContainerStyle}
              >
                <div className="flex gap-4">
                  <button
                    onClick={handleHomeNavigation}
                    className="bg-gray-500 hover:bg-gray-600 text-white pointer-events-auto flex items-center justify-center rounded-md px-6 py-3 transition-all"
                  >
                    {window.navigationSystem &&
                    window.navigationSystem.getNavigationSource &&
                    window.navigationSystem.getNavigationSource("atm") ===
                      "pole"
                      ? "Return to Cupid's Church"
                      : "Return to Castle"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}

export default AtmIframe

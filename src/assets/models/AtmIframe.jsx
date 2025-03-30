import { Html } from "@react-three/drei"
import React, { useEffect, useRef, useState } from "react"
import TokenPage from "../../components/iframes/Token"

// Animation timing constants
const ANIMATION_TIMING = {
  CONTENT_DELAY: 300,
  BUTTONS_DELAY: 500,
  TRANSITION_DELAY: 100,
}

export default function AtmIframe({
  onReturnToMain,
  isActive,
  cameraRef,
  onSectionChange,
  navigationSource = "pole", // Add this parameter with default value
  ...props
}) {
  const [showContent, setShowContent] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const containerRef = useRef(null)

  // Handle component activation/deactivation
  useEffect(() => {
    let contentTimer = null
    let buttonsTimer = null

    if (isActive) {
      // When component becomes active, show content with a delay
      contentTimer = setTimeout(() => {
        setShowContent(true)

        // Show buttons after content has loaded
        buttonsTimer = setTimeout(() => {
          setShowButtons(true)
        }, ANIMATION_TIMING.BUTTONS_DELAY)
      }, ANIMATION_TIMING.CONTENT_DELAY)
    } else {
      // When component becomes inactive, hide buttons and content
      setShowButtons(false)
      setShowContent(false)
    }

    // Cleanup timers on unmount or state change
    return () => {
      clearTimeout(contentTimer)
      clearTimeout(buttonsTimer)
    }
  }, [isActive])

  // Handle navigation back to main menu with navigation source
  const handleHomeNavigation = () => {
    // First hide buttons for visual feedback
    setShowButtons(false)

    // Hide content after a short delay
    setTimeout(() => {
      setShowContent(false)

      // Additional delay to complete visual transitions
      setTimeout(() => {
        // Pass the navigation source to the callback
        if (onReturnToMain) {
          console.log(`ATM iframe returning with source: ${navigationSource}`)
          onReturnToMain(navigationSource)
        } else {
          // Legacy fallbacks if onReturnToMain isn't available
          if (cameraRef?.goToHome) {
            cameraRef.goToHome()
          }

          if (onSectionChange) {
            onSectionChange(0, "nav")
          }
        }
      }, ANIMATION_TIMING.TRANSITION_DELAY)
    }, ANIMATION_TIMING.TRANSITION_DELAY)
  }

  // Styles
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
    <group {...props} dispose={null}>
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

            {/* Navigation buttons - text changes based on navigation source */}
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
                    {navigationSource === "direct" ? "Return to Castle" : "Main Menu"}
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
import { Html, useGLTF } from "@react-three/drei";
import React, { useEffect, useState } from "react";
import RoadmapPage from "../../components/iframes/Roadmap";
import audioManager from "./AudioManager";

export default function ScrollIframe({
  onReturnToMain,
  isActive = false,
  ...props
}) {
  const { nodes } = useGLTF("/models/scrollframe.glb");
  const [showContent, setShowContent] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  // Monitor changes in isActive state
  useEffect(() => {
    if (isActive) {
      // When component becomes active, show content with a small delay
      const timer = setTimeout(() => {
        setShowContent(true);
        // Show buttons after a delay to ensure content has loaded
        setTimeout(() => {
          setShowButtons(true);
        }, 500);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      // When component becomes inactive, hide content
      setShowButtons(false);
      setShowContent(false);
    }
  }, [isActive]);

  // Check navigation source when handling return
  const handleBackToMain = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    // Hide UI for visual feedback
    setShowButtons(false)
    setShowContent(false)

    // Get the navigation source from the system
    const source = window.navigationSystem &&
                  window.navigationSystem.getNavigationSource ?
                  window.navigationSystem.getNavigationSource('scroll') : 'direct'

    // FIXED CONDITION: Play transition sound for direct navigation
    if (source === "direct") {
      // Use timeout to ensure the sound plays
      setTimeout(() => {
        if (window.audioManager) {
          window.audioManager.play("transition")
        }
      }, 50)
    }

    // Stop current sounds
    if (window.audioManager && window.audioManager.sounds.scroll) {
      window.audioManager.stop('scroll')
    }

    // Verificar se precisamos parar todos os sons
    if (window.audioManager && window.audioManager.stopAllAudio) {
      window.audioManager.stopAllAudio()
    }

    // Short delay to let the UI update first
    setTimeout(() => {
      if (onReturnToMain) {
        onReturnToMain(source)
      }
    }, 300)
  };

  return (
    <group
      position={[-1.805, 1.168, 0.908]}
      rotation={[-3.142, 1.051, -1.568]}
      {...props}
    >
      {/* HTML content - only shown when isActive is true */}
      {showContent && (
        <Html
          transform
          scale={0.01}
          position={[0, 0, 0]}
          rotation={[0, Math.PI, 1.568]}
          className="scroll-content"
          prepend={true}
          zIndexRange={[100, 0]}
        >
          <div
            style={{
              width: "900px",
              height: "1160px",
              overflow: "hidden",
              position: "relative",
              transition: "opacity 0.3s ease",
              opacity: showContent ? 1 : 0,
            }}
          >
            {/* Scrollable container */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflowY: "scroll",
                overflowX: "hidden",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {/* Content container */}
              <div
                style={{
                  width: "100%",
                  padding: "20px",
                  fontSize: "30px",
                  lineHeight: "1.7",
                  letterSpacing: "0.01em",
                }}
              >
                <RoadmapPage />
              </div>

              {/* Space for the fixed button */}
              <div style={{ height: "100px" }}></div>
            </div>

            {/* Button with text that changes based on navigation source */}
            {showButtons && (
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  zIndex: 10,
                }}
              >
                <button
                  onClick={handleBackToMain}
                  style={{
                    padding: "16px 32px",
                    fontSize: "18px",
                    backgroundColor: "#ec4899",
                    color: "white",
                    border: "none",
                    borderRadius: "9999px",
                    fontWeight: "bold",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    zIndex: 20,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = "#db2777";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(236, 72, 153, 0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = "#ec4899";
                    e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  {window.navigationSystem &&
                   window.navigationSystem.getNavigationSource &&
                  //  audioManager.play("transition") &&
                   window.navigationSystem.getNavigationSource('scroll') === 'pole'
                    ? "Return to Cupid's Church"
                    : "Return to Castle"}
                </button>
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

useGLTF.preload("/models/scrollframe.glb");
import { Html, useGLTF } from "@react-three/drei";
import React, { useEffect, useState, useRef } from "react";
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
  const [opacity, setOpacity] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      setShowContent(true);

      if (window.audioManager && window.audioManager.sounds.scroll) {
        window.audioManager.play('scroll');
      }
      if (window.audioManager && window.audioManager.sounds.paper) {
        window.audioManager.play('paper');
      }

      const fadeInTimer = setTimeout(() => {
        setOpacity(1);

        const buttonTimer = setTimeout(() => {
          setShowButtons(true);
        }, 600);

        return () => clearTimeout(buttonTimer);
      }, 800);

      return () => {
        clearTimeout(fadeInTimer);
        if (window.audioManager && window.audioManager.sounds.scroll) {
          window.audioManager.stop('scroll');
        }
        if (window.audioManager && window.audioManager.sounds.paper) {
          window.audioManager.stop('paper');
        }
      };
    } else {
      setOpacity(0);
      setShowButtons(false);
      if (window.audioManager && window.audioManager.sounds.scroll) {
        window.audioManager.stop('scroll');
      }
      if (window.audioManager && window.audioManager.sounds.paper) {
        window.audioManager.stop('paper');
      }

      const hideTimer = setTimeout(() => {
        setShowContent(false);
      }, 500);

      return () => clearTimeout(hideTimer);
    }
  }, [isActive]);

  const handleBackToMain = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setShowButtons(false);

    setOpacity(0);

    const source = window.navigationSystem &&
                  window.navigationSystem.getNavigationSource ?
                  window.navigationSystem.getNavigationSource('scroll') : 'direct';

    if (source === "direct") {
      setTimeout(() => {
        if (window.audioManager) {
          window.audioManager.play("transition");
        }
      }, 50);
    }

    if (window.audioManager && window.audioManager.sounds.scroll) {
      window.audioManager.stop('scroll');
    }

    if (window.audioManager && window.audioManager.stopAllAudio) {
      window.audioManager.stopAllAudio();
    }

    setTimeout(() => {
      setShowContent(false);

      if (onReturnToMain) {
        onReturnToMain(source);
      }
    }, 500);
  };

  return (
    <group
      position={[-1.805, 1.168, 0.908]}
      rotation={[-3.142, 1.051, -1.568]}
      {...props}
    >
      {showContent && (
        <Html
          ref={containerRef}
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
              transition: "opacity 0.8s ease-in-out",
              opacity: opacity,
            }}
          >
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

              <div style={{ height: "100px" }}></div>
            </div>

            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: 0,
                right: 0,
                textAlign: "center",
                zIndex: 10,
                opacity: showButtons ? 1 : 0,
                transition: "opacity 0.5s ease-in-out",
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
                 window.navigationSystem.getNavigationSource('scroll') === 'pole'
                  ? "Return to Cupid's Church"
                  : "Return to Castle"}
              </button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

useGLTF.preload("/models/scrollframe.glb");
import { Html } from "@react-three/drei"
import React, { useEffect, useRef, useState } from "react"
import TokenPage from "../../components/iframes/Token"

const ANIMATION_CONFIG = {
  fadeInDelay: 300,
  buttonsDelay: 300,
  fadeOutDelay: 350,

  fadeTransitionDuration: "0.4s",
  buttonTransitionDuration: "0.3s"
};

const AtmIframe = ({ onReturnToMain, isActive, ...props }) => {
  const [showContent, setShowContent] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      setShowContent(true);

      if (window.audioManager && window.audioManager.sounds.atm) {
        window.audioManager.play('atm');
      }

      const fadeInTimer = setTimeout(() => {
        setOpacity(1);

        const buttonTimer = setTimeout(() => {
          setShowButtons(true);
        }, ANIMATION_CONFIG.buttonsDelay);

        return () => clearTimeout(buttonTimer);
      }, ANIMATION_CONFIG.fadeInDelay);

      return () => {
        clearTimeout(fadeInTimer);
        if (window.audioManager && window.audioManager.sounds.atm) {
          window.audioManager.stop('atm');
        }
      };
    } else {
      setOpacity(0);
      setShowButtons(false);

      if (window.audioManager && window.audioManager.sounds.atm) {
        window.audioManager.stop('atm');
      }

      const hideTimer = setTimeout(() => {
        setShowContent(false);
      }, ANIMATION_CONFIG.fadeOutDelay);

      return () => clearTimeout(hideTimer);
    }
  }, [isActive]);

  const handleHomeNavigation = () => {
    setShowButtons(false);
    setOpacity(0);

    const source = window.navigationSystem && window.navigationSystem.getNavigationSource
      ? window.navigationSystem.getNavigationSource("atm")
      : "direct";

    if (source === "direct") {
      setTimeout(() => {
        if (window.audioManager) {
          window.audioManager.play("transition");
        }
      }, 50);
    }

    if (window.audioManager && window.audioManager.sounds.atm) {
      window.audioManager.stop("atm");
    }

    if (window.audioManager && window.audioManager.stopAllAudio) {
      window.audioManager.stopAllAudio();
    }

    setTimeout(() => {
      setShowContent(false);

      if (onReturnToMain) {
        onReturnToMain(source);
      }
    }, ANIMATION_CONFIG.fadeOutDelay);
  };

  const containerStyle = {
    width: "100%",
    height: "100%",
    position: "relative",
    pointerEvents: showContent ? "auto" : "none",
    backgroundColor: "transparent",
    opacity: opacity,
    transition: `opacity ${ANIMATION_CONFIG.fadeTransitionDuration} ease-in-out`,
  };

  const contentStyle = {
    width: "100%",
    height: "100%",
    border: "none",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "transparent",
  };

  const buttonContainerStyle = {
    position: "absolute",
    bottom: "30px",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    zIndex: 1000,
    opacity: showButtons ? 1 : 0,
    transition: `opacity ${ANIMATION_CONFIG.buttonTransitionDuration} ease-in-out`,
  };

  return (
    <group
      position={[1.675, 1.185, 0.86]}
      rotation={[1.47, 0.194, -1.088]}
      {...props}
    >
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
            <div style={contentStyle}>
              <TokenPage />
            </div>

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
          </div>
        </Html>
      )}
    </group>
  );
};

export default AtmIframe;
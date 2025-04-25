import { Html } from "@react-three/drei";
import React, { useEffect, useState, useRef } from "react";
import MirrorPage from "../../components/iframes/Mirror";

const ANIMATION_CONFIG = {
  fadeInDelay: 700,
  buttonsDelay: 300,
  fadeOutDelay: 300,

  fadeTransitionDuration: "0.4s",
  buttonTransitionDuration: "0.3s"
};

const MirrorIframe = ({ onReturnToMain, isActive, ...props }) => {
  const [showContent, setShowContent] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      setShowContent(true);

      if (window.audioManager && window.audioManager.sounds.mirror) {
        window.audioManager.play('mirror');
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
        if (window.audioManager && window.audioManager.sounds.mirror) {
          window.audioManager.stop('mirror');
        }
      };
    } else {
      setOpacity(0);
      setShowButtons(false);

      if (window.audioManager && window.audioManager.sounds.mirror) {
        window.audioManager.stop('mirror');
      }

      const hideTimer = setTimeout(() => {
        setShowContent(false);
      }, ANIMATION_CONFIG.fadeOutDelay);

      return () => clearTimeout(hideTimer);
    }
  }, [isActive]);

  const handleBackToMain = () => {
    setShowButtons(false);
    setOpacity(0);

    const source = window.navigationSystem &&
                  window.navigationSystem.getNavigationSource ?
                  window.navigationSystem.getNavigationSource('mirror') : 'direct';

    if (source === "direct") {
      setTimeout(() => {
        if (window.audioManager) {
          window.audioManager.play("transition");
        } else {
          console.log("✗ audioManager não disponível");
        }
      }, ANIMATION_CONFIG.transitionDelay);
    }

    if (window.audioManager && window.audioManager.sounds.mirror) {
      window.audioManager.stop('mirror');
    }

    if (window.audioManager && window.audioManager.stopAllAudio) {
      window.audioManager.stopAllAudio();
    }

    if (typeof document !== 'undefined') {
      document.dispatchEvent(new CustomEvent('returnToCastle'));
    }

    setTimeout(() => {
      setShowContent(false);

      if (onReturnToMain) {
        onReturnToMain(source);
      }
    }, ANIMATION_CONFIG.fadeOutDelay);
  };

  return (
    <group
      position={[-1.64, 1.450, -0.823]}
      rotation={[-1.567, -0.002, -2.037]}
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
          <div style={{
            width: "2000px",
            height: "2870px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            transition: `opacity ${ANIMATION_CONFIG.fadeTransitionDuration} ease-in-out`,
            opacity: opacity,
          }}>
            <div>
              <div style={{
                width: "100%",
                height: "100%",
                border: "none",
                padding: "20px",
                fontSize: "30px",
                lineHeight: "1.7",
                letterSpacing: "0.01em"
              }}>
                <div className="content-wrapper">
                  <MirrorPage />
                </div>
              </div>
            </div>

            <div
              className="text-center py-8"
              style={{
                opacity: showButtons ? 1 : 0,
                transition: `opacity ${ANIMATION_CONFIG.buttonTransitionDuration} ease-in-out`,
              }}
            >
              <button
                onClick={handleBackToMain}
                className="px-8 py-4 bg-pink-500 text-white rounded-full font-bold text-lg hover:bg-pink-600 transition-all duration-300 shadow-lg hover:shadow-pink-300"
              >
                {window.navigationSystem &&
                 window.navigationSystem.getNavigationSource &&
                 window.navigationSystem.getNavigationSource('mirror') === 'pole'
                  ? "Return to Cupid's Church"
                  : "Return to Castle"}
              </button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

export default MirrorIframe;
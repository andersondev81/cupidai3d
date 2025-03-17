import { Html } from "@react-three/drei";
import React, { useEffect, useRef, useState } from "react";
import TokenPage from "../../components/iframes/Token";

export default function AtmIframe({ onReturnToMain, isActive, cameraRef, onSectionChange, ...props }) {
  const [showContent, setShowContent] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const iframeContainerRef = useRef(null);

  // Monitor changes in isActive state with debugging
  useEffect(() => {
    console.log(`AtmIframe: isActive changed to ${isActive}`);

    if (isActive) {
      // When component becomes active, show content with a small delay
      console.log("AtmIframe: Activating content");
      const timer = setTimeout(() => {
        setShowContent(true);
        // Show buttons after content has loaded
        setTimeout(() => {
          setShowButtons(true);
          console.log("AtmIframe: Buttons activated");
        }, 500);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      // When component becomes inactive, hide content and buttons
      console.log("AtmIframe: Deactivating content");
      setShowButtons(false);
      setShowContent(false);
    }
  }, [isActive]);

  // Function to handle Back to Main button click - EXATAMENTE como no CastleUI
  const handleHomeNavigation = () => {
    console.log("AtmIframe: Main Menu button clicked");

    // First hide buttons for visual feedback
    setShowButtons(false);

    // Set a small delay before hiding content
    setTimeout(() => {
      setShowContent(false);

      // Pequeno delay adicional para completar transições visuais
      setTimeout(() => {
        if (cameraRef) {
          console.log("AtmIframe: Calling cameraRef.goToHome()");
          cameraRef.goToHome();
        }

        if (onSectionChange) {
          console.log("AtmIframe: Calling onSectionChange(0, 'nav')");
          onSectionChange(0, "nav");
        }

        // Manter a chamada original para compatibilidade com código existente
        if (onReturnToMain) {
          console.log("AtmIframe: Calling original onReturnToMain()");
          onReturnToMain();
        }
      }, 100);
    }, 100);
  };

  return (
    <group {...props} dispose={null}>
      {showContent && (
        <Html
          ref={iframeContainerRef}
          transform
          wrapperClass="atm-screen"
          distanceFactor={0.19}
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          style={{
            pointerEvents: isActive ? 'auto' : 'none',
            backgroundColor: 'rgba(0,0,0,0)',
            background: 'transparent'
          }}
        >
          <div style={{
            width: "100%",
            height: "100%",
            position: "relative",
            pointerEvents: showContent ? 'auto' : 'none',
            backgroundColor: 'rgba(0,0,0,0)',
            background: 'transparent'
          }}>
            {/* Container for TokenPage component */}
            <div
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: 'rgba(0,0,0,0)',
                background: 'transparent'
              }}
            >
              <TokenPage />
            </div>

            {/* Back button - Exatamente igual ao CastleUI */}
            {showButtons && (
              <div className="flex flex-col items-center gap-6" style={{
                position: "absolute",
                bottom: "30px",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                zIndex: 1000
              }}>
                <div className="flex gap-4">
                  <button
                    onClick={handleHomeNavigation}
                    className="bg-gray-500 hover:bg-gray-600 text-white pointer-events-auto flex items-center justify-center rounded-md px-6 py-3 transition-all"
                  >
                    Main Menu
                  </button>
                </div>
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
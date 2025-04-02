// First update ScrolIframe.jsx
import { Html, useGLTF } from "@react-three/drei";
import React, { useEffect, useState } from "react";
import * as THREE from "three";
import RoadmapPage from "../../components/iframes/Roadmap";

export default function ScrollIframe({
  onReturnToMain,
  isActive = false,
  navigationSource = "pole", // Default is "pole"
  ...props
}) {
  const { nodes } = useGLTF("/models/scrollframe.glb");
  const [showContent, setShowContent] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [checkerTexture, setCheckerTexture] = useState(null);

  // Debug log to verify navigation source
  useEffect(() => {
    if (isActive) {
      console.log(`ScrollIframe activated with navigation source: ${navigationSource}`);
    }
  }, [isActive, navigationSource]);

  // Monitor changes in isActive state
  useEffect(() => {
    console.log(`ScrollIframe: isActive changed to ${isActive}`);

    if (isActive) {
      // When component becomes active, show content with a small delay
      console.log("ScrollIframe: Activating content");
      const timer = setTimeout(() => {
        setShowContent(true);
        // Show buttons after a delay to ensure content has loaded
        setTimeout(() => {
          setShowButtons(true);
          console.log("ScrollIframe: Buttons activated");
        }, 500);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      // When component becomes inactive, hide content
      console.log("ScrollIframe: Deactivating content");
      setShowButtons(false);
      setShowContent(false);
    }
  }, [isActive]);

  // Simplified back navigation handler
  const handleBackToMain = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log(`ScrollIframe: Back button clicked (source: ${navigationSource})`);

    // Hide UI for visual feedback
    setShowButtons(false);
    setShowContent(false);

    // Call the callback with the navigation source
    setTimeout(() => {
      if (onReturnToMain) {
        console.log(`Returning with navigation source: ${navigationSource}`);
        onReturnToMain(navigationSource);
      }
    }, 300);
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

            {/* Button with text that changes based on source */}
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
                  {navigationSource === "direct" ? "Return to Castle" : "Return to Cupid's Church"}
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
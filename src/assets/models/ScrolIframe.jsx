import { Html, useGLTF } from "@react-three/drei";
import React, { useEffect, useState } from "react";
import * as THREE from "three";
import RoadmapPage from "../../components/iframes/Roadmap";

export default function ScrollIframe({
  onReturnToMain,
  isActive = false,
  ...props
}) {
  const { nodes } = useGLTF("/models/scrollframe.glb");
  const [showContent, setShowContent] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [checkerTexture, setCheckerTexture] = useState(null);

  // Load texture
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      (loadedTexture) => {
        loadedTexture.wrapS = THREE.RepeatWrapping;
        loadedTexture.wrapT = THREE.RepeatWrapping;
        loadedTexture.repeat.set(1, 1);
        setCheckerTexture(loadedTexture);
      },
      undefined,
      (error) => console.error("Error loading texture:", error)
    );
  }, []);

  // Creating material with texture
  const scrollMaterial = React.useMemo(() => {
    if (nodes.scroolIframe?.material) {
      // Clone original material to preserve other properties
      const newMaterial = nodes.scroolIframe.material.clone();
      // Configure material with texture when available
      if (checkerTexture) {
        newMaterial.map = checkerTexture;
        newMaterial.needsUpdate = true;
      }
      // Make material double-sided
      newMaterial.side = THREE.DoubleSide;
      return newMaterial;
    }

    // Fallback to basic material
    return new THREE.MeshStandardMaterial({
      map: checkerTexture,
      side: THREE.DoubleSide,
      roughness: 0.7,
      metalness: 0.0,
    });
  }, [nodes, checkerTexture]);

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

  // MEGA WORKAROUND: Use multiple approaches to handle the return to main
  const handleBackToMain = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log("ScrollIframe: Back button clicked");

    // Hide UI immediately for visual feedback
    setShowButtons(false);
    setShowContent(false);

    // 1. Try the callback approach first
    if (onReturnToMain && typeof onReturnToMain === 'function') {
      console.log("Method 1: Using callback");
      onReturnToMain();
    }

    // 2. Try the global navigation object as backup
    if (window.globalNavigation && window.globalNavigation.navigateTo) {
      console.log("Method 2: Using global navigation");
      window.globalNavigation.navigateTo("nav");
    }

    // 3. Try to reset all iframes
    if (window.globalNavigation && window.globalNavigation.reset) {
      console.log("Method 3: Using global reset");
      window.globalNavigation.reset();
    }

    // 4. Force a small delay and try again
    setTimeout(() => {
      console.log("Method 4: Delayed callback");
      if (onReturnToMain && typeof onReturnToMain === 'function') {
        onReturnToMain();
      }

      // 5. Add a final attempt with global navigation
      if (window.globalNavigation && window.globalNavigation.navigateTo) {
        console.log("Method 5: Delayed global navigation");
        window.globalNavigation.navigateTo("nav");
      }
    }, 100);
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
              height: "1160px", // Fixed height for the viewport
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

            {/* Multiple Back Buttons for redundancy */}
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
                {/* Main button */}
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
                  Return to Cupid's Church
                </button>

                {/* Hidden backup button that uses direct window navigation */}
                <button
                  onClick={() => {
                    console.log("Using direct global navigation");
                    if (window.globalNavigation && window.globalNavigation.navigateTo) {
                      window.globalNavigation.navigateTo("nav");
                    }
                  }}
                  style={{
                    position: "fixed",
                    top: "-9999px", // Hide it off-screen
                    left: "-9999px",
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                >
                  Emergency Return
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
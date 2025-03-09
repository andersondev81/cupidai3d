import React, { useEffect, useRef, useState } from "react";
import { useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";

export default function ScrollIframe({ onReturnToMain, isActive = false, ...props }) {
  const { nodes } = useGLTF("/models/scrollframe.glb");
  const [showContent, setShowContent] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const iframeRef = useRef(null);
  const [checkerTexture, setCheckerTexture] = useState(null);

  // Load texture
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      // "/texture/Scroll_Roughness.png",
      loadedTexture => {
        loadedTexture.wrapS = THREE.RepeatWrapping;
        loadedTexture.wrapT = THREE.RepeatWrapping;
        loadedTexture.repeat.set(1, 1);
        setCheckerTexture(loadedTexture);
      },
      undefined,
      error => console.error("Error loading texture:", error)
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
      metalness: 0.0
    });
  }, [nodes.scroolIframe?.material, checkerTexture]);

  // Monitor changes in isActive state
  useEffect(() => {
    if (isActive) {
      // When component becomes active, show content with a small delay
      const timer = setTimeout(() => {
        setShowContent(true);
        // Show buttons after a delay to ensure iframe has loaded
        setTimeout(() => {
          setShowButtons(true);
        }, 500);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      // When component becomes inactive, hide content
      setShowContent(false);
      setShowButtons(false);
    }
  }, [isActive]);

  // Function to handle Back to Main button click
  const handleBackToMain = () => {
    if (onReturnToMain) onReturnToMain();
  };

  return (
    <group {...props} dispose={null}>
      {/* Always render the scroll mesh with proper texture */}
      <mesh
        geometry={nodes.scroolIframe.geometry}
        material={scrollMaterial}
        position={[-1.805, 1.106, 0.908]}
        rotation={[-3.142, 1.051, -1.568]}
      />

      {/* HTML iframe content - only shown when isActive is true */}
      {showContent && (
        <group position={[-1.805, 1.156, 0.908]} rotation={[-3.142, 1.051, -1.568]}>
          <Html
            transform
            scale={0.01}
            position={[0, 0, 0]}
            rotation={[0, Math.PI, 1.568]}
            distanceFactor={7}
            className="iframe-container"
          >
            <div style={{
              width: "1600px",
              height: "2000px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <div style={{
                width: "90%",
                height: "90%",
                overflow: "hidden",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
              }}>
                <iframe
                  ref={iframeRef}
                  src="https://getcupid.ai/Blogs"
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    backgroundColor: "white",
                  }}
                />
              </div>

              {/* Back to Main button */}
              {showButtons && (
                <div
                  style={{
                    marginTop: "40px",
                    display: "flex",
                    gap: "12px",
                    zIndex: 1000,
                  }}
                >
                  <button
                    onClick={handleBackToMain}
                    style={{
                      padding: "12px 24px",
                      fontSize: "18px",
                      backgroundColor: "rgba(239, 68, 68, 0.9)",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.9)";
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.9)";
                    }}
                  >
                    Back to Main
                  </button>
                </div>
              )}
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}

useGLTF.preload("/models/scrollframe.glb");
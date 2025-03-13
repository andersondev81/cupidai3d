import React, { useEffect, useRef, useState } from "react";
import { useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import AboutOverlay from "./Page"; // Import your custom component

export default function ScrollIframe({ onReturnToMain, isActive = false, ...props }) {
  const { nodes } = useGLTF("/models/scrollframe.glb");
  const [showContent, setShowContent] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [checkerTexture, setCheckerTexture] = useState(null);

  // Load texture
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      "/texture/Scroll_Roughness.webp",
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
        // Show buttons after a delay to ensure content has loaded
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
    // Primeiro esconde o conteúdo para uma transição suave
    setShowContent(false);
    setShowButtons(false);

    // Espera um pouco para garantir que a animação de fade out seja visível
    setTimeout(() => {
      // Chama a função de retorno fornecida pelo Castle.jsx
      // Isso vai reiniciar o estado do CastleUi, movendo a câmera de volta para "nav"
      if (onReturnToMain) {
        onReturnToMain();
      }
    }, 300);
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

      {/* HTML content - only shown when isActive is true */}
      {showContent && (
        <group position={[-1.805, 1.160, 0.908]} rotation={[-3.142, 1.051, -1.568]}>
          <Html
            transform
            scale={0.022}
            position={[0, 0, 0]}
            rotation={[0, Math.PI, 1.568]}
            distanceFactor={6.1}
            className="iframe-container"
          >
            <div style={{
              width: "800px",
              height: "1000px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              // backgroundColor: "rgba(248, 250, 252, 0.98)",
              transition: "opacity 0.3s ease",
              opacity: showContent ? 1 : 0,
            }}>
              <div style={{
                width: "90%",
                height: "85%",
                overflow: "auto",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}>
                <div style={{
                  width: "100%",
                  height: "100%",
                  // backgroundColor: "white",
                  border: "none",
                  padding: "20px",
                  fontSize: "18px",
                  lineHeight: "1.7",
                  // color: "#000000",
                  letterSpacing: "0.01em"
                }}>
                  <div className="content-wrapper">
                    <AboutOverlay />
                  </div>
                </div>
              </div>

              {/* Back to Main button - Estilizado como o botão Return to Cupid's Church */}
              {showButtons && (
                <div className="text-center py-8">
                  <button
                    onClick={handleBackToMain}
                    className="px-8 py-4 bg-pink-500 text-white rounded-full font-bold text-lg hover:bg-pink-600 transition-all duration-300 shadow-lg hover:shadow-pink-300"
                  >
                    Return to Cupid's Church
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
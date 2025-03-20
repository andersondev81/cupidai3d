import React, { useEffect, useState } from "react"
import { useGLTF, Html } from "@react-three/drei"
import * as THREE from "three"
import MirrorPage from "../../components/iframes/Roadmap"

export default function ScrollIframe({
  onReturnToMain,
  isActive = false,
  ...props
}) {
  const { nodes } = useGLTF("/models/scrollframe.glb")
  const [showContent, setShowContent] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [checkerTexture, setCheckerTexture] = useState(null)

  // Load texture
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(
      loadedTexture => {
        loadedTexture.wrapS = THREE.RepeatWrapping
        loadedTexture.wrapT = THREE.RepeatWrapping
        loadedTexture.repeat.set(1, 1)
        setCheckerTexture(loadedTexture)
      },
      undefined,
      error => console.error("Error loading texture:", error)
    )
  }, [])

  // Creating material with texture
  const scrollMaterial = React.useMemo(() => {
    if (nodes.scroolIframe?.material) {
      // Clone original material to preserve other properties
      const newMaterial = nodes.scroolIframe.material.clone()
      // Configure material with texture when available
      if (checkerTexture) {
        newMaterial.map = checkerTexture
        newMaterial.needsUpdate = true
      }
      // Make material double-sided
      newMaterial.side = THREE.DoubleSide
      return newMaterial
    }

    // Fallback to basic material
    return new THREE.MeshStandardMaterial({
      map: checkerTexture,
      side: THREE.DoubleSide,
      roughness: 0.7,
      metalness: 0.0,
    })
  }, [nodes.scroolIframe?.material, checkerTexture])

  // Monitor changes in isActive state
  useEffect(() => {
    if (isActive) {
      // When component becomes active, show content with a small delay
      const timer = setTimeout(() => {
        setShowContent(true)
        // Show buttons after a delay to ensure content has loaded
        setTimeout(() => {
          setShowButtons(true)
        }, 500)
      }, 300)

      return () => clearTimeout(timer)
    } else {
      // When component becomes inactive, hide content
      setShowContent(false)
      setShowButtons(false)
    }
  }, [isActive])

  // Function to handle Back to Main button click
  const handleBackToMain = () => {
    // Hide content for a smooth transition
    setShowContent(false)
    setShowButtons(false)

    // Wait a bit to ensure the fade-out animation is visible
    setTimeout(() => {
      // Call the callback function provided by parent component
      if (onReturnToMain) {
        onReturnToMain()
      }
    }, 300)
  }

  return (
    <group {...props} dispose={null}>
      {/* Always render the scroll mesh with proper texture */}
      {/* <mesh
        geometry={nodes.scroolIframe.geometry}
        material={scrollMaterial}
        position={[-1.805, 1.106, 0.908]}
        rotation={[-3.142, 1.051, -1.568]}
      /> */}

      {/* HTML content - only shown when isActive is true */}
      {showContent && (
        <group
          position={[-1.805, 1.16, 0.908]}
          rotation={[-3.142, 1.051, -1.568]}
        >
          <Html
            transform
            scale={0.022}
            position={[0, 0, 0]}
            rotation={[0, Math.PI, 1.568]}
            distanceFactor={6.1}
            className="iframe-container"
          >
            <div
              style={{
                width: "900px",
                height: "1200px",
                position: "relative",
                overflow: "hidden",
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
                  <MirrorPage />
                </div>

                {/* Space for the fixed button */}
                <div style={{ height: "100px" }}></div>
              </div>

              {/* Fixed button container */}
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
  )
}

useGLTF.preload("/models/scrollframe.glb")

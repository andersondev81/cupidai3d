import { Html } from "@react-three/drei";
import React, { useEffect, useRef, useState } from "react";

const MirrorIframe = ({ onReturnToMain, isActive, ...props }) => {
  const [showContent, setShowContent] = useState(false);
  const iframeRef = useRef(null);

  // Monitor changes in isActive state
  useEffect(() => {
    if (isActive) {
      // When component becomes active, show content with a small delay
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      // When component becomes inactive, hide content
      setShowContent(false);
    }
  }, [isActive]);



  // Function to handle Back to Main button click
  const handleBackToMain = () => {
    // Only call onReturnToMain to change camera
    if (onReturnToMain) onReturnToMain();
  };

  return (
    <group
      position={[-1.64, 1.450, -0.823]}
      rotation={[-1.567, -0.002, -2.037]}
      {...props}
    >
      {showContent && (
        <Html
          wrapperClass="mirror-screen"
          transform
          scale={0.01}
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <iframe
              ref={iframeRef}
              src="https://getcupid.ai/Blogs"
              style={{
                width: "2000px",
                height: "2870px",
                border: "none",
                backgroundColor: "white",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
              }}
            />

            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: "12px",
                zIndex: 1000,
              }}
            >
              <button
                onClick={handleBackToMain}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
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
          </div>
        </Html>
      )}
    </group>
  );
};

export default MirrorIframe;
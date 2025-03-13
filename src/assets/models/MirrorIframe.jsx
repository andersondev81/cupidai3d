import { Html } from "@react-three/drei";
import React, { useEffect, useState } from "react";
import BlogsOverlay from "./Page2"; // Import your custom component

const MirrorIframe = ({ onReturnToMain, isActive, ...props }) => {
  const [showContent, setShowContent] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

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
    // Hide content for a smooth transition
    setShowContent(false);
    setShowButtons(false);

    // Wait a bit to ensure the fade-out animation is visible
    setTimeout(() => {
      // Call the callback function provided by parent component
      if (onReturnToMain) {
        onReturnToMain();
      }
    }, 300);
  };

  return (
    <group
      position={[-1.64, 1.450, -0.823]}
      rotation={[-1.567, -0.002, -2.037]}
      {...props}
    >
      {/* HTML content - only shown when isActive is true */}
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
            transition: "opacity 0.3s ease",
            opacity: showContent ? 1 : 0,
          }}>
            <div style={{

            }}>
              <div style={{
                width: "100%",
                height: "100%",
                border: "none",
                padding: "20px",
                fontSize: "30px", // Aumentado de 18px para 26px
                lineHeight: "1.7",
                letterSpacing: "0.01em"
              }}>
                <div className="content-wrapper">
                  <BlogsOverlay />
                </div>
              </div>
            </div>

            {/* Back to Main button - styled like the Return to Cupid's Church button */}
            {showButtons && (
              <div className="text-center py-8">
                {/* <button
                  onClick={handleBackToMain}
                  className="px-8 py-4 bg-pink-500 text-white rounded-full font-bold text-lg hover:bg-pink-600 transition-all duration-300 shadow-lg hover:shadow-pink-300"
                >
                  Return to Cupid's Church
                </button> */}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

export default MirrorIframe;
import { Html } from "@react-three/drei";
import React, { useEffect, useState } from "react";
import MirrorPage from "../../components/iframes/Mirror";

const MirrorIframe = ({ onReturnToMain, isActive, ...props }) => {
  const [showContent, setShowContent] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    if (isActive) {
      console.log("MirrorIframe: Ativando conteúdo e sons");
      if (window.audioManager && window.audioManager.sounds.mirror) {
        window.audioManager.play('mirror');
        console.log("Som do mirror iniciado");
      }

      const timer = setTimeout(() => {
        setShowContent(true);
        // Show buttons after a delay to ensure content has loaded
        setTimeout(() => {
          setShowButtons(true);
        }, 500);
      }, 300);

      return () => {
        clearTimeout(timer);
        // Parar o som do mirror quando o componente é desmontado
        if (window.audioManager && window.audioManager.sounds.mirror) {
          window.audioManager.stop('mirror');
          console.log("Som do mirror parado (desmontagem)");
        }
      };
    } else {
      // When component becomes inactive, hide content and stop sound
      setShowContent(false);
      setShowButtons(false);

      // Parar o som quando o componente fica inativo
      if (window.audioManager && window.audioManager.sounds.mirror) {
        window.audioManager.stop('mirror');
        console.log("Som do mirror parado (inativação)");
      }
    }
  }, [isActive]);

  // Function to handle Back to Main button click
  const handleBackToMain = () => {
    console.log("Botão de retorno clicado");

    // Primeiro, pare o som do mirror
    if (window.audioManager && window.audioManager.sounds.mirror) {
      window.audioManager.stop('mirror');
      console.log("Som do mirror parado (retorno ao main)");
    }

    // Verificar se precisamos parar todos os sons
    if (window.audioManager && window.audioManager.stopAllAudio) {
      window.audioManager.stopAllAudio();
      console.log("Todos os sons parados");
    }

    // Hide content for a smooth transition
    setShowContent(false);
    setShowButtons(false);

    // Get the navigation source from the system
    const source = window.navigationSystem &&
                  window.navigationSystem.getNavigationSource ?
                  window.navigationSystem.getNavigationSource('mirror') : 'direct';

    console.log(`MirrorIframe: Returning with source: ${source}`);

    // Disparar evento personalizado
    if (typeof document !== 'undefined') {
      document.dispatchEvent(new CustomEvent('returnToCastle'));
    }

    // Wait a bit to ensure the fade-out animation is visible
    setTimeout(() => {
      // Call the callback function provided by parent component
      if (onReturnToMain) {
        console.log(`Chamando onReturnToMain com source: ${source}`);
        onReturnToMain(source);
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
                fontSize: "30px",
                lineHeight: "1.7",
                letterSpacing: "0.01em"
              }}>
                <div className="content-wrapper">
                  <MirrorPage />
                </div>
              </div>
            </div>

            {/* Back to Main button - styled like the Return to Cupid's Church button */}
            {showButtons && (
              <div className="text-center py-8">
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
            )}
          </div>
        </Html>
      )}
    </group>
  );
};

export default MirrorIframe;
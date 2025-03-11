import { Html } from "@react-three/drei";
import React, { useEffect, useRef, useState } from "react";

export default function AtmIframe({ onReturnToMain, isActive, ...props }) {
  const [showContent, setShowContent] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const iframeRef = useRef(null);

  // Monitora mudanças no estado isActive
  useEffect(() => {
    if (isActive) {
      // Quando o componente se torna ativo, mostra o conteúdo com um pequeno delay
      const timer = setTimeout(() => {
        setShowContent(true);
        // Mostra os botões após um tempo para garantir que a iframe carregou
        setTimeout(() => {
          setShowButtons(true);
        }, 500);
      }, 300);

      return () => clearTimeout(timer);
    } else {
      // Quando o componente se torna inativo, esconde o conteúdo
      setShowContent(false);
      setShowButtons(false);
    }
  }, [isActive]);

  // Função para lidar com o clique no botão Back to Main
  const handleBackToMain = () => {
    // Importante: Não esconder o conteúdo aqui, deixe o useEffect cuidar disso
    // Apenas chame a função onReturnToMain para mudar a câmera
    onReturnToMain();
  };

  return (
    <group {...props} dispose={null}>
      {showContent && (
        <Html
          transform
          wrapperClass="atm-screen"
          distanceFactor={0.17}
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]} // Rotação relativa ao grupo
        >
          <div style={{ width: "100%", height: "100%", position: "relative" }}>
            <iframe
              ref={iframeRef}
              src="https://getcupid.ai/Blogs"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                backgroundColor: "white",
              }}
            />

            {showButtons && (
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


                {/* <button
                  onClick={() => {
                    if (iframeRef.current) {
                      iframeRef.current.src = iframeRef.current.src;
                    }
                  }}
                  style={{
                    padding: "8px 16px",
                    fontSize: "14px",
                    backgroundColor: "rgba(59, 130, 246, 0.9)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                    transition: "background-color 0.3s",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(37, 99, 235, 0.9)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(59, 130, 246, 0.9)";
                  }}
                >
                  Refresh
                </button> */}
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}
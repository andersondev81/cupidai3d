import React, { useState, useEffect } from "react";
import { AboutOverlay } from "/src/assets/models/AboutOverlay.jsx"; // Caminho correto de importação

export const sections = [
  "nav",
  "about",
  "aidatingcoach",
  "download",
  "token",
  "roadmap",
];

const Section = ({ children, isActive, className = "" }) => (
  <section
    className={`absolute inset-4 flex flex-col justify-center text-center transition-opacity duration-1000 ${className} ${
      isActive ? "opacity-100" : "opacity-0 pointer-events-none"
    }`}
  >
    {children}
  </section>
);

const NavigationButton = ({ onClick, children, className }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center rounded-md px-6 py-3 transition-all ${className}`}
  >
    {children}
  </button>
);

export const CastleUi = ({ section = 0, onSectionChange, cameraRef }) => {
  const [showAboutOverlay, setShowAboutOverlay] = useState(false);
  const currentSectionKey = sections[section];

  // Show overlay automatically when about section is active
  useEffect(() => {
    if (currentSectionKey === "about") {
      // Adicionando um pequeno timeout para garantir que a transição da câmera aconteça primeiro
      const timer = setTimeout(() => {
        setShowAboutOverlay(true);
      }, 100); // Um pequeno delay para garantir que seja exibido após a transição
      return () => clearTimeout(timer);
    }
  }, [currentSectionKey]);

  const handleHomeNavigation = () => {
    if (cameraRef) {
      cameraRef.goToHome();
      onSectionChange(0, "nav");
    }
  };

  const handleCloseOverlay = () => {
    setShowAboutOverlay(false);
    // Navigate back to home if we're in the about section
    if (currentSectionKey === "about") {
      handleHomeNavigation();
    }
  };

  return (
    <main className="relative h-full w-full">
      {/* Seção About - Vazia agora, pois o overlay será mostrado automaticamente */}
      <Section isActive={currentSectionKey === "about"}>
        {/* Intencionalmente vazio - o overlay será exibido no lugar */}
      </Section>

      {/* Seção AI Dating Coach */}
      <Section isActive={currentSectionKey === "aidatingcoach"}>
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl font-bold text-stone-100">AI Dating Coach</h1>
          <div className="flex gap-4">
            <NavigationButton
              onClick={handleHomeNavigation}
              className="bg-gray-500 hover:bg-gray-600 text-white pointer-events-auto"
            >
              Back to Main
            </NavigationButton>
          </div>
        </div>
      </Section>

      {/* Seção Download */}
      <Section isActive={currentSectionKey === "download"}>
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl font-bold text-stone-100">
            Download the App
          </h1>
          <div className="flex gap-4">
            <NavigationButton
              onClick={() => window.open("#download-link", "_blank")}
              className="bg-green-500 hover:bg-green-600 text-white pointer-events-auto"
            >
              iOS Version
            </NavigationButton>
            <NavigationButton
              onClick={() => window.open("#download-link", "_blank")}
              className="bg-green-500 hover:bg-green-600 text-white pointer-events-auto"
            >
              Android Version
            </NavigationButton>
            <NavigationButton
              onClick={handleHomeNavigation}
              className="bg-gray-500 hover:bg-gray-600 text-white pointer-events-auto"
            >
              Back
            </NavigationButton>
          </div>
        </div>
      </Section>

      {/* Seção Token */}
      <Section isActive={currentSectionKey === "token"}>
        <div className="flex flex-col items-center gap-6 pb-60">
          <h1 className="text-4xl font-bold text-stone-100">
            Token Information
          </h1>
          <NavigationButton
            onClick={handleHomeNavigation}
            className="bg-gray-500 hover:bg-gray-600 text-white pointer-events-auto"
          >
            Back to Main
          </NavigationButton>
        </div>
      </Section>

      {/* Seção Roadmap */}
      <Section isActive={currentSectionKey === "roadmap"}>
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl font-bold text-stone-100">
            Development Roadmap
          </h1>
          <div className="flex gap-4">
            <NavigationButton
              onClick={handleHomeNavigation}
              className="bg-gray-500 hover:bg-gray-600 text-white pointer-events-auto"
            >
              Main Menu
            </NavigationButton>
          </div>
        </div>
      </Section>

      {/* AboutOverlay Component */}
      <AboutOverlay
        isVisible={showAboutOverlay}
        onClose={handleCloseOverlay}
      />
    </main>
  );
};
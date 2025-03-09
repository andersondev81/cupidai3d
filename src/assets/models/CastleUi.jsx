import React, { useState, useEffect } from "react";
import { AboutOverlay } from "/src/assets/models/AboutOverlay.jsx";

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

  // // Show overlay only after the camera animation has completed
  // useEffect(() => {
  //   if (currentSectionKey === "about") {
  //     // Use a longer delay to ensure camera animation is complete before showing overlay
  //     // Camera transitions typically take around 1-1.5 seconds
  //     const timer = setTimeout(() => {
  //       setShowAboutOverlay(true);
  //     }, 1500); // 1.5 seconds delay to ensure animation is complete
  //     return () => clearTimeout(timer);
  //   } else {
  //     // Hide overlay immediately when leaving the about section
  //     setShowAboutOverlay(false);
  //   }
  // }, [currentSectionKey]);

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
              className="bg-green-500 hover:bg-green-600 text-white pointer-events-auto"
            >
              iOS Version
            </NavigationButton>
            <NavigationButton
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
      <div className="flex flex-col items-center gap-6">
          <div className="flex gap-4">
            <NavigationButton
              onClick={handleHomeNavigation}
              className="bg-gray-500 hover:bg-gray-600 text-white pointer-events-auto"
            >
              Back
            </NavigationButton>
          </div>
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

      {/* AboutOverlay Component - Only shown after camera animation completes */}
      <AboutOverlay
        isVisible={showAboutOverlay}
        onClose={handleCloseOverlay}
      />
    </main>
  );
};
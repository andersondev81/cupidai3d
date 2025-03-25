import React, { useState, useEffect } from "react";
import { AboutOverlay } from "/src/assets/models/AboutOverlay.jsx";
import { DownloadOverlay } from "./DownloadOverlay";

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
  const [showDownloadOverlay, setShowDownloadOverlay] = useState(false);

  const currentSectionKey = sections[section];

  // Show overlay only after the camera animation has completed
  useEffect(() => {
    // if is about setShowAboutOverlay to true
    // if is download setShowDownloadOverlay to true
    if (currentSectionKey === "about" ) {
      // Use a longer delay to ensure camera animation is complete before showing overlay
      // Camera transitions typically take around 1-1.5 seconds
      const timer = setTimeout(() => {
        setShowAboutOverlay(true);
      }, 1500); // 1.5 seconds delay to ensure animation is complete
      return () => clearTimeout(timer);
    }
    if (currentSectionKey === "download" ) {
      // Use a longer delay to ensure camera animation is complete before showing overlay
      // Camera transitions typically take around 1-1.5 seconds
      const timer = setTimeout(() => {
        setShowDownloadOverlay(true);
      }, 1500); // 1.5 seconds delay to ensure animation is complete
      return () => clearTimeout(timer);
    }
    else {
      // Hide overlay immediately when leaving the about section
      setShowAboutOverlay(false);
      setShowDownloadOverlay(false);
    }
  }, [currentSectionKey]);

  const handleHomeNavigation = () => {
    if (cameraRef) {
      cameraRef.goToHome();
      onSectionChange(0, "nav");
    }
  };

  // Special handlers for specific sections
  const handleBackFromAbout = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log("Direct handler: Back from About section");

    // Close the About overlay immediately
    setShowAboutOverlay(false);

    // Use a direct navigation approach
    if (cameraRef && cameraRef.goToHome) {
      cameraRef.goToHome();
    }

    // Force section change after a small delay
    setTimeout(() => {
      onSectionChange(0, "nav");

      // Try global navigation as a backup
      if (window.globalNavigation && window.globalNavigation.navigateTo) {
        window.globalNavigation.navigateTo("nav");
      }
    }, 100);
  };

  // Special handler for Download section
  const handleBackFromDownload = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.log("Direct handler: Back from Download section");

    // Close the overlay immediately
    setShowDownloadOverlay(false);

    // Use a direct navigation approach
    if (cameraRef && cameraRef.goToHome) {
      cameraRef.goToHome();
    }

    // Force section change after a small delay
    setTimeout(() => {
      onSectionChange(0, "nav");

      // Try global navigation as a backup
      if (window.globalNavigation && window.globalNavigation.navigateTo) {
        window.globalNavigation.navigateTo("nav");
      }
    }, 100);
  };

  // Determine which handler to use based on current section
  const handleCloseOverlay = (e) => {
    if (currentSectionKey === "about") {
      handleBackFromAbout(e);
    }
    else if (currentSectionKey === "download") {
      handleBackFromDownload(e);
    }
    else {
      // Default handler
      setShowAboutOverlay(false);
      setShowDownloadOverlay(false);
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
          {/* <h1 className="text-4xl font-bold text-stone-100">AI Dating Coach</h1> */}
          <div className="flex gap-4">
            {/* <NavigationButton
              onClick={handleHomeNavigation}
              className="bg-gray-500 hover:bg-gray-600 text-white pointer-events-auto"
            >
              Back to Main
            </NavigationButton> */}
          </div>
        </div>
      </Section>

      {/* Seção Download */}
      <Section isActive={currentSectionKey === "download"}>
        {/* <div className="flex flex-col items-center gap-6">
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
        </div> */}
      </Section>

      {/* Seção Token */}
      <Section isActive={currentSectionKey === "token"}>
      <div className="flex flex-col items-center gap-6">
          <div className="flex gap-4">
            {/* <NavigationButton
              onClick={handleHomeNavigation}
              className="bg-gray-500 hover:bg-gray-600 text-white pointer-events-auto"
            >
              Back
            </NavigationButton> */}
          </div>
        </div>
      </Section>

      {/* Seção Roadmap */}
      <Section isActive={currentSectionKey === "roadmap"}>
        <div className="flex flex-col items-center gap-6">

          {/* <div className="flex gap-4">
            <NavigationButton
              onClick={handleHomeNavigation}
              className="bg-gray-500 hover:bg-gray-600 text-white pointer-events-auto"
            >
              Main Menu
            </NavigationButton>
          </div> */}
        </div>
      </Section>

      <AboutOverlay
        isVisible={showAboutOverlay}
        onClose={handleBackFromAbout}
      />

      <DownloadOverlay
        isVisible={showDownloadOverlay}
        onClose={handleBackFromDownload}
      />
    </main>
  );
};
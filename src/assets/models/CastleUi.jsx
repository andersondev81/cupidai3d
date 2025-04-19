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

  // Debug logging
  useEffect(() => {
    console.log(`CastleUI: Current section changed to ${currentSectionKey}`);
  }, [currentSectionKey]);

  // Show overlay after camera animation is complete
  useEffect(() => {
    if (currentSectionKey === "about") {
      console.log("About section active, preparing to show overlay");
      // Make sure we're waiting enough time for the animation
      const timer = setTimeout(() => {
        console.log("Showing AboutOverlay now");
        setShowAboutOverlay(true);
      }, 1200); // Reduced slightly from 1500ms
      return () => clearTimeout(timer);
    }
    else if (currentSectionKey === "download") {
      console.log("Download section active, preparing to show overlay");
      const timer = setTimeout(() => {
        setShowDownloadOverlay(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
    else {
      // Hide overlays when not in those sections
      setShowAboutOverlay(false);
      setShowDownloadOverlay(false);
    }
  }, [currentSectionKey]);

  // Global event listener for orb navigation
  useEffect(() => {
    const handleOrbNavigation = (event) => {
      if (event.detail && event.detail.section === "about") {
        console.log("Detected orb navigation to about section");
        // Force section change if needed
        if (currentSectionKey !== "about") {
          onSectionChange(1, "about");
        }
      }
    };

    window.addEventListener('orbNavigation', handleOrbNavigation);
    return () => window.removeEventListener('orbNavigation', handleOrbNavigation);
  }, [currentSectionKey, onSectionChange]);

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

  // Feche o About overlay imediatamente
  setShowAboutOverlay(false);

  // Obtenha a fonte de navegação para o orb
  const source = window.navigationSystem && window.navigationSystem.getNavigationSource
    ? window.navigationSystem.getNavigationSource("orb")
    : "direct";

  console.log(`About return button clicked, navigation source: ${source}`);

  // Toque som de transição para navegação direta
  if (source === "direct" && window.audioManager) {
    window.audioManager.play("transition");
  }

  // Para navegação via pole, sempre limpe qualquer posição armazenada
  if (source === "pole" && window.navigationSystem && window.navigationSystem.clearPositionForElement) {
    window.navigationSystem.clearPositionForElement("orb");
    console.log("Navegação via pole: posição anterior do orb limpa");
  }

  // Manipule a navegação com base na fonte
  setTimeout(() => {
    if (source === "pole") {
      // Se vier do pole, volte para a seção nav
      console.log("About: Source is pole, returning to nav");
      onSectionChange(0, "nav");
      if (window.globalNavigation && window.globalNavigation.navigateTo) {
        window.globalNavigation.navigateTo("nav");
      }
    } else {
      // Verifique se há uma posição armazenada
      const storedPosition = window.navigationSystem && window.navigationSystem.getPosition
        ? window.navigationSystem.getPosition("orb")
        : null;

      if (storedPosition) {
        // Retorne para a posição armazenada
        const { position, target } = storedPosition;
        console.log("Returning to stored Orb position:", position, target);

        if (window.smoothCameraReturn) {
          window.smoothCameraReturn(position, target);
        }

        // Ainda atualize a seção ativa
        onSectionChange(0, "nav");
      } else {
        // Volte para nav se não houver posição armazenada
        console.log("No stored position for Orb, going to nav");
        onSectionChange(0, "nav");
        if (window.globalNavigation && window.globalNavigation.navigateTo) {
          window.globalNavigation.navigateTo("nav");
        }
      }
    }
  }, 100);

  // Use a referência da câmera apenas para navegação pelo pole
  if (cameraRef && cameraRef.goToHome && source === "pole") {
    cameraRef.goToHome();
  }
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
          <div className="flex gap-4">
            {/* Navigation buttons removed as per original */}
          </div>
        </div>
      </Section>

      {/* Seção Download */}
      <Section isActive={currentSectionKey === "download"}>
        {/* Content removed as per original */}
      </Section>

      {/* Seção Token */}
      <Section isActive={currentSectionKey === "token"}>
        <div className="flex flex-col items-center gap-6">
          <div className="flex gap-4">
            {/* Navigation buttons removed as per original */}
          </div>
        </div>
      </Section>

      {/* Seção Roadmap */}
      <Section isActive={currentSectionKey === "roadmap"}>
        <div className="flex flex-col items-center gap-6">
          {/* Content removed as per original */}
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
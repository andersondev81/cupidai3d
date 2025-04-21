import { useEffect, useState } from "react"
import Experience from "./pages/Experience"
import LoadingUI from "./components/loading/LoadingUI"
import AssetsLoadingManager from "./components/loading/LoadingManager"

const loadingManager = new AssetsLoadingManager();

const setupModels = () => {
  loadingManager
    .addModel('/models/Castle.glb', 'castle')
    .addModel('/models/castleClouds.glb', 'clouds');
};

function App() {
  const [isMobileDevice, setIsMobileDevice] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [showExperience, setShowExperience] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      setIsMobileDevice(mobileRegex.test(userAgent) || window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isMobileDevice === null) return;

    loadingManager.onLoad = () => {
      setModelsLoaded(true);
    };

    setupModels();
    loadingManager.startLoading();
  }, [isMobileDevice]);

  const handleStartExperience = () => {

    window.assets = {
      models: loadingManager.loadedAssets.models
    };

    setIsLoading(false);
    setShowExperience(true);
  };

  if (isMobileDevice === null) {
    return <LoadingUI isLoadingStarted={false} />
  }

  if (isMobileDevice) {
    return (
      <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-black text-white p-6">
        <h2 className="text-2xl mb-4">Dispositivo Móvel</h2>
        <p className="text-center mb-6">
          A experiência 3D funciona melhor em desktops. Desempenho pode ser limitado em dispositivos móveis.
        </p>
        <button
          onClick={() => setIsMobileDevice(false)}
          className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
        >
          Continuar Mesmo Assim
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-black">
      <div className={showExperience ? "opacity-100" : "opacity-0"} style={{transition: "opacity 1s ease"}}>
        <Experience
          loadedAssets={{models: loadingManager.loadedAssets.models}}
          isReady={showExperience}
        />
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black">
          <LoadingUI
            isLoadingStarted={true}
            onAnimationComplete={handleStartExperience}
            forceComplete={modelsLoaded}
          />
        </div>
      )}
    </div>
  )
}

export default App
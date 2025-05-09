import { useEffect, useState } from "react"
import Experience from "./pages/Experience"
import LoadingUI from "./components/loading/LoadingUI"
import AssetsLoadingManager from "./components/loading/LoadingManager"

let loadingManager = null;

function App() {
  const [isMobileDevice, setIsMobileDevice] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [showExperience, setShowExperience] = useState(false)
  const [loadedAssets, setLoadedAssets] = useState(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileDevice(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isMobileDevice === null) return;

    loadingManager = new AssetsLoadingManager();


    loadingManager.onLoad = () => {
      console.log('Models loaded successfully');

      setLoadedAssets(loadingManager.loadedAssets);
      setModelsLoaded(true);
    };

    loadingManager
      .addModel('/models/Castle.glb', 'castle')
      .addModel('/models/castleClouds.glb', 'clouds');

    loadingManager.startLoading();

    return () => {
      if (loadingManager && loadingManager.dispose) {
        loadingManager.dispose();
      }

      setLoadedAssets(null);
      loadingManager = null;
    };
  }, [isMobileDevice]);

  const handleStartExperience = () => {
    console.log('Starting 3D experience');

    setIsLoading(false);
    setShowExperience(true);
  };

  if (isMobileDevice === null) {
    return <LoadingUI isLoadingStarted={false} />
  }

  if (isMobileDevice) {
    return (
      <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-black text-white p-6">
        <h2 className="text-2xl mb-4">Mobile Device</h2>
        <p className="text-center mb-6">
          The 3D experience works better on desktops. Performance may be limited on mobile devices.
        </p>
        <button
          onClick={() => setIsMobileDevice(false)}
          className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
        >
          Continue Anyway
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-black">
      {showExperience && (
        <div className={showExperience ? "opacity-100" : "opacity-0"} style={{transition: "opacity 1s ease"}}>
          <Experience
            loadedAssets={loadedAssets}
            isReady={showExperience}
          />
        </div>
      )}

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
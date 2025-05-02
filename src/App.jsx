// App.jsx - Versão otimizada apenas para modelos
import { useEffect, useState } from "react"
import Experience from "./pages/Experience"
import LoadingUI from "./components/loading/LoadingUI"
import AssetsLoadingManager from "./components/loading/LoadingManager"

// Cria instância do gerenciador de carregamento
const loadingManager = new AssetsLoadingManager();

// Lista dos modelos essenciais
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

  // Verifica se é dispositivo móvel
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

  // Inicia carregamento de modelos
  useEffect(() => {
    if (isMobileDevice === null) return;

    // Configura callback para quando modelos estiverem carregados
    loadingManager.onLoad = () => {
      console.log('Modelos carregados com sucesso');
      setModelsLoaded(true);
    };

    // Inicia carregamento
    setupModels();
    loadingManager.startLoading();
  }, [isMobileDevice]);

  // Função chamada quando usuário clicar em Iniciar
  const handleStartExperience = () => {
    console.log('Iniciando experiência 3D');

    // Disponibiliza modelos globalmente
    window.assets = {
      models: loadingManager.loadedAssets.models
    };

    // Mostra a experiência
    setIsLoading(false);
    setShowExperience(true);
  };

  // Aguardando detecção de dispositivo
  if (isMobileDevice === null) {
    return <LoadingUI isLoadingStarted={false} />
  }

  // Aviso para dispositivos móveis
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
      {/* Experiência 3D - mostrada apenas após carregamento */}
      <div className={showExperience ? "opacity-100" : "opacity-0"} style={{transition: "opacity 1s ease"}}>
        <Experience
          loadedAssets={{models: loadingManager.loadedAssets.models}}
          isReady={showExperience}
        />
      </div>

      {/* Loading UI - mostrada até o usuário clicar em iniciar */}
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
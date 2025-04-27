import { useEffect, useState, useRef } from "react"
import Experience from "./pages/Experience"
import LoadingUI from "./components/loading/LoadingUI"
import AssetsLoadingManager from "./components/loading/LoadingManager"

// Criar o gerenciador de loading fora do componente
const loadingManager = new AssetsLoadingManager();

// Configurar os modelos
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
  const loadingStartedRef = useRef(false)

  // Verifica dispositivo móvel
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

  // Monitorar eventos de carregamento
  useEffect(() => {
    const onLoadingProgress = (e) => {
      // Atualização de progresso é feita no LoadingManager
    };

    const onLoadingComplete = () => {
      console.log("Carregamento completo detectado!");
      setModelsLoaded(true);
    };

    // Adiciona listeners para eventos de loading
    window.addEventListener('loading-progress', onLoadingProgress);
    window.addEventListener('loading-complete', onLoadingComplete);

    return () => {
      window.removeEventListener('loading-progress', onLoadingProgress);
      window.removeEventListener('loading-complete', onLoadingComplete);
    };
  }, []);

  // Iniciar carregamento quando o componente montar
  useEffect(() => {
    if (isMobileDevice === null || loadingStartedRef.current) return;

    console.log("Iniciando processo de carregamento");

    loadingManager.onLoad = () => {
      console.log("Todos modelos carregados!");
      setModelsLoaded(true);
    };

    // Configurar e iniciar o carregamento
    setupModels();
    loadingStartedRef.current = true;
    loadingManager.startLoading();
  }, [isMobileDevice]);

  // Iniciar a experiência quando tudo estiver carregado
  const handleStartExperience = () => {
    console.log("Preparando experiência 3D...");

    // IMPORTANTE: A ordem aqui é crucial - primeiro criar o Experience, depois mostrar
    setShowExperience(true);

    // Disponibilizar assets globalmente
    window.assets = {
      models: loadingManager.loadedAssets.models
    };

    // Pequeno delay para garantir que tudo está pronto antes de remover a tela de loading
    setTimeout(() => {
      console.log("Mostrando experiência 3D");
      setIsLoading(false);
    }, 500);
  };

  // Durante verificação de dispositivo
  if (isMobileDevice === null) {
    return <LoadingUI isLoadingStarted={false} />
  }

  // Para dispositivos móveis
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
      {/* Experiência 3D (carregada mas pode estar invisível) */}
      <div
        className={showExperience ? "opacity-100" : "opacity-0"}
        style={{transition: "opacity 0.8s ease"}}
      >
        {modelsLoaded && (
          <Experience
            loadedAssets={{models: loadingManager.loadedAssets.models}}
            isReady={showExperience}
          />
        )}
      </div>

      {/* Tela de carregamento */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black" id="loading-screen">
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
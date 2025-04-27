import { useEffect, useState, useRef } from "react"
import Experience from "./pages/Experience"
import LoadingUI from "./components/loading/LoadingUI"
import AssetsLoadingManager from "./components/loading/LoadingManager"

// Cria o gerenciador de loading fora do componente para persistir
const loadingManager = new AssetsLoadingManager();

// Configura quais modelos precisam ser carregados
const setupModels = () => {
  // Limpa modelos anteriores
  loadingManager.assets.models = [];

  // Adiciona os modelos necessários
  loadingManager
    .addModel('/models/Castle.glb', 'castle')
    .addModel('/models/castleClouds.glb', 'clouds');

  // Adicione outros assets caso necessário
  // .addTexture('/texture/example.webp', 'exampleTexture') (se implementar carregamento de texturas)
};

function App() {
  const [isMobileDevice, setIsMobileDevice] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [showExperience, setShowExperience] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const loadingStartedRef = useRef(false)

  // Detecta dispositivo móvel
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

  // Configura eventos de carregamento
  useEffect(() => {
    const onLoadingProgress = (e) => {
      setLoadingProgress(e.detail.progress);
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

  // Inicia o carregamento dos modelos
  useEffect(() => {
    if (isMobileDevice === null || loadingStartedRef.current) return;

    console.log("Iniciando processo de carregamento");

    // Configura callback para quando todos os modelos estiverem carregados
    loadingManager.onLoad = () => {
      console.log("Callback onLoad do loadingManager acionado");
      setModelsLoaded(true);
    };

    // Callback adicional para garantir que tudo foi carregado
    loadingManager.onAllAssetsLoaded = () => {
      console.log("TODOS os assets foram carregados com sucesso!");
      setModelsLoaded(true);
    };

    // Configura e inicia o carregamento
    setupModels();
    loadingStartedRef.current = true;
    loadingManager.startLoading();
  }, [isMobileDevice]);

  // Função para iniciar a experiência quando o carregamento estiver concluído
  const handleStartExperience = () => {
    console.log("Iniciando experiência 3D");

    // Disponibiliza assets carregados globalmente
    window.assets = {
      models: loadingManager.loadedAssets.models
    };

    // Atualiza estados para mostrar a experiência
    setIsLoading(false);
    setShowExperience(true);
  };

  // Renderização durante verificação de dispositivo
  if (isMobileDevice === null) {
    return <LoadingUI isLoadingStarted={false} progress={0} />
  }

  // Renderização para dispositivos móveis
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

  // Renderização principal
  return (
    <div className="relative w-full h-screen bg-black">
      {/* Experiência 3D (aparece quando carregada) */}
      <div
        className={showExperience ? "opacity-100" : "opacity-0"}
        style={{transition: "opacity 1s ease"}}
      >
        <Experience
          loadedAssets={{models: loadingManager.loadedAssets.models}}
          isReady={showExperience}
        />
      </div>

      {/* Tela de carregamento */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black" id="loading-screen">
          <LoadingUI
            isLoadingStarted={true}
            progress={loadingProgress}
            onAnimationComplete={handleStartExperience}
            forceComplete={modelsLoaded}
          />
        </div>
      )}
    </div>
  )
}

export default App
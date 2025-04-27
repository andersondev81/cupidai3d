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
  const [userStarted, setUserStarted] = useState(false)
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
    const onLoadingComplete = () => {
      console.log("Carregamento completo detectado!");
      setModelsLoaded(true);
    };

    // Adiciona listeners para eventos de loading
    window.addEventListener('loading-complete', onLoadingComplete);

    return () => {
      window.removeEventListener('loading-complete', onLoadingComplete);
    };
  }, []);

  // Iniciar carregamento quando o componente montar
  useEffect(() => {
    if (isMobileDevice === null || loadingStartedRef.current) return;

    console.log("Iniciando processo de carregamento");

    loadingManager.onLoad = () => {
      console.log("Carregamento concluído!");
      setModelsLoaded(true);
    };

    // Configurar e iniciar o carregamento
    setupModels();
    loadingStartedRef.current = true;
    loadingManager.startLoading();
  }, [isMobileDevice]);

  // Função para iniciar a experiência quando o usuário clicar no botão
  const handleStartExperience = () => {
    console.log("Usuário iniciou a experiência");
    setUserStarted(true);

    // Disponibilizar assets globalmente
    window.assets = {
      models: loadingManager.loadedAssets.models
    };

    // Primeiro montar a Experience
    setShowExperience(true);

    // Depois de um tempo, remover a tela de loading
    setTimeout(() => {
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
      {/* Experiência 3D */}
      <div
        className={showExperience ? "opacity-100" : "opacity-0"}
        style={{transition: "opacity 0.8s ease"}}
      >
        {modelsLoaded && (
          <Experience
            loadedAssets={{models: loadingManager.loadedAssets.models}}
            isReady={userStarted}
          />
        )}
      </div>

      {/* Tela de carregamento ou botão de entrada */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black" id="loading-screen">
          {!modelsLoaded ? (
            // Tela de carregamento normal
            <LoadingUI isLoadingStarted={true} />
          ) : (
            // Botão de entrada após carregamento
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white mb-8">Tudo Pronto!</h1>
              <button
                onClick={handleStartExperience}
                className="px-8 py-4 bg-pink-600 text-white text-xl font-bold rounded-lg hover:bg-pink-700 transition transform hover:scale-105"
              >
                Entrar na Experiência
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
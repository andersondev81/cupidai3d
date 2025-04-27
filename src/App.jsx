import { useEffect, useState, useRef } from "react"
import Experience from "./pages/Experience"
import AssetsLoadingManager from "./components/loading/LoadingManager"

// Criar o gerenciador fora do componente
const loadingManager = new AssetsLoadingManager();

// Configurar modelos
const setupModels = () => {
  loadingManager
    .addModel('/models/Castle.glb', 'castle')
    .addModel('/models/castleClouds.glb', 'clouds');
};

// Componente de Loading extremamente simples
const SimpleLoadingScreen = ({ onStart, isLoaded }) => (
  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
    <h1 className="text-4xl font-bold mb-8">Castle Experience</h1>

    {!isLoaded ? (
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-t-pink-600 border-r-pink-600 border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg">Carregando recursos 3D...</p>
      </div>
    ) : (
      <button
        onClick={onStart}
        className="px-8 py-4 text-xl font-bold bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors"
      >
        INICIAR EXPERIÊNCIA
      </button>
    )}
  </div>
);

function App() {
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showExperience, setShowExperience] = useState(false)
  const loadingStartedRef = useRef(false)

  // Verificar dispositivo móvel
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

  // Monitorar evento de carregamento completo
  useEffect(() => {
    const onLoadingComplete = () => {
      console.log("✅ Carregamento completo!");
      setTimeout(() => {
        setIsLoaded(true);
      }, 500);
    };

    window.addEventListener('loading-complete', onLoadingComplete);
    return () => window.removeEventListener('loading-complete', onLoadingComplete);
  }, []);

  // Iniciar carregamento
  useEffect(() => {
    if (loadingStartedRef.current) return;

    console.log("Iniciando carregamento...");
    loadingStartedRef.current = true;

    // Silenciar todos os sons durante o carregamento
    if (window.audioManager) {
      window.audioManager.muteAll = true;

      // Certificar-se que nenhum som esteja tocando
      if (window.audioManager.stopAll) {
        window.audioManager.stopAll();
      }
    }

    setupModels();
    loadingManager.onLoad = () => console.log("Modelos carregados!");
    loadingManager.startLoading();
  }, []);

  // Função para iniciar a experiência
  const handleStart = () => {
    console.log("Usuário iniciou a experiência");

    // Preparar a experiência
    window.assets = {
      models: loadingManager.loadedAssets.models
    };

    // Primeiro montar a Experience
    setShowExperience(true);

    // Depois remover a tela de carregamento
    setTimeout(() => {
      setIsLoading(false);

      // Reativar o áudio apenas DEPOIS que tudo estiver carregado
      if (window.audioManager) {
        window.audioManager.muteAll = false;
      }
    }, 100);
  };

  // Tela para dispositivos móveis
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
    <div className="w-full h-screen bg-black relative">
      {/* Experiência 3D */}
      <div className={showExperience ? "opacity-100" : "opacity-0"}
           style={{transition: "opacity 0.5s ease"}}>
        {loadingManager.isLoaded() && (
          <Experience
            loadedAssets={{models: loadingManager.loadedAssets.models}}
            isReady={showExperience}
          />
        )}
      </div>

      {/* Tela de carregamento */}
      {isLoading && (
        <SimpleLoadingScreen
          onStart={handleStart}
          isLoaded={isLoaded}
        />
      )}
    </div>
  )
}

export default App
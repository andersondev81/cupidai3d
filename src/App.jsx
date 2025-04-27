import { useEffect, useState, useRef } from "react";
import Experience from "./pages/Experience";
import AssetsLoadingManager from "./components/loading/LoadingManager";
import LoadingUI from "./components/loading/LoadingUI";

// Criar o gerenciador de loading no nível mais alto para garantir persistência
const loadingManager = new AssetsLoadingManager();

// Pré-configurar todos os recursos necessários
const setupAssets = () => {
  // Modelos 3D principais
  loadingManager
    .addModel('/models/Castle.glb', 'castle')
    .addModel('/models/castleClouds.glb', 'clouds');

  // Texturas críticas
  [
    '/texture/castleColor.webp',
    '/texture/castleRoughnessV1.webp',
    '/texture/castleMetallicV1.webp',
    '/texture/castleHeart_Base_colorAO.webp',
    '/texture/castleLights_Emissive.webp',
    '/texture/GodsWallColor.webp',
    '/texture/WallsColor.webp',
    '/texture/PilarsColor.webp',
    '/texture/floorAO.webp',
    '/texture/floorHeartColor.webp',
    '/texture/wingsColor_.webp'
  ].forEach((path, index) => {
    loadingManager.addTexture(path, `texture${index}`);
  });

  // Imagens de ambiente
  [
    '/images/bg1.jpg',
    '/images/studio.jpg',
    '/images/clouds.jpg'
  ].forEach((path, index) => {
    loadingManager.addTexture(path, `env${index}`);
  });

  // // Vídeos
  // loadingManager
  //   .addVideo('/video/tunnel.mp4', 'tunnel')
  //   .addVideo('/video/water.mp4', 'water');

  // // Áudio (se necessário)
  // [
  //   '/audio/transition.mp3',
  //   '/audio/ambient.mp3',
  //   '/audio/fountain.mp3'
  // ].forEach((path, index) => {
  //   loadingManager.addAudio(path, `audio${index}`);
  // });
};

function App() {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showExperience, setShowExperience] = useState(false);
  const [loadingStarted, setLoadingStarted] = useState(false);
  const loadingStartedRef = useRef(false);

  // Verificar dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobileDevice(mobileRegex.test(userAgent) || window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Iniciar pré-carregamento imediatamente
  useEffect(() => {
    if (loadingStartedRef.current) return;

    console.log("Iniciando carregamento...");
    loadingStartedRef.current = true;
    setLoadingStarted(true);

    // Silenciar todos os sons durante o carregamento
    if (window.audioManager) {
      window.audioManager.muteAll = true;
      if (window.audioManager.stopAll) {
        window.audioManager.stopAll();
      }
    }

    // Pré-configurar todos os assets
    setupAssets();

    // Definir callback de conclusão
    loadingManager.onLoad = () => {
      console.log("✅ Todos os assets carregados com sucesso!");
      setTimeout(() => {
        setIsLoaded(true);
      }, 500);
    };

    // Iniciar carregamento
    loadingManager.startLoading();

    // Criar um worker para iniciar o carregamento do Experience em segundo plano
    const preloadExperience = () => {
      // Criar um iframe invisível que pré-carrega o canvas mas não é visível
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.opacity = '0.01';
      iframe.style.pointerEvents = 'none';
      iframe.style.zIndex = '-1000';
      iframe.src = 'about:blank';

      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

      // Criar um canvas invisível dentro do iframe
      const canvas = iframeDoc.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      iframeDoc.body.appendChild(canvas);

      // Iniciar contexto WebGL
      try {
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        if (gl) {
          console.log("✓ Contexto WebGL inicializado em segundo plano");

          // Pré-carregar shaders comuns do Three.js
          const vertexShader = `
            void main() {
              gl_Position = vec4(position, 1.0);
            }
          `;

          const fragmentShader = `
            void main() {
              gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }
          `;

          const vs = gl.createShader(gl.VERTEX_SHADER);
          gl.shaderSource(vs, vertexShader);
          gl.compileShader(vs);

          const fs = gl.createShader(gl.FRAGMENT_SHADER);
          gl.shaderSource(fs, fragmentShader);
          gl.compileShader(fs);
        }
      } catch (e) {
        console.warn("Não foi possível inicializar WebGL em background:", e);
      }
    };

    // Iniciar pré-carregamento após 1 segundo
    setTimeout(preloadExperience, 1000);

    // Limpar ao desmontar
    return () => {
      loadingManager.dispose();
    };
  }, []);

  // Monitorar evento de carregamento completo
  useEffect(() => {
    const onLoadingComplete = () => {
      console.log("Carregamento completo! Pronto para iniciar.");
      setTimeout(() => {
        setIsLoaded(true);
      }, 500);
    };

    window.addEventListener('loading-complete', onLoadingComplete);
    return () => window.removeEventListener('loading-complete', onLoadingComplete);
  }, []);

  // Função para iniciar a experiência
  const handleStart = () => {
    console.log("Usuário iniciou a experiência");

    // Disponibilizar assets carregados globalmente
    window.assets = {
      models: loadingManager.loadedAssets.models,
      textures: loadingManager.loadedAssets.textures,
      videos: loadingManager.loadedAssets.videos,
      audio: loadingManager.loadedAssets.audio
    };

    // Montar a Experience
    setShowExperience(true);

    // Remover a tela de carregamento com uma transição suave
    setTimeout(() => {
      setIsLoading(false);

      // Reativar o áudio apenas DEPOIS que tudo estiver carregado
      if (window.audioManager) {
        window.audioManager.muteAll = false;
      }
    }, 800);
  };

  // Tela para dispositivos móveis
  if (isMobileDevice) {
    return (
      <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-black text-white p-6">
        <h2 className="text-2xl mb-4">Dispositivo Móvel Detectado</h2>
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
    );
  }

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* Container da Experiência com transição suave */}
      <div
        className={`absolute inset-0 transition-opacity duration-800 ease-in-out ${
          showExperience ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Renderiza Experience apenas após loadingManager estar pronto */}
        {(loadingManager.isLoaded() || showExperience) && (
          <Experience
            loadedAssets={{
              models: loadingManager.loadedAssets.models,
              textures: loadingManager.loadedAssets.textures,
              videos: loadingManager.loadedAssets.videos
            }}
            isReady={showExperience}
          />
        )}
      </div>

      {/* Tela de carregamento com transição suave */}
      {isLoading && (
        <div
          className={`absolute inset-0 z-50 transition-opacity duration-500 ${
            showExperience ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <LoadingUI
            isLoaded={isLoaded}
            onStart={handleStart}
          />
        </div>
      )}
    </div>
  );
}

export default App;
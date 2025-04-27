import React, { useState, useEffect } from 'react';

// Componente de UI de loading com progresso
const LoadingUI = ({ isLoaded, onStart }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Iniciando carregamento...');
  const [currentAsset, setCurrentAsset] = useState('');
  const [phase, setPhase] = useState('loading'); // loading, ready, error

  // Monitorar eventos de progresso
  useEffect(() => {
    const handleProgress = (event) => {
      // Extrair dados do evento
      const { progress, url } = event.detail;

      // Atualizar progresso
      setProgress(Math.round(progress * 100));

      // Extrair nome do asset atual do URL
      if (url) {
        const assetName = url.split('/').pop().split('?')[0];
        setCurrentAsset(assetName);

        // Gerar mensagem personalizada baseada no tipo de asset
        if (assetName.endsWith('.glb') || assetName.endsWith('.gltf')) {
          setLoadingText('Carregando modelo 3D...');
        } else if (assetName.endsWith('.webp') || assetName.endsWith('.jpg') || assetName.endsWith('.png')) {
          setLoadingText('Carregando texturas...');
        } else if (assetName.endsWith('.mp3') || assetName.endsWith('.wav')) {
          setLoadingText('Carregando áudio...');
        } else if (assetName.endsWith('.mp4') || assetName.endsWith('.webm')) {
          setLoadingText('Preparando vídeos...');
        } else {
          setLoadingText('Carregando recursos...');
        }
      }
    };

    // Monitorar erros
    const handleError = () => {
      setPhase('error');
      setLoadingText('Ocorreu um erro durante o carregamento. Tentando novamente...');
    };

    // Registro dos event listeners
    window.addEventListener('loading-progress', handleProgress);
    window.addEventListener('loading-error', handleError);

    // Limpar event listeners
    return () => {
      window.removeEventListener('loading-progress', handleProgress);
      window.removeEventListener('loading-error', handleError);
    };
  }, []);

  // Efeito separado para monitorar quando estiver pronto
  useEffect(() => {
    if (isLoaded) {
      setLoadingText('Carregamento concluído!');
      setPhase('ready');
      setProgress(100);
    }
  }, [isLoaded]);

  // Gerar textos dinâmicos baseados no progresso
  const getHintText = () => {
    if (progress < 30) {
      return "Preparando o castelo...";
    } else if (progress < 60) {
      return "Carregando texturas e materiais...";
    } else if (progress < 90) {
      return "Quase lá! Configurando luzes e efeitos...";
    } else {
      return "Tudo pronto para sua experiência!";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white">
      <div className="w-full max-w-lg mx-auto px-6 text-center">
        <h1 className="text-4xl font-bold mb-8">Experiência 3D</h1>

        {/* Container de Loading */}
        <div className="w-full mb-8">
          {/* Barra de progresso estilizada */}
          <div className="relative h-4 w-full bg-gray-800 rounded-full overflow-hidden mb-2">
            <div
              className="absolute h-full bg-gradient-to-r from-pink-600 to-purple-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />

            {/* Efeito de brilho na barra */}
            <div
              className="absolute top-0 h-full w-12 bg-white opacity-20"
              style={{ left: `${progress - 10}%` }}
            />
          </div>

          {/* Texto de porcentagem */}
          <div className="flex justify-between text-sm">
            <span>{progress}% concluído</span>
            <span className="text-gray-400">{currentAsset}</span>
          </div>
        </div>

        {/* Mensagem dinâmica */}
        <div className="mb-8">
          <p className="text-lg">{loadingText}</p>
          <p className="text-sm text-gray-400 mt-2">{getHintText()}</p>
        </div>

        {/* Botão de iniciar (apenas mostrado quando pronto) */}
        {phase === 'ready' && (
          <button
            onClick={onStart}
            className="px-8 py-4 text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            INICIAR EXPERIÊNCIA
          </button>
        )}

        {/* Botão de tentar novamente (apenas mostrado em caso de erro) */}
        {phase === 'error' && (
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 text-xl font-bold bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            TENTAR NOVAMENTE
          </button>
        )}
      </div>
    </div>
  );
};

export default LoadingUI;
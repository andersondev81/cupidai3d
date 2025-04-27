import React, { useState, useEffect } from 'react';

// Componente de UI de loading com progresso e verificação do Leva
const LoadingUI = ({ isLoaded, levaReady, onStart, isVercel = false, isFirstVisit = false }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Iniciando carregamento...');
  const [currentAsset, setCurrentAsset] = useState('');
  const [phase, setPhase] = useState('loading'); // loading, ready, error
  const [forceReady, setForceReady] = useState(false);
  const [securityTimer, setSecurityTimer] = useState(isVercel ? 20 : 15); // Timeout maior no Vercel

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

    // Monitorar eventos específicos do Vercel
    const handleVercelProgress = (event) => {
      const { progress, url } = event.detail;
      setProgress(Math.round(progress * 100));

      if (url) {
        const assetName = url.split('/').pop().split('?')[0];
        setCurrentAsset(assetName);
        setLoadingText(`Carregamento forçado: ${assetName}`);
      }
    };

    // Monitorar erros
    const handleError = () => {
      setPhase('error');
      setLoadingText('Ocorreu um erro durante o carregamento. Tentando novamente...');
    };

    // Verificação manual do Leva
    const checkLevaManually = () => {
      // Procurar elementos visíveis que indicam a presença do Leva
      const levaElements = document.querySelectorAll('[data-leva-theme], .leva-c-kWgxhW, .leva-container, .leva-panel');
      if (levaElements.length > 0) {
        console.log("✅ LoadingUI: Leva detectado manualmente!", levaElements);
        setForceReady(true);
        return true;
      }
      return false;
    };

    // Registro dos event listeners
    window.addEventListener('loading-progress', handleProgress);
    window.addEventListener('loading-error', handleError);

    // Adicionar event listener específico para carregamento no Vercel
    if (isVercel || isFirstVisit) {
      window.addEventListener('vercel-loading-progress', handleVercelProgress);
      window.addEventListener('vercel-loading-complete', () => {
        console.log("✅ Carregamento forçado no Vercel concluído!");
      });
    }

    // Verificar periodicamente se o Leva está carregado
    const checkInterval = setInterval(() => {
      checkLevaManually();
    }, 1000);

    // Timer de segurança para forçar o botão a aparecer
    let securityInterval;
    if (isLoaded && !levaReady && !forceReady) {
      securityInterval = setInterval(() => {
        setSecurityTimer(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            console.log("⚠️ Timer de segurança ativado. Habilitando botão de início.");
            clearInterval(securityInterval);
            setForceReady(true);
            return 0;
          }
          return newValue;
        });
      }, 1000);
    }

    // Limpar event listeners e intervalos
    return () => {
      window.removeEventListener('loading-progress', handleProgress);
      window.removeEventListener('loading-error', handleError);
      if (isVercel || isFirstVisit) {
        window.removeEventListener('vercel-loading-progress', handleVercelProgress);
        window.removeEventListener('vercel-loading-complete', () => {});
      }
      clearInterval(checkInterval);
      if (securityInterval) clearInterval(securityInterval);
    };
  }, [isLoaded, levaReady, isVercel, isFirstVisit]);

  // Efeito separado para monitorar quando estiver pronto
  useEffect(() => {
    if (isLoaded && (levaReady || forceReady)) {
      setLoadingText('Tudo pronto para iniciar!');
      setPhase('ready');
      setProgress(100);
      console.log("✅ Carregamento concluído!");
    } else if (isLoaded && !levaReady && !forceReady) {
      setLoadingText('Finalizando configurações...');
      setProgress(95); // Mostrar quase completo
    }
  }, [isLoaded, levaReady, forceReady]);

  // Verificar manualmente no DOM em cada render
  useEffect(() => {
    // Tentativa de detecção no DOM atual
    const levaElements = document.querySelectorAll('[data-leva-theme], .leva-c-kWgxhW, .leva-container, .leva-panel');
    if (levaElements.length > 0 && !forceReady) {
      console.log("✅ LoadingUI useEffect: Leva detectado manualmente!", levaElements);
      setForceReady(true);
    }
  });

  // Gerar textos dinâmicos baseados no progresso
  const getHintText = () => {
    if (!isLoaded) {
      if (isVercel && isFirstVisit) {
        return "Primeira visita ao site. Carregando recursos... Isso pode levar mais tempo.";
      } else if (progress < 30) {
        return "Preparando o castelo...";
      } else if (progress < 60) {
        return "Carregando texturas e materiais...";
      } else if (progress < 90) {
        return "Quase lá! Configurando luzes e efeitos...";
      } else {
        return "Finalizando carregamento de recursos...";
      }
    } else if (!levaReady && !forceReady) {
      return `Aguardando inicialização dos controles... (${securityTimer}s)`;
    } else {
      return "Tudo pronto para sua experiência!";
    }
  };

  // Forçar botão após timer de segurança
  const isButtonVisible = phase === 'ready' || (isLoaded && (levaReady || forceReady));

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

          {/* Mensagem especial para Vercel */}
          {isVercel && isFirstVisit && (
            <p className="text-xs text-pink-400 mt-2">
              Na primeira visita, o carregamento pode ser mais lento. Nas próximas visitas será mais rápido!
            </p>
          )}
        </div>

        {/* Botão de iniciar (exibido quando pronto OU após timer de segurança) */}
        {isButtonVisible && (
          <button
            onClick={onStart}
            className="px-8 py-4 text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            INICIAR EXPERIÊNCIA
          </button>
        )}

        {/* Indicador de finalização (quando assets carregaram mas Leva ainda não) */}
        {isLoaded && !levaReady && !forceReady && (
          <div className="animate-pulse">
            <p className="text-lg text-pink-400">Finalizando inicialização dos controles...</p>
            <div className="mt-4 flex justify-center">
              <div className="w-8 h-8 border-4 border-t-pink-600 border-r-pink-600 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {/* Forçar botão aparecer se está demorando muito */}
        {isLoaded && !levaReady && !forceReady && securityTimer < 10 && (
          <button
            onClick={() => setForceReady(true)}
            className="mt-4 px-4 py-2 text-sm font-medium bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Não quero esperar ({securityTimer}s)
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
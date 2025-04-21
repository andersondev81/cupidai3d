// LoadingUI.jsx
import React, { useEffect, useState, useRef } from 'react';
import './LoadingUI.css';

const LoadingUI = ({ onAnimationComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentItem, setCurrentItem] = useState('');
  const [loadStatus, setLoadStatus] = useState('Iniciando...');
  const [isComplete, setIsComplete] = useState(false);
  const [showStartButton, setShowStartButton] = useState(false);
  const animationFrameRef = useRef();
  const targetProgressRef = useRef(0);

  // Gerenciador de mensagens de status baseado no progresso
  const getStatusMessage = (progress) => {
    if (progress < 20) return 'Loading textures...';
    if (progress < 40) return 'Loading models...';
    if (progress < 60) return 'Loading ambients...';
    if (progress < 80) return 'Loading effects...';
    if (progress < 99) return 'Finishing...';
    return 'Ready to go!';
  };

  // Efeito para animação suave do progresso
  useEffect(() => {
    const animateProgress = () => {
      setProgress(prevProgress => {
        // Calcula o próximo valor com easing
        const diff = targetProgressRef.current - prevProgress;
        // Se a diferença for pequena, simplesmente iguale ao valor alvo
        if (Math.abs(diff) < 0.1) return targetProgressRef.current;
        // Caso contrário, aplique uma interpolação suave
        return prevProgress + diff * 0.1;
      });

      // Atualiza a mensagem de status
      setLoadStatus(getStatusMessage(progress));

      // Continue a animação se não tiver terminado
      if (progress < 100) {
        animationFrameRef.current = requestAnimationFrame(animateProgress);
      } else if (!isComplete) {
        setIsComplete(true);
        // Mostra o botão de iniciar após uma pequena pausa
        setTimeout(() => {
          setShowStartButton(true);
        }, 500);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animateProgress);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [progress, isComplete]);

  // Escuta os eventos de carregamento do LoadingManager
  useEffect(() => {
    const handleLoadingStart = (e) => {
      const { itemsTotal } = e.detail;
      console.log(`Iniciando carregamento com ${itemsTotal} itens.`);
    };

    const handleLoadingProgress = (e) => {
      const { progress, url } = e.detail;
      // Atualizamos o valor alvo do progresso
      targetProgressRef.current = progress;

      // Extraímos o nome do arquivo da URL para exibição
      const fileName = url.split('/').pop();
      setCurrentItem(fileName);
    };

    const handleLoadingComplete = () => {
      console.log('Carregamento concluído.');
      targetProgressRef.current = 100;
    };

    const handleLoadingError = (e) => {
      console.error(`Erro ao carregar: ${e.detail.url}`);
    };

    // Registra os ouvintes de eventos
    window.addEventListener('loading-start', handleLoadingStart);
    window.addEventListener('loading-progress', handleLoadingProgress);
    window.addEventListener('loading-complete', handleLoadingComplete);
    window.addEventListener('loading-error', handleLoadingError);

    return () => {
      // Remove os ouvintes ao desmontar
      window.removeEventListener('loading-start', handleLoadingStart);
      window.removeEventListener('loading-progress', handleLoadingProgress);
      window.removeEventListener('loading-complete', handleLoadingComplete);
      window.removeEventListener('loading-error', handleLoadingError);
    };
  }, []);

  // Manipula o clique no botão iniciar
  const handleStartClick = () => {
    // Adiciona classe para animar a saída
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('loaded');

      // Chama o callback após a animação terminar
      setTimeout(() => {
        if (onAnimationComplete) onAnimationComplete();
      }, 1000);
    }
  };

  return (
    <div id="loading-screen" className="loading-screen">
      <div className="loading-content">
        <div className="castle-icon">
          {/* Animação do castelo */}
          {/* <div className="castle-shape">
            <div className="tower left"></div>
            <div className="tower center"></div>
            <div className="tower right"></div>
            <div className="base"></div>
          </div> */}
        </div>
{/*
        <h1 className="loading-title">
          <span className="loading-title-text">Entering in the 3D world</span>
        </h1> */}

        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
          <div className="progress-text">
            {Math.floor(progress)}%
          </div>
        </div>

        <div className="loading-status">
          {loadStatus}
        </div>

        {currentItem && (
          <div className="loading-item">
            Loading: {currentItem}
          </div>
        )}

        {showStartButton && (
          <button
            className="start-button"
            onClick={handleStartClick}
          >
            Start experience
          </button>
        )}
      </div>
    </div>
  );
};

export default LoadingUI;
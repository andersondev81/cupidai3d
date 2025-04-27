import { useEffect, useState } from 'react';

const LoadingUI = ({ isLoadingStarted, progress, onAnimationComplete, forceComplete }) => {
  const [internalProgress, setInternalProgress] = useState(0);
  const [showStartButton, setShowStartButton] = useState(false);

  // Gerencia a progressão visual do carregamento
  useEffect(() => {
    if (!isLoadingStarted) return;

    // Se forceComplete for true, pulamos para 100%
    if (forceComplete) {
      setInternalProgress(100);
      setTimeout(() => {
        setShowStartButton(true);
      }, 1000);
      return;
    }

    // Caso contrário, atualizamos com base no progresso real
    setInternalProgress(Math.min(progress, 99.9));

    // Se o progresso estiver quase completo, mostramos o botão de iniciar
    if (progress > 99) {
      setTimeout(() => {
        setShowStartButton(true);
      }, 1000);
    }
  }, [isLoadingStarted, progress, forceComplete]);

  const handleStartClick = () => {
    if (onAnimationComplete) {
      onAnimationComplete();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white p-4">
      <div className="w-full max-w-md mx-auto text-center">
        <h1 className="text-3xl font-bold mb-8">Carregando Experiência</h1>

        {/* Barra de progresso */}
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-pink-600 transition-all duration-300"
            style={{ width: `${internalProgress}%` }}
          />
        </div>

        {/* Texto de progresso */}
        <p className="text-lg mb-8">
          {internalProgress < 100
            ? `${Math.floor(internalProgress)}% carregado...`
            : 'Carregamento completo!'}
        </p>

        {/* Botão de iniciar */}
        {showStartButton && (
          <button
            onClick={handleStartClick}
            className="px-8 py-3 bg-pink-600 text-white rounded-lg font-bold text-lg hover:bg-pink-700 transition-colors"
          >
            Iniciar Experiência
          </button>
        )}

        {/* Mensagem de dica */}
        <p className="mt-8 text-sm text-gray-400">
          Carregando recursos 3D... Por favor, aguarde.
        </p>
      </div>
    </div>
  );
};

export default LoadingUI;
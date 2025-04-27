import React from 'react';

const LoadingUI = ({ isLoadingStarted }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white p-4">
      <div className="w-full max-w-md mx-auto text-center">
        <h1 className="text-3xl font-bold mb-8">Carregando Experiência</h1>

        {/* Animação de loading simples */}
        <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-8">
          <div className="absolute top-0 left-0 h-full bg-pink-600 animate-pulse w-full"></div>
        </div>

        <div className="animate-pulse">
          <p className="text-lg">Carregando recursos 3D...</p>
          <p className="text-sm text-gray-400 mt-2">Isso pode levar alguns segundos.</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingUI;
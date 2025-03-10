// components/WebGLCheck.jsx
import React from "react"

const WebGLCheck = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center p-8 max-w-md">
        <h2 className="text-2xl mb-4">Seu dispositivo não suporta WebGL</h2>
        <p className="mb-6">
          Esta experiência 3D requer suporte a WebGL, que não está disponível no
          seu navegador ou dispositivo.
        </p>
        <p className="mb-6">
          Tente acessar usando um navegador mais recente ou um dispositivo com
          melhor suporte a gráficos 3D.
        </p>
        <div className="mt-8">
          <a
            href="/"
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </a>
        </div>
      </div>
    </div>
  )
}

export default WebGLCheck

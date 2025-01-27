import React from "react"
import { useProgress, Html } from "@react-three/drei"

const Modeload = () => {
  const { progress } = useProgress()

  return (
    <Html center>
      <div className="relative w-[360px] h-[360px] flex items-center justify-center">
        {/* Background - Você pode adicionar outros conteúdos de tela de carregamento aqui */}
        <div className="absolute inset-0 w-full h-full bg-gray-800 opacity-50" />

        {/* Progresso de Carregamento */}
        <div className="relative z-10 pt-10 text-white text-center">
          <p className="text-[10px] font-semibold">{progress.toFixed(1)}%</p>
          <p className="text-[6px]">Carregando...</p>
        </div>
      </div>
    </Html>
  )
}

export default Modeload

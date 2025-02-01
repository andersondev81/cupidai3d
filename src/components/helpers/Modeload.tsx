import React from "react"
import { useProgress, Html } from "@react-three/drei"
const logo = "/images/logo.jpeg"

const Modeload = () => {
  const { progress } = useProgress()

  return (
    <Html center>
      <div className="relative w-[360px] h-[360px] flex flex-col items-center justify-center">
        <img src={logo} alt="Logo" className="w-[200px] h-[200px]" />

        <div className="relative z-10 pt-10 text-white text-center">
          <p className="text-[10px] font-semibold">{progress.toFixed(1)}%</p>
          <p className="text-[6px]">Carregando...</p>

          {/* Barra de Progresso */}
          <div className="mt-2 w-full bg-gray-600 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Porcentagem acima da barra */}
          <p className="absolute top-[-18px] text-white text-[10px] font-semibold">
            {progress.toFixed(1)}%
          </p>
        </div>
      </div>
    </Html>
  )
}

export default Modeload

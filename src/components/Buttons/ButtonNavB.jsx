import React, { useRef, useEffect, useState } from "react"

const ButtonNavB = ({ text, onClick }) => {
  const textRef = useRef(null) // Referência ao texto
  const [textWidth, setTextWidth] = useState(0) // Estado para armazenar a largura do texto

  // Atualiza a largura do texto quando o componente for montado ou o texto mudar
  useEffect(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.offsetWidth) // Atualiza a largura do texto
    }
  }, [text]) // Dependência de 'text' para atualizar quando o texto mudar

  const padding = 46 // Distância extra nas laterais

  return (
    <div className="flex  items-center justify-center">
      {/* Adicionando 'group' aqui para que o hover afete o SVG */}
      <button
        className="relative flex items-center justify-center text-white group w-full" // 'w-full' para garantir que o botão ocupe toda a largura disponível
        onClick={onClick}
        style={{
          padding: "0.5rem 1.96rem",
          display: "inline-flex",
          height: "40px",
        }}
      >
        {/* Texto */}
        <div className="flex flex-col items-center justify-center">
          <span ref={textRef} className="text-center">
            {text}
          </span>
        </div>

        {/* SVG ajustado ao tamanho do texto */}
        <div
          className="absolute"
          style={{
            zIndex: -1, // Garantindo que o SVG fique abaixo do texto
            width: `${textWidth + padding * 1.95}px`, // Largura baseada no texto + padding extra
            height: "40px",
          }}
        >
          <svg
            width={textWidth + padding * 2} // Largura ajustada ao texto
            height="40" // Altura fixa
            viewBox={`0 0 ${textWidth + padding * 2} 40`} // ViewBox ajustado
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              transform: "rotate(180deg)", // Girando o SVG em 180 graus
            }}
          >
            {/* Gradiente de fundo (bg) com hover aplicado */}
            <path
              d={`M7 12C4 7 8 0 14 0H${textWidth + padding * 2 - 14}C${
                textWidth + padding * 2 - 7
              } 0 ${textWidth + padding * 2 - 3} 7 ${
                textWidth + padding * 2 - 7
              } 12L${textWidth + padding * 2 - 20} 36C${
                textWidth + padding * 2 - 22
              } 39 ${textWidth + padding * 2 - 26} 40 ${
                textWidth + padding * 2 - 30
              } 40H30C25 40 22 39 20 36L7 12Z`}
              fill="url(#paint0_linear_215_580)"
              className="transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100"
            />
            {/* Borda estática */}
            <path
              d={`M7.8 11C5 7 8.5 0.8 14 0.8H${textWidth + padding * 2 - 14}C${
                textWidth + padding * 2 - 7
              } 0.8 ${textWidth + padding * 2 - 3} 7 ${
                textWidth + padding * 2 - 7
              } 11L${textWidth + padding * 2 - 20} 35C${
                textWidth + padding * 2 - 22
              } 38 ${textWidth + padding * 2 - 26} 39.2 ${
                textWidth + padding * 2 - 30
              } 39.2H30C25.8 39.2 23 38 21.2 35L7.8 11Z`}
              stroke="#FCFCFC"
              strokeWidth="1.6"
            />
            <defs>
              {/* Gradiente de fundo fixo */}
              <linearGradient
                id="paint0_linear_215_580"
                x1="0"
                y1="0"
                x2="0"
                y2="40"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#FDFDFD" stopOpacity="0.2" />
                <stop offset="1" stopColor="#FDFDFD" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </button>
    </div>
  )
}

export default ButtonNavB

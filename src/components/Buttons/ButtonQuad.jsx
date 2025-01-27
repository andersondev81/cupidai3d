import React, { useRef, useEffect, useState } from "react"

const ButtonQuad = ({ text, onClick }) => {
  const textRef = useRef(null) // Referência ao texto
  const [textWidth, setTextWidth] = useState(0) // Estado para armazenar a largura do texto

  // Atualiza a largura do texto quando o componente for montado ou o texto mudar
  useEffect(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.offsetWidth) // Atualiza a largura do texto
    }
  }, [text]) // Dependência de 'text' para atualizar quando o texto mudar

  return (
    <div className="flex items-center justify-center">
      <button
        className="group flex items-center justify-center text-white relative"
        onClick={onClick}
        style={{
          padding: "0.5rem 1rem", // Ajuste o padding para dar espaço ao texto
          display: "inline-flex", // Faz o botão expandir horizontalmente com o texto
          width: "auto", // Não fixa a largura do botão, permitindo que ele se expanda com o texto
          height: "35px", // Altura do botão
        }}
      >
        {/* Container para alinhar o texto */}
        <div className="pT-2 ">
          <span
            ref={textRef} // Referência para pegar o tamanho do texto
          >
            {text}
          </span>
        </div>

        {/* SVG com a largura ajustada */}
        <div
          className="absolute"
          style={{
            width: `${textWidth + 32}px`, // Ajusta a largura com base no tamanho do texto
            height: "35px", // Altura do SVG para que fique no mesmo nível do botão
            zIndex: 1, // Garante que o SVG de fundo fique abaixo
            top: "0", // Garante que o SVG não fique cortado acima
            left: "0", // Garante que o SVG ocupe todo o espaço necessário
          }}
        >
          <svg
            width={textWidth + 32} // Ajusta o SVG para ter a largura do texto
            height="35" // Altura do SVG conforme fornecido
            viewBox={`0 0 ${textWidth + 32} 35`} // Atualiza o viewBox para o tamanho correto
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Gradiente de fundo aplicado ao hover */}
            <rect
              x="0.8"
              y="0.8"
              width={textWidth + 32 - 1.6} // Ajusta a largura do retângulo
              height="26.4" // Mantém a altura fixa para evitar cortes
              rx="7.2"
              className="transition-all duration-[600ms] ease-in-out opacity-0 group-hover:opacity-100 group-hover:delay-150" // Transição suave para o gradiente de fundo
              fill="url(#paint0_linear_209_529)" // Aplica o gradiente ao fundo
            />
            {/* Borda do botão */}
            <rect
              x="1.8"
              y="0.8"
              width={textWidth + 32 - 3.6} // Ajusta a largura da borda
              height="26.4" // Mantém a altura fixa da borda
              rx="7.2"
              stroke="url(#paint1_linear_209_529)" // Aplica o gradiente na borda
              strokeWidth="1.6"
            />
            <defs>
              {/* Gradiente de fundo para hover */}
              <linearGradient
                id="paint0_linear_209_529"
                x1="385"
                y1="26"
                x2="385"
                y2="02"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#FDFDFD" stopOpacity="0.16" />
                <stop offset="0.87" stopColor="#FDFDFD" stopOpacity="0" />
              </linearGradient>

              {/* Gradiente para a borda */}
              <linearGradient
                id="paint1_linear_209_529"
                x1="131"
                y1="0"
                x2="131"
                y2="28"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#FDFDFD" />
                <stop offset="0.925" stopColor="#FDFDFD" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </button>
    </div>
  )
}

export default ButtonQuad

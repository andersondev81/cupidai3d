import React, { useRef, useState } from "react"
import Lottie from "lottie-react"
import animationData from "../../assets/lottie/buttonX.json"

const ButtonIcon = ({ text, onClick }) => {
  const lottieRef = useRef(null)
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseEnter = () => {
    setIsHovering(true)
    lottieRef.current?.playSegments([0, 91], true)
  }

  const handleMouseLeave = () => {
    if (isHovering) {
      // Continuar a animação até o final mesmo que o mouse saia
      lottieRef.current?.playSegments([91, 91], true) // ou o último frame da animação
    }
    setIsHovering(false)
  }

  return (
    <div className="flex items-center justify-center">
      {/* Contêiner com o fundo vermelho ajustado ao botão */}
      <div className="inline-block">
        <button
          className="flex flex-row items-center text-white px-2 pr-4"
          onClick={onClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Lottie Animation */}
          <div
            style={{
              display: "inline-block",
              cursor: "pointer",
            }}
          >
            <Lottie
              lottieRef={lottieRef}
              animationData={animationData}
              loop={false}
              autoplay={false}
              style={{ height: 45, width: 45 }} // Ajuste o tamanho conforme necessário
            />
          </div>

          {/* Button Text */}
          <span className="text-center hover:tracking-wide transition-all ease-out duration-300">
            {text}
          </span>
        </button>
      </div>
    </div>
  )
}

export default ButtonIcon

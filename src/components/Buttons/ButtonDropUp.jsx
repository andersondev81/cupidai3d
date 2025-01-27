import React, { useRef, useState } from "react"
import Lottie from "lottie-react"
import animationData from "../../assets/lottie/buttonDropUp.json"

const ButtonDropUp = ({ onClick }) => {
  const lottieRef = useRef(null)
  const [isForward, setIsForward] = useState(true) // Estado para controlar a direção da animação

  const handleClick = () => {
    if (isForward) {
      lottieRef.current?.playSegments([0, 60], true) // Animação vai do frame 0 ao 60
    } else {
      lottieRef.current?.playSegments([60, 0], true) // Animação volta do frame 60 ao 0
    }
    setIsForward(!isForward) // Alterna a direção no próximo clique
    onClick() // Chama a função para abrir/fechar o modal
  }

  return (
    <div
      onClick={handleClick}
      style={{
        display: "inline-block",
        cursor: "pointer",
        position: "relative", // Garante que o botão tenha posição relativa
        zIndex: 20, // Coloca o botão acima de outros elementos
      }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false}
        autoplay={false}
        style={{
          height: 45,
          width: 45,
          objectFit: "contain", // Garante que a animação não fique distorcida
        }}
      />
    </div>
  )
}

export default ButtonDropUp

import React, { useRef, useState } from "react"
import Lottie from "lottie-react"
import animationData from "../../assets/lottie/buttonHamburgerV2.json"

const ButtonHamburgerV2 = () => {
  const lottieRef = useRef(null)
  const [isForward, setIsForward] = useState(true) // Estado para controlar a direção da animação

  const handleClick = () => {
    if (isForward) {
      lottieRef.current?.playSegments([0, 46], true) // Animação vai do frame 0 ao 45
    } else {
      lottieRef.current?.playSegments([46, 0], true) // Animação volta do frame 45 ao 0
    }
    setIsForward(!isForward) // Alterna a direção no próximo clique
  }

  return (
    <div
      onClick={handleClick}
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
        style={{ height: 36, width: 36 }} // Ajuste o tamanho conforme necessário
        className="m-2"
      />
    </div>
  )
}

export default ButtonHamburgerV2

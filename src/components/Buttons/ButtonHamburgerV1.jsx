import React, { useRef, useState } from "react"
import Lottie from "lottie-react"
import animationData from "../../assets/lottie/buttonhamburger.json"

const ButtonHamburgerV1 = () => {
  const lottieRef = useRef(null)
  const [isForward, setIsForward] = useState(true) // Estado para controlar a direção da animação

  const handleClick = () => {
    if (isForward) {
      lottieRef.current?.playSegments([0, 17], true)
    } else {
      lottieRef.current?.playSegments([17, 0], true)
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
        style={{ height: 36, width: 36 }}
        className="m-2"
      />
    </div>
  )
}

export default ButtonHamburgerV1

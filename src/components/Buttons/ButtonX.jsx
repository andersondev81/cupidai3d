import React, { useRef } from "react"
import Lottie from "lottie-react"
import animationData from "../../assets/lottie/buttonX.json"

const ButtonX = () => {
  const lottieRef = useRef(null)

  const handleMouseEnter = () => {
    lottieRef.current?.playSegments([0, 90], true)
  }

  const handleMouseLeave = () => {
    lottieRef.current?.playSegments([90, 0], true)
  }

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
        style={{ height: 34, width: 34 }} // Ajuste o tamanho conforme necessário
      />
    </div>
  )
}

export default ButtonX

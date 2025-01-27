import React, { useRef } from "react"
import Lottie from "lottie-react"
import animationData from "../../assets/lottie/buttonNext.json"

const ButtonNext = () => {
  const lottieRef = useRef(null)

  const handleMouseEnter = () => {
    lottieRef.current?.playSegments([0, 60], true)
  }

  const handleMouseLeave = () => {
    lottieRef.current?.playSegments([60, 0], true)
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
        style={{ height: 45, width: 45 }}
      />
    </div>
  )
}

export default ButtonNext

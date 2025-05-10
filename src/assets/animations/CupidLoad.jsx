import React, { useRef, useState } from "react"
import Lottie from "lottie-react"
import animationData from "./CupidLoad24.json"

const CupidLoad = () => {
  const lottieRef = useRef()
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false)

  const handleComplete = () => {
    if (!hasPlayedOnce) {
      setHasPlayedOnce(true)
      lottieRef.current?.playSegments([150, 230], true)
    } else {
      lottieRef.current?.playSegments([150, 230], true)
    }
  }

  const handleDOMLoaded = () => {
    lottieRef.current?.playSegments([0, 230], true)
  }

  return (
    <div style={{ display: "inline-block" }}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false} // controle total via playSegments
        onComplete={handleComplete}
        onDOMLoaded={handleDOMLoaded}
        style={{ height: 86, width: 86 }}
      />
    </div>
  )
}

export default CupidLoad

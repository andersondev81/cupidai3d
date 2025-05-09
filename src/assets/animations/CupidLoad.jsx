import React, { useRef, useState } from "react"
import Lottie from "lottie-react"
import animationData from "./CupidLoad.json"

const CupidLoad = () => {
  const lottieRef = useRef()
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false)

  const handleComplete = () => {
    if (!hasPlayedOnce) {
      setHasPlayedOnce(true)
      lottieRef.current?.playSegments([85, 125], true)
    } else {
      lottieRef.current?.playSegments([85, 125], true)
    }
  }

  const handleDOMLoaded = () => {
    lottieRef.current?.playSegments([0, 125], true)
  }

  return (
    <div style={{ display: "inline-block" }}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={false} // controle total via playSegments
        onComplete={handleComplete}
        onDOMLoaded={handleDOMLoaded}
        speed={0.5}
        style={{ height: 86, width: 86 }}
      />
    </div>
  )
}

export default CupidLoad

import React, { useRef, useState } from "react"
import Lottie from "lottie-react"
import animationData from "./CupidLoad.json"

const CupidLoad = () => {
  const lottieRef = useRef()
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false)

  const handleComplete = () => {
    if (!hasPlayedOnce) {
      setHasPlayedOnce(true)
      lottieRef.current?.playSegments([86, 125], true)
    } else {
      // Reforça o loop manual da parte 71–100
      lottieRef.current?.playSegments([86, 125], true)
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
        style={{ height: 86, width: 86 }}
      />
    </div>
  )
}

export default CupidLoad

import React, { useRef, useEffect, useState } from "react"
import Lottie from "lottie-react"
import animationData from "../../assets/lottie/MusicPlayer.json"

const MusicPlayer = () => {
  const lottieRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)

  // Configuração para iniciar a animação do 0 ao 90 e repetir
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.playSegments([0, 90], true) // Loop entre 0 e 90
    }
  }, [])

  const handleClick = () => {
    if (lottieRef.current) {
      if (isPlaying) {
        // Pause
        lottieRef.current.pause()
      } else {
        // Play a partir do ponto atual
        lottieRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div
      style={{
        display: "inline-block",
        cursor: "pointer",
      }}
      onClick={handleClick}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        autoplay={true} // Não começa automaticamente
        loop={true} // Loop entre 0 e 90
        style={{ height: 28, width: 28 }}
      />
    </div>
  )
}

export default MusicPlayer

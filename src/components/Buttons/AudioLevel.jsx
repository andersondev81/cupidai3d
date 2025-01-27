import React, { useRef, useState, useEffect } from "react"
import Lottie from "lottie-react"
import animationData from "../../assets/lottie/AudioLevel.json"

const AudioLevel = () => {
  const lottieRef = useRef(null)
  const [clickCount, setClickCount] = useState(0) // Contador para gerenciar os cliques
  const [isLooping, setIsLooping] = useState(true) // Controla se o loop está ativado

  useEffect(() => {
    if (isLooping) {
      // Loop contínuo de 0 a 29
      lottieRef.current?.playSegments([0, 29], true)
    } else if (clickCount === 0) {
      // Vai de 30 a 60 uma vez
      lottieRef.current?.playSegments([60, 60], false)
    } else if (clickCount === 1) {
      // Vai de 60 a 0 em reverse
      lottieRef.current?.playSegments([60, 0], true)
      setClickCount(0) // Reinicia o contador para reiniciar o loop de 0 a 60
      setIsLooping(true) // Ativa o loop novamente
    }
  }, [clickCount, isLooping])

  const handleClick = () => {
    if (isLooping) {
      // Desativa o loop de 0 a 60 após o primeiro clique
      setIsLooping(false)
    } else {
      // Alterna entre os estados de cliques
      setClickCount(prevCount => (prevCount + 1) % 3)
    }
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
        loop={isLooping} // Loop só ocorre se isLooping for true
        autoplay={true} // A animação começa automaticamente
        style={{ height: 22, width: 22 }} // Ajuste o tamanho conforme necessário
        speed={1} // Diminui a velocidade da animação (ajuste conforme necessário)
      />
    </div>
  )
}

export default AudioLevel

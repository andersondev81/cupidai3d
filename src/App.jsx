// App.jsx
import React, { useEffect, useState } from "react"
import Experience from "./pages/Experience"
import ExperienceMobile from "./pages/ExperienceMobile"

function App() {
  const [isMobile, setIsMobile] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Detecta se é mobile
    const checkMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    }

    // Detecta se é iOS especificamente
    const checkIOS = () => {
      return (
        /iPad|iPhone|iPod/.test(navigator.platform) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
      )
    }

    setIsMobile(checkMobile())
    setIsIOS(checkIOS())
  }, [])

  // Use a versão otimizada para iOS, a versão mobile para outros dispositivos móveis,
  // ou a versão completa para desktop
  return (
    <div className="w-full h-screen">
      {isIOS ? (
        <ExperienceMobile />
      ) : isMobile ? (
        <ExperienceMobile />
      ) : (
        <Experience />
      )}
    </div>
  )
}

export default App

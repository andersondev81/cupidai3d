import React, { useEffect, useState, useRef } from "react"
import "./LoadingUI.css"
import CupidLoad from "../../assets/animations/CupidLoad"

const LoadingUI = ({ onAnimationComplete }) => {
  const [progress, setProgress] = useState(0)
  const [showStartButton, setShowStartButton] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [actionsVisible, setActionsVisible] = useState(false)
  const animationRef = useRef()
  const targetProgress = useRef(0)
  const easingFactor = 0.1

  useEffect(() => {
    const animate = () => {
      setProgress(prev => {
        const diff = targetProgress.current - prev
        const newProgress =
          Math.abs(diff) < 0.1
            ? targetProgress.current
            : prev + diff * easingFactor

        if (newProgress >= 100 && !showStartButton) {
          setShowStartButton(true)
          // Adiciona um pequeno delay para o fade-in
          setTimeout(() => setActionsVisible(true), 100)
        }

        return newProgress
      })

      if (progress < 100) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationRef.current)
  }, [progress, showStartButton])

  useEffect(() => {
    const handleProgress = e => {
      targetProgress.current = e.detail.progress
    }

    const handleComplete = () => {
      targetProgress.current = 100
    }

    window.addEventListener("loading-progress", handleProgress)
    window.addEventListener("loading-complete", handleComplete)

    return () => {
      window.removeEventListener("loading-progress", handleProgress)
      window.removeEventListener("loading-complete", handleComplete)
    }
  }, [])

  const handleStart = () => {
    setIsLoaded(true)
    setTimeout(() => onAnimationComplete?.(), 1000)
  }

  return (
    <div className={`loading-screen ${isLoaded ? "loaded" : ""}`}>
      <div className="loading-content">
        <div className="loading-animation">
          <CupidLoad />
        </div>

        <div className="loading-progress">{Math.floor(progress)}%</div>

        {showStartButton && (
          <div className={`loading-actions ${actionsVisible ? "visible" : ""}`}>
            <div className="loading-buttons flex flex-row items-center">
              <p className="loading-prompt">MUSIC</p>
              <button onClick={handleStart} className="loading-button">
                ON
              </button>
              <button onClick={handleStart} className="loading-button">
                OFF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoadingUI

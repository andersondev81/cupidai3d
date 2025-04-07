import React, { useState, useEffect } from "react"
import { Html } from "@react-three/drei"

const Modeload = ({ onStart }) => {
  const [progress, setProgress] = useState(0)
  const [loadingComplete, setLoadingComplete] = useState(false)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(() => setLoadingComplete(true), 500)
          return 100
        }
        return prev + 1
      })
    }, 30)
    return () => clearInterval(timer)
  }, [])

  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-8 p-12 bg-black/30 backdrop-blur-md rounded-2xl min-w-[320px]">
        {!loadingComplete ? (
          <>
            <img
              src="/images/logo.jpeg"
              alt="Logo"
              className="w-32 h-32 rounded-full shadow-lg transition-opacity duration-500"
            />
            <div className="w-full">
              <div className="h-[2px] w-full bg-white/10 relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-white/80 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={onStart}
            className="w-full py-3 text-sm font-medium text-black bg-white/90
                     rounded-lg transition-all duration-300 hover:bg-white
                     focus:outline-none focus:ring-2 focus:ring-white/50
                     animate-fadeIn"
          >
            Ready
          </button>
        )}
      </div>
    </Html>
  )
}

export default Modeload
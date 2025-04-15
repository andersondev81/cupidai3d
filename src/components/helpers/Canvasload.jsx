import React, { useEffect, useState } from "react"
import { Html, useProgress } from "@react-three/drei"

// This version can be used both inside and outside a Canvas context
const Canvasload = ({ insideCanvas = false }) => {
  // Only use Three.js hooks when inside a Canvas
  const threeProgress = insideCanvas ? useProgress() : { progress: 0, item: null, loaded: 0, total: 0 }

  // For non-Canvas usage, create a simulated progress
  const [simulatedProgress, setSimulatedProgress] = useState(0)
  const [showText, setShowText] = useState(false)

  useEffect(() => {
    // Only run the simulation when outside Canvas
    if (!insideCanvas) {
      const interval = setInterval(() => {
        setSimulatedProgress(prev => {
          // Simulate a realistic loading curve (starts fast, slows down)
          if (prev < 80) return prev + 3
          if (prev < 95) return prev + 0.5
          if (prev < 100) return prev + 0.1
          return 100
        })
      }, 50)

      // Show loading text after a small delay for better UX
      const textTimer = setTimeout(() => {
        setShowText(true)
      }, 500)

      return () => {
        clearInterval(interval)
        clearTimeout(textTimer)
      }
    } else {
      // Still show text after delay when inside Canvas
      const textTimer = setTimeout(() => {
        setShowText(true)
      }, 500)

      return () => clearTimeout(textTimer)
    }
  }, [insideCanvas])

  // Use Three.js progress when inside Canvas, otherwise use simulated
  const progress = insideCanvas ? threeProgress.progress : simulatedProgress
  const item = insideCanvas ? threeProgress.item : null
  const loaded = insideCanvas ? threeProgress.loaded : Math.floor((progress / 100) * 5)
  const total = insideCanvas ? threeProgress.total : 5

  // Component for the actual loader UI
  const LoaderContent = () => (
    <div className="loader-container w-64 h-64 flex flex-col items-center justify-center bg-black/80 rounded-lg">
      {/* Castle Icon */}
      <div className="mb-6">
        <div className="castle-icon w-16 h-16 relative">
          <div className="castle-main bg-pink-500/80 w-12 h-12 rounded-t-lg absolute bottom-0 left-1/2 transform -translate-x-1/2"></div>
          <div className="castle-tower-left bg-pink-500/80 w-3 h-6 rounded-t-lg absolute bottom-6 left-1/2 transform -translate-x-1/2 -ml-5"></div>
          <div className="castle-tower-right bg-pink-500/80 w-3 h-6 rounded-t-lg absolute bottom-6 left-1/2 transform -translate-x-1/2 ml-5"></div>
          <div className="castle-door bg-pink-900/80 w-3 h-5 rounded-t-lg absolute bottom-0 left-1/2 transform -translate-x-1/2"></div>
        </div>
      </div>

      {/* Loading Progress Bar */}
      <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Loading Text */}
      <div className="mt-4 text-center">
        <p className="text-white text-xl font-medium">
          {Math.floor(progress)}% {showText && (
            <span className="loading-text">
              {progress < 100 ? "Loading..." : "Ready!"}
            </span>
          )}
        </p>
        {loaded > 0 && (
          <p className="text-white/60 text-sm mt-1">
            {item ? `Loading: ${item}` : `${loaded} of ${total}`}
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .castle-main, .castle-tower-left, .castle-tower-right {
          animation: pulse 2s infinite;
        }

        .castle-tower-left {
          animation-delay: 0.3s;
        }

        .castle-tower-right {
          animation-delay: 0.6s;
        }

        .loading-text:after {
          content: '';
          animation: dots 1.5s infinite;
        }

        @keyframes dots {
          0%, 20% { content: ''; }
          40% { content: '.'; }
          60% { content: '..'; }
          80%, 100% { content: '...'; }
        }
      `}</style>
    </div>
  )

  // When inside a Canvas, wrap with Html
  if (insideCanvas) {
    return (
      <Html center>
        <LoaderContent />
      </Html>
    )
  }

  // When outside Canvas, render directly
  return (
    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-black z-50">
      <LoaderContent />
    </div>
  )
}

export default Canvasload
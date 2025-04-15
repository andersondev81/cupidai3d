import { useEffect, useState, Suspense } from "react"
import Experience from "./pages/Experience"
import Canvasload from "./components/helpers/Canvasload"

function App() {
  const [isMobileDevice, setIsMobileDevice] = useState(null)
  const [isExperienceLoaded, setIsExperienceLoaded] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      setIsMobileDevice(mobileRegex.test(userAgent) || window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    // Track when experience is loaded and ready
    const handleSceneReady = () => {
      setIsExperienceLoaded(true)
    }

    window.addEventListener("scene-ready", handleSceneReady)

    return () => {
      window.removeEventListener("resize", checkMobile)
      window.removeEventListener("scene-ready", handleSceneReady)
    }
  }, [])

  // Show loading screen until mobile status is determined
  if (isMobileDevice === null) {
    return <Canvasload insideCanvas={false} />
  }

  // Show mobile warning for mobile devices
  if (isMobileDevice) {
    return (
      <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-black text-white p-6">
        <h2 className="text-2xl mb-4">Mobile Experience</h2>
        <p className="text-center mb-6">
          The 3D castle experience works best on desktop. Mobile performance may be limited.
        </p>
        <button
          onClick={() => setIsMobileDevice(false)}
          className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition"
        >
          Continue Anyway
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Experience with 3D castle */}
      <Experience onSceneReady={() => setIsExperienceLoaded(true)} />

      {/* Full-screen loader that stays visible until scene is ready */}
      {!isExperienceLoaded && (
        <div className="fixed inset-0 z-50 bg-black">
          <Canvasload insideCanvas={false} />
        </div>
      )}
    </div>
  )
}

export default App
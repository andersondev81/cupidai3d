import { useEffect, useState } from "react"
import Experience from "./pages/Experience"

function App() {
  const [isMobileDevice, setIsMobileDevice] = useState(null) // Start as null to indicate loading

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i

      setIsMobileDevice(mobileRegex.test(userAgent) || window.innerWidth < 768)
    }

    checkMobile() // Check on mount
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  if (isMobileDevice === null) {
    return <div className="loading">Loading...</div>
  }

  return (
    <>
      <Experience />
    </>
  )
}

export default App

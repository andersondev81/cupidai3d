import { useState, useEffect } from "react"

function useDetectMobile() {
  const [isMobileDevice, setIsMobileDevice] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i

      setIsMobileDevice(mobileRegex.test(userAgent) || window.innerWidth < 768)
    }

    checkMobile()

    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobileDevice
}

export default useDetectMobile

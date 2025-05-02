import React, { useEffect, useRef } from "react"
import lottie from "lottie-web"

const MirrorBg = () => {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      const anim = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "/animations/Mirror.json",
      })

      return () => anim.destroy()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-0 pointer-events-none "
    />
  )
}

export default MirrorBg

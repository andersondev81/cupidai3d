"use client"

import { useProgress, Html } from "@react-three/drei"

const Canvasload = () => {
  const { progress } = useProgress()

  return (
    <Html center>
      <div className="relative inset-0 w-[360px] h-[360px] flex items-center justify-center">
        {/* Loading Progress */}
        <div className="relative z-1 pt-10 text-white text-center">
          <p className="text-[24px] font-semibold">{progress.toFixed(1)}%</p>
          <p className="text-[12px]  ">Loading...</p>
        </div>
      </div>
    </Html>
  )
}

export default Canvasload

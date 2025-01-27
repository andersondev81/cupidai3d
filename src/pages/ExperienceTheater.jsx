// Experience.jsx
import React, { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import CastleTheater from "../assets/models/CastleTheater"

function ExperienceTheater() {
  return (
    <>
      <Canvas
        camera={{ position: [5, 5, 30], fov: 30, near: 1 }}
        gl={{
          preserveDrawingBuffer: true,
        }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <Suspense fallback={null}>
          <CastleTheater />
        </Suspense>
      </Canvas>
    </>
  )
}

export default ExperienceTheater

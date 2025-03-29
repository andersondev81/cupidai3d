// pages/ExperienceMobile.jsx
import React, { useState, useRef, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, OrbitControls } from "@react-three/drei"
import Castle from "../assets/models/Castle"

// Componente de cena com o Castle
const CastleScene = () => {
  console.log("Rendering CastleScene")
  return (
    <>
      {/* Iluminação e ambiente */}
      <ambientLight intensity={0.8} />
      <Environment preset="sunset" />

      {/* Castle com configurações mínimas */}
      <Castle
        scale={[2, 2, 2]}
        activeSection="nav"
      />

      {/* Controles de câmera simplificados */}
      <OrbitControls
        maxPolarAngle={Math.PI/2}
        minDistance={5}
        maxDistance={30}
      />
    </>
  )
}

// Componente principal
const ExperienceMobile = () => {
  console.log("Rendering ExperienceMobile component")

  return (
    <div className="relative w-full h-screen bg-black">
      <div className="absolute inset-0">
        <Canvas
          className="w-full h-full"
          gl={{
            antialias: false,
            powerPreference: "default"
          }}
          dpr={1}
          camera={{
            fov: 60,
            near: 0.1,
            far: 1000,
            position: [15.9, 6.8, -11.4] // Posição inicial da câmera
          }}
        >
          <Suspense fallback={null}>
            <CastleScene />
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

export default ExperienceMobile
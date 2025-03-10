// pages/ExperienceMobile.jsx - Versão com Cubo Girando
import React, { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

// Componente do cubo girando
const SpinningCube = () => {
  const cubeRef = useRef()

  useFrame(state => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x += 0.01
      cubeRef.current.rotation.y += 0.01
    }
  })

  return (
    <mesh ref={cubeRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="hotpink" />
    </mesh>
  )
}

// Experiência móvel com apenas um cubo
const ExperienceMobile = () => {
  return (
    <div className="relative w-full h-screen">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{
          antialias: false,
          powerPreference: "default",
          alpha: false,
        }}
        dpr={1}
      >
        {/* Iluminação básica */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        {/* Cor de fundo simples */}
        <color attach="background" args={["#87CEEB"]} />

        {/* Cubo girando */}
        <SpinningCube />

        {/* Controls */}
        <OrbitControls
          enableDamping={false}
          enableZoom={true}
          enablePan={false}
          enableRotate={true}
        />
      </Canvas>
    </div>
  )
}

export default ExperienceMobile

// pages/ExperienceMobile.jsx - Versão super básica
import React, { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"

// Componente do cubo girando
const SpinningCube = () => {
  const cubeRef = useRef()

  useFrame(() => {
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

// Experiência móvel super simplificada
const ExperienceMobile = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas>
        <ambientLight intensity={1} />
        <SpinningCube />
      </Canvas>
    </div>
  )
}

export default ExperienceMobile

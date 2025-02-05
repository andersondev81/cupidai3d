import React, { useRef } from "react"
import { Cloud } from "@react-three/drei"

function CloudsD() {
  const lightRefRed = useRef()
  const lightRefBlue = useRef()

  return (
    <group>
      {/* Luz Direcional - Fixa */}
      <directionalLight
        position={[10, 10, 10]}
        intensity={0.2}
        castShadow={true}
      />

      {/* Luz Vermelha - Intensidade fixa */}
      <spotLight
        ref={lightRefRed}
        color="#fb6f92"
        position={[5, 6, 5]}
        angle={0.5}
        decay={0.85}
        distance={55}
        penumbra={-1}
        intensity={1.2} // Intensidade fixa
        castShadow={true}
      />

      {/* Luz Azul - Intensidade fixa */}
      <spotLight
        ref={lightRefBlue}
        position={[0, -3, 0]}
        color="#fb6f60"
        angle={0.4}
        decay={0.55}
        distance={85}
        penumbra={4}
        intensity={1.2} // Intensidade fixa
        castShadow={true}
      />

      {/* Chão de Nuvens */}
      {[...Array(50)].map((_, i) => (
        <Cloud
          key={i}
          position={[Math.random() * 14 - 7, -1, Math.random() * 14 - 7]}
          speed={0.1}
          opacity={1}
          segments={40}
          color={"#fff"}
          lightning={true}
          bounds={[26, 4, 16]}
          fade={30}
          growth={4}
          scale={[0.2, 0.2, 0.2]}
          seed={i * 20}
        />
      ))}
    </group>
  )
}

export default CloudsD

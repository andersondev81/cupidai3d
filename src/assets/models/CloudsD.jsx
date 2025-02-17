import React, { useMemo, useRef } from "react"
import { Cloud } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"

function CloudsD() {
  const groupRef = useRef()

  // Combinar as duas camadas de nuvens em uma única geração
  const cloudPositions = useMemo(() => {
    return [...Array(30)].map((_, i) => ({ // Reduzido de 50 para 30 nuvens
      position: [
        Math.random() * 14 - 8,
        -1 + (Math.random() * 0.2 - 0.1), // Pequena variação na altura
        Math.random() * 14 - 7
      ],
      seed: i * 30,
      isSecondLayer: i < 15, // Primeiras 15 nuvens são da segunda camada
    }))
  }, [])

  // Skip frames para melhor performance
  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.children.forEach((cloud, i) => {
      // Atualiza apenas a cada 2 frames
      if (i % 2 === 0) return
      if (cloud.material) {
        cloud.material.needsUpdate = true
      }
    })
  })

  return (
    <group ref={groupRef}>
      {cloudPositions.map(({ position, seed, isSecondLayer }) => (
        <Cloud
          key={seed}
          position={position}
          speed={0.1}
          opacity={0.9} 
          segments={15}
          color={isSecondLayer ? "#fff" : "#ffe8d6"}
          bounds={isSecondLayer ? [26, 1, 16] : [26, 4, 16]}
          scale={[0.2, 0.15, 0.2]}
          seed={seed}
          depthWrite={false}
          frustumCulled={true}
          renderOrder={isSecondLayer ? 1 : 0}
        >
          <meshBasicMaterial
            transparent
            opacity={isSecondLayer ? 0.8 : 1}
            depthTest={true}
            fog={true}
          />
        </Cloud>
      ))}
    </group>
  )
}

export default React.memo(CloudsD, (prevProps, nextProps) => {
  return true
})
import React, { useMemo } from "react"
import { Cloud } from "@react-three/drei"

function CloudsD() {
  // Memoize cloud positions to prevent unnecessary recalculations
  const cloudPositions = useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      position: [Math.random() * 14 - 8, -1, Math.random() * 14 - 7],
      seed: i * 30,
    }))
  }, []) // Empty dependency array ensures this is calculated only once

  return (
    <group>
      {/* Luz Direcional - Otimizada */}
      {/* <directionalLight
        position={[10, 10, 10]}
        intensity={0.2}
        castShadow={false} // Remove shadow if not critical
      /> */}

      {/* Luzes de Spot - Reduzidas */}
      {/* <spotLight
        color="#ffe8d6"
        position={[5, 6, 5]}
        angle={0.5}
        decay={0.85}
        distance={55}
        intensity={1.2}
      /> */}
      {/* <spotLight
        position={[0, -3, 0]}
        color="#fb6f60"
        angle={0.4}
        decay={0.55}
        distance={85}
        intensity={1.2}
      /> */}

      {/* Renderização otimizada de nuvens */}
      {cloudPositions.map(({ position, seed }) => (
        <Cloud
          key={seed}
          position={position}
          speed={0.1}
          opacity={1}
          segments={20}
          color="#ffe8d6"
          bounds={[26, 4, 16]}
          scale={[0.2, 0.15, 0.2]}
          seed={seed}
        />
      ))}
      {cloudPositions.map(({ position, seed }) => (
        <Cloud
          key={seed}
          position={position}
          speed={0.1}
          opacity={1}
          segments={20}
          color="#fff"
          bounds={[26, 1, 16]}
          scale={[0.2, 0.15, 0.2]}
          seed={seed}
        />
      ))}
    </group>
  )
}

export default React.memo(CloudsD)

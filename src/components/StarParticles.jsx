import { Points, PointMaterial } from "@react-three/drei"
import { useMemo } from "react"
import * as THREE from "three"

const StarParticles = ({
  count = 200,
  size = 1, // Tamanho aumentado
  color = "#ffff00",
  opacity = 1,
  scale = [10, 10, 10],
  position = [0, 0, 0], // Posição mais alta
}) => {
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 20 // Área maior
    }
    return new THREE.BufferAttribute(positions, 3)
  }, [count])

  return (
    <group position={position} scale={scale}>
      <Points>
        <bufferGeometry attach="geometry">
          <bufferAttribute attach="attributes-position" {...particles} />
        </bufferGeometry>
        <PointMaterial
          attach="material"
          size={size}
          color={color}
          transparent
          opacity={opacity}
          sizeAttenuation={true}
          alphaTest={0.01}
        />
      </Points>
    </group>
  )
}

export default StarParticles

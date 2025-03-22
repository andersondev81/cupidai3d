import React, { useMemo, useRef, useEffect } from "react"
import { Cloud } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

function CloudsPole() {
  const groupRef = useRef()

  // Fixed values instead of Leva controls
  const baseHeight = -0.31
  const distributionX = 0.3
  const distributionZ = 0.3
  const cloudCount = 8
  const opacity = 1
  const segments = 10
  const primaryColor = "#f5b1a4"
  const secondaryColor = "#fadbd5"
  const scaleX = 0.03
  const scaleY = 0.03
  const scaleZ = 0.03
  const primaryGrowth = 5
  const secondaryGrowth = 3
  const animationSpeed = 0.005
  const animationIntensity = 0.4
  const positionX = -0.7
  const positionY = 0.0 // Novo parâmetro para controlar a posição Y do grupo inteiro
  const positionZ = 5.66

  // Bounds fixos já que estavam comentados no código original
  const primaryBounds = [1, 0.1, 1]
  const secondaryBounds = [1, 1, 1]

  // Scale atualizado com useMemo para responder a mudanças
  const scale = useMemo(() => {
    return [scaleX, scaleY, scaleZ]
  }, [scaleX, scaleY, scaleZ])

  // Combinar as duas camadas de nuvens em uma única geração
  const cloudPositions = useMemo(() => {
    return [...Array(cloudCount)].map((_, i) => ({
      position: [
        Math.random() * distributionX - distributionX / 2,
        baseHeight + (Math.random() * 0.3 - 0.1), // Pequena variação na altura para naturalidade
        Math.random() * distributionZ - distributionZ / 2,
      ],
      seed: Math.floor(Math.random() * 1000) + i * 40, // Seeds mais variáveis
      isSecondLayer: i < Math.floor(cloudCount / 2),
    }))
  }, [cloudCount, distributionX, distributionZ, baseHeight])

  // Debug para verificar distribuição
  useEffect(() => {
    console.log("Distribuição X:", distributionX)
    console.log("Distribuição Z:", distributionZ)
  }, [distributionX, distributionZ])

  // Skip frames para melhor performance
  useFrame(() => {
    if (!groupRef.current) return
    groupRef.current.children.forEach((cloud, i) => {
      if (i % 4 === 0) return
      if (cloud.material) {
        cloud.material.needsUpdate = true

        // Ajuste manual para efeito volumétrico
        if (cloud.material instanceof THREE.ShaderMaterial) {
          if (!cloud.material.userData.originalOpacity) {
            cloud.material.userData.originalOpacity =
              cloud.material.uniforms.opacity.value
          }

          // Criar efeito de variação visual
          const time = Date.now() * animationSpeed
          const variation =
            Math.sin(time + i) * animationIntensity +
            (1 - animationIntensity / 2)
          cloud.material.uniforms.opacity.value =
            cloud.material.userData.originalOpacity * variation
        }
      }
    })
  })

  return (
    // Aplicando os controles de posição ao grupo inteiro para mover todas as nuvens juntas
    <group ref={groupRef} position={[positionX, positionY, positionZ]}>
      {cloudPositions.map(({ position, seed, isSecondLayer }) => (
        <Cloud
          key={`cloud-${seed}`}
          position={position}
          speed={0.2}
          opacity={opacity}
          segments={segments}
          color={isSecondLayer ? secondaryColor : primaryColor}
          bounds={isSecondLayer ? secondaryBounds : primaryBounds}
          scale={scale}
          seed={seed}
          depthWrite={false}
          frustumCulled={true}
          renderOrder={isSecondLayer ? 1 : 0}
          growth={isSecondLayer ? secondaryGrowth : primaryGrowth}
        />
      ))}
    </group>
  )
}

export default CloudsPole

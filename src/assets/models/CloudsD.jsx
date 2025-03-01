import React, { useMemo, useRef, useEffect } from "react"
import { Cloud } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useControls } from "leva"
import * as THREE from "three"

function CloudsD() {
  const groupRef = useRef()

  // Controles completos incluindo movimento X, Y e Z
  const {
    baseHeight,
    distributionX,
    distributionZ,
    cloudCount,
    opacity,
    segments,
    primaryColor,
    secondaryColor,
    scaleX,
    scaleY,
    scaleZ,
    primaryGrowth,
    secondaryGrowth,
    animationSpeed,
    animationIntensity,
    // Novos controles de posição
    positionX,
    positionZ,
  } = useControls("Clouds", {
    // Distribuição espacial
    baseHeight: { value: -0.51, min: -5, max: 15, step: 0.01 },
    distributionX: { value: 7.0, min: 2, max: 30, step: 0.5 },
    distributionZ: { value: 7.0, min: 2, max: 30, step: 0.5 },

    // Controles de movimento (NOVOS)
    positionX: { value: 0, min: -20, max: 20, step: 0.5, label: "Left/Right" },
    positionZ: { value: 0, min: -20, max: 20, step: 0.5, label: "Forward/Back" },

    // Aparência das nuvens
    cloudCount: { value: 30, min: 10, max: 100, step: 1 },
    opacity: { value: 1, min: 0.1, max: 1.5, step: 0.1 },
    segments: { value: 10, min: 10, max: 160, step: 1 },
    primaryColor: { value: "#f5b1a4" },
    secondaryColor: { value: "#fadbd5" },

    // Tamanho
    scaleX: { value: 0.08, min: 0.01, max: 0.5, step: 0.01 },
    scaleY: { value: 0.08, min: 0.01, max: 0.5, step: 0.01 },
    scaleZ: { value: 0.08, min: 0.01, max: 0.5, step: 0.01 },

    // Crescimento
    primaryGrowth: { value: 10, min: 0.1, max: 20, step: 0.1 },
    secondaryGrowth: { value: 5, min: 0.1, max: 20, step: 0.1 },

    // Animação
    animationSpeed: { value: 0.005, min: 0.001, max: 0.01, step: 0.001 },
    animationIntensity: { value: 0.4, min: 0.1, max: 1, step: 0.1 },
  })

  // Bounds fixos já que estavam comentados no código original
  const primaryBounds = [35, 3, 18]
  const secondaryBounds = [30, 2, 15]

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
    <group ref={groupRef} position={[positionX, 0, positionZ]}>
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

export default CloudsD
import React, { useMemo, useRef, useEffect } from "react"
import { Cloud } from "@react-three/drei"
import PropTypes from "prop-types"
import * as THREE from "three"

// Configurações padrão otimizadas com mais volume
const DEFAULT_PROPS = {
  position: [0, 10, 0],
  scale: [0.3, 0.3, 0.3], // Escala aumentada para melhor volume
  opacity: 1, // Reduzido para melhor sensação de volume
  speed: 0, // Pequeno movimento para realismo
  width: 4, // Largura aumentada
  depth: 1.5, // Profundidade aumentada para volume
  segments: 10, // Aumentado para mais detalhes
  color: "#F0F0F0",
  fade: 100, // Aumentado para transições mais suaves
  concentration: 1.2, // Aumentado para densidade
  windDirection: 0,
  castShadow: true, // Ativado para melhor realismo
  randomness: 0.2, // Aumentado para variação natural
  sizeAttenuation: true, // Ativado para profundidade
  fixedSeed: 1,
  layers: 3, // Nova propriedade para camadas de volume
  density: 0.6, // Nova propriedade para densidade interna
}

const CloudSimpleComponent = ({
  position = DEFAULT_PROPS.position,
  scale = DEFAULT_PROPS.scale,
  opacity = DEFAULT_PROPS.opacity,
  speed = DEFAULT_PROPS.speed,
  width = DEFAULT_PROPS.width,
  depth = DEFAULT_PROPS.depth,
  height,
  segments = DEFAULT_PROPS.segments,
  color = DEFAULT_PROPS.color,
  fade = DEFAULT_PROPS.fade,
  concentration = DEFAULT_PROPS.concentration,
  windDirection = DEFAULT_PROPS.windDirection,
  castShadow = DEFAULT_PROPS.castShadow,
  randomness = DEFAULT_PROPS.randomness,
  sizeAttenuation = DEFAULT_PROPS.sizeAttenuation,
  fixedSeed = DEFAULT_PROPS.fixedSeed,
  layers = DEFAULT_PROPS.layers, // Nova prop
  density = DEFAULT_PROPS.density, // Nova prop
  ...rest
}) => {
  const cloudRef = useRef()
  const groupRef = useRef()

  // Escala com ajuste para volume
  const normalizedScale = useMemo(() => {
    const baseScale = Array.isArray(scale) ? [...scale] : [scale, scale, scale]
    return [
      baseScale[0] * concentration * density,
      baseScale[1] * density,
      baseScale[2] * concentration * density,
    ]
  }, [scale, concentration, density])

  const calculatedHeight = useMemo(() => height ?? width * 0.5, [height, width])

  // Material melhorado para volume
  const cloudMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: Math.min(opacity, 0.9), // Limite ajustado
      side: THREE.DoubleSide,
      roughness: 0.8,
      metalness: 0.0,
      alphaTest: 0.01,
      depthWrite: false,
      sizeAttenuation: sizeAttenuation,
      transmission: 0.2, // Adiciona efeito de sub-surface scattering
      thickness: 0.5, // Espessura para volume
      clearcoat: 0.1,
      clearcoatRoughness: 0.2,
    })
  }, [color, opacity, sizeAttenuation])

  // Rotação e posicionamento para volume
  useEffect(() => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y = windDirection
      cloudRef.current.rotation.x = (position[0] * 0.02) % Math.PI
      cloudRef.current.rotation.z = (position[2] * 0.02) % Math.PI
    }
  }, [windDirection, position])

  // Cria múltiplas camadas para volume
  const renderCloudLayers = useMemo(() => {
    const clouds = []
    for (let i = 0; i < layers; i++) {
      const layerScale = 1 + i * 0.15 // Aumenta gradualmente
      const layerOpacity = opacity * (1 - i * 0.15) // Diminui gradualmente
      const layerPosition = [
        position[0] + (Math.random() - 0.5) * randomness * 2,
        position[1] + (Math.random() - 0.5) * randomness,
        position[2] + (Math.random() - 0.5) * randomness * 2,
      ]

      clouds.push(
        <Cloud
          key={`cloud-layer-${i}`}
          ref={i === 0 ? cloudRef : null}
          seed={fixedSeed + i}
          opacity={layerOpacity}
          speed={speed * (0.8 + Math.random() * 0.4)}
          width={width * layerScale}
          depth={depth * layerScale}
          height={calculatedHeight * layerScale}
          segments={segments}
          color={color}
          fade={fade}
          castShadow={i === 0 && castShadow} // Somente a primeira camada projeta sombra
          material={i === 0 ? cloudMaterial : cloudMaterial.clone()}
          position={layerPosition}
        />
      )
    }
    return clouds
  }, [
    layers,
    opacity,
    speed,
    width,
    depth,
    calculatedHeight,
    segments,
    color,
    fade,
    castShadow,
    cloudMaterial,
    fixedSeed,
    randomness,
    position,
  ])

  return (
    <group ref={groupRef} position={position} scale={normalizedScale} {...rest}>
      {renderCloudLayers}
    </group>
  )
}

// PropTypes atualizados
CloudSimpleComponent.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  scale: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number),
  ]),
  opacity: PropTypes.number,
  speed: PropTypes.number,
  width: PropTypes.number,
  depth: PropTypes.number,
  height: PropTypes.number,
  segments: PropTypes.number,
  color: PropTypes.string,
  fade: PropTypes.number,
  concentration: PropTypes.number,
  windDirection: PropTypes.number,
  castShadow: PropTypes.bool,
  randomness: PropTypes.number,
  sizeAttenuation: PropTypes.bool,
  fixedSeed: PropTypes.number,
  layers: PropTypes.number, // Nova prop
  density: PropTypes.number, // Nova prop
}

export const CloudSimple = React.memo(CloudSimpleComponent)
CloudSimple.displayName = "CloudSimple"
export default CloudSimple

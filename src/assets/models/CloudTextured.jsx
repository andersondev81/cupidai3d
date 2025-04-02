import React, { useMemo, useRef, useEffect } from "react"
import { Cloud } from "@react-three/drei"
import PropTypes from "prop-types"
import * as THREE from "three"

/**
 * Componente de nuvem otimizado com features avançadas
 *
 * @param {Object} props - Propriedades da nuvem
 * @param {Array} [props.position=[0, 10, 0]] - Posição no espaço 3D [x, y, z]
 * @param {number|Array} [props.scale=1] - Escala uniforme ou por eixo [x, y, z]
 * @param {number} [props.opacity=0.6] - Transparência (0 = invisível, 1 = sólido)
 * @param {number} [props.speed=0.1] - Velocidade da animação (0 para estático)
 * @param {number} [props.width=6] - Largura base da nuvem
 * @param {number} [props.depth=0.3] - Espessura/profundidade
 * @param {number} [props.height] - Altura personalizada (opcional)
 * @param {number} [props.segments=12] - Detalhamento geométrico (performance)
 * @param {string|THREE.Color} [props.color="#F0F0F0"] - Cor da nuvem
 * @param {number} [props.fade=0.15] - Suavização das bordas (0-1)
 * @param {number} [props.concentration=1.0] - Densidade da nuvem (0.5-2.0)
 * @param {number} [props.windDirection=0] - Direção do vento em radianos
 * @param {boolean} [props.castShadow=false] - Se a nuvem projeta sombra
 * @param {number} [props.randomness=0.2] - Variação na forma (0-1)
 * @param {boolean} [props.sizeAttenuation=true] - Se o tamanho deve diminuir com a distância
 * @param {Object} [props.rest] - Outras props para o elemento group
 */
const CloudSimpleComponent = ({
  position = [0, 10, 0],
  scale = 1,
  opacity = 0.6,
  speed = 0.1,
  width = 4,
  depth = 0.3,
  height,
  segments = 12,
  color = "#F0F0F0",
  fade = 0.15,
  concentration = 1.0,
  windDirection = 0,
  castShadow = false,
  randomness = 0.2,
  sizeAttenuation = true,
  ...rest
}) => {
  const cloudRef = useRef()
  const groupRef = useRef()

  // Normaliza a escala para array [x, y, z]
  const normalizedScale = useMemo(() => {
    const baseScale = Array.isArray(scale) ? scale : [scale, scale, scale]
    // Aplica concentração para tornar a nuvem mais densa
    return [
      baseScale[0] * concentration,
      baseScale[1],
      baseScale[2] * concentration,
    ]
  }, [scale, concentration])

  // Calcula altura automática se não for fornecida
  const calculatedHeight = useMemo(() => height ?? width * 0.4, [height, width])

  // Efeito para atualizar a direção do vento
  useEffect(() => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y = windDirection
    }
  }, [windDirection])

  // Memoize o material para melhor performance
  const cloudMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: opacity,
      side: THREE.DoubleSide,
      roughness: 0.8,
      metalness: 0.0,
      alphaTest: 0.01,
      depthWrite: false,
      sizeAttenuation: sizeAttenuation, // Adicionado aqui
    })
  }, [color, opacity, sizeAttenuation])

  // Componente Cloud memoizado
  const memoizedCloud = useMemo(
    () => (
      <Cloud
        ref={cloudRef}
        opacity={opacity}
        speed={speed}
        width={width}
        depth={depth}
        height={calculatedHeight}
        segments={segments}
        color={color}
        fade={fade}
        castShadow={castShadow}
        material={cloudMaterial}
      />
    ),
    [
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
    ]
  )

  return (
    <group ref={groupRef} position={position} scale={normalizedScale} {...rest}>
      {memoizedCloud}
    </group>
  )
}

// Validação de props com PropTypes
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
  color: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(THREE.Color),
  ]),
  fade: PropTypes.number,
  concentration: PropTypes.number,
  windDirection: PropTypes.number,
  castShadow: PropTypes.bool,
  randomness: PropTypes.number,
  sizeAttenuation: PropTypes.bool, // Adicionado aqui
}

// Display name para melhor debugging
CloudSimpleComponent.displayName = "CloudSimple"

// Envolve com React.memo para evitar renderizações desnecessárias
export const CloudSimple = React.memo(CloudSimpleComponent)

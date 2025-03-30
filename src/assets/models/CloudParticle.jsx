import React, { useMemo, useRef, useEffect } from "react"
import * as THREE from "three"
import PropTypes from "prop-types"

/**
 * Componente de nuvem baseada em partículas otimizado para performance
 *
 * @param {Object} props - Propriedades do componente
 * @param {number} [props.count=300] - Número de partículas
 * @param {Array} [props.position=[0, 5, 0]] - Posição [x, y, z] da nuvem
 * @param {number} [props.size=1.5] - Tamanho das partículas
 * @param {string} [props.color="white"] - Cor das partículas
 * @param {number} [props.opacity=0.6] - Transparência (0-1)
 * @param {number} [props.spread=20] - Área de dispersão das partículas
 * @param {boolean} [props.noBloom=true] - Se deve ignorar efeitos de bloom
 * @param {Object} [props.rest] - Outras props para o grupo
 */
const CloudParticle = ({
  count = 300,
  position = [0, 0, 0],
  size = 1.5,
  color = "white",
  opacity = 0.6,
  spread = 20,
  noBloom = true,
  ...rest
}) => {
  const groupRef = useRef()

  // Gera posições aleatórias para as partículas
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * spread
    }
    return positions
  }, [count, spread])

  // Configura layer para ignorar bloom se necessário
  useEffect(() => {
    if (groupRef.current && noBloom) {
      groupRef.current.traverse(obj => {
        obj.layers.set(1) // Layer 1 ignora bloom
      })
    }
  }, [noBloom])

  return (
    <group ref={groupRef} position={position} {...rest}>
      <points>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={particles.length / 3}
            array={particles}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          attach="material"
          size={size}
          color={color}
          transparent
          opacity={opacity}
          alphaTest={0.01}
          sizeAttenuation
        />
      </points>
    </group>
  )
}

// Definição de tipos das props
CloudParticle.propTypes = {
  count: PropTypes.number,
  position: PropTypes.arrayOf(PropTypes.number),
  size: PropTypes.number,
  color: PropTypes.string,
  opacity: PropTypes.number,
  spread: PropTypes.number,
  noBloom: PropTypes.bool,
}

// Configurações padrão
CloudParticle.defaultProps = {
  count: 300,
  position: [0, 5, 0],
  size: 1.5,
  color: "white",
  opacity: 0.6,
  spread: 20,
  noBloom: true,
}

// Exportação otimizada com React.memo
export default React.memo(CloudParticle)

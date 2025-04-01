import React from "react"
import { Cloud } from "@react-three/drei"
import PropTypes from "prop-types"

/**
 * Componente de nuvem altamente personalizável com otimização para mobile
 *
 * @param {Object} props - Propriedades da nuvem
 * @param {Array} [props.position=[0, 10, 0]] - Posição no espaço 3D [x, y, z]
 * @param {number|Array} [props.scale=1] - Escala uniforme ou por eixo [x, y, z]
 * @param {number} [props.opacity=0.5] - Transparência (0 = invisível, 1 = sólido)
 * @param {number} [props.speed=0.1] - Velocidade da animação (0 para estático)
 * @param {number} [props.width=6] - Largura base da nuvem
 * @param {number} [props.depth=0.3] - Espessura/profundidade
 * @param {number} [props.height] - Altura personalizada (opcional)
 * @param {number} [props.segments=8] - Detalhamento geométrico (performance)
 * @param {string} [props.color="white"] - Cor da nuvem
 * @param {number} [props.fade=0.1] - Suavização das bordas
 * @param {Object} [props.rest] - Outras props para o elemento group
 */
export const CloudSimple = ({
  position = [0, 10, 0],
  scale = [0.2, 0.2, 0.2],
  opacity = 1,
  speed = 0,
  width = 2,
  depth = 0.2,
  height,
  segments = 7,
  color = "#E8E8E8",
  fade = 0.1,
  ...rest
}) => {
  // Normalização da escala para array 3D
  const normalizedScale = Array.isArray(scale) ? scale : [scale, scale, scale]

  // Cálculo automático de altura se não definido
  const calculatedHeight = height ?? width * 0.5

  return (
    <group position={position} scale={normalizedScale} {...rest}>
      <Cloud
        opacity={opacity}
        speed={speed}
        width={width}
        depth={depth}
        height={calculatedHeight}
        segments={segments}
        color={color}
        fade={fade}
      />
    </group>
  )
}

// Validação de props com PropTypes
CloudSimple.propTypes = {
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
}

// Display name para melhor debugging
CloudSimple.displayName = "CloudSimple"
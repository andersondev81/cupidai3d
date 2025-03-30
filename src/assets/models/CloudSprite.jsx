import React from "react"
import { useTexture, Sprite } from "@react-three/drei"

/**
 * Nuvem usando sprite para dispositivos de baixo desempenho
 * @param {Object} props
 * @param {string} props.textureUrl - URL da textura
 * @param {Array} props.position - Posição [x, y, z]
 * @param {Array} props.scale - Escala [x, y, z]
 */
export const CloudSprite = ({
  textureUrl = "/cloud-sprite.png",
  position = [0, 5, 0],
  scale = [10, 4, 1],
  opacity = 0.7,
}) => {
  const texture = useTexture(textureUrl)

  return (
    <Sprite position={position} scale={scale}>
      <spriteMaterial
        map={texture}
        transparent
        opacity={opacity}
        alphaTest={0.1}
      />
    </Sprite>
  )
}

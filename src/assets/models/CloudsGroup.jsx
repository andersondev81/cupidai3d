import React from "react"
import { CloudSimple } from "./CloudSimple"

/**
 * Grupo de nuvens com posições customizadas
 * @param {Object} props
 * @param {Array} props.clouds - Array de configurações para cada nuvem
 * @param {Object} props.commonProps - Propriedades comuns a todas as nuvens
 */
export const CloudGroup = ({ clouds = [], commonProps = {} }) => {
  return (
    <>
      {clouds.map((cloud, index) => (
        <CloudSimple
          key={`cloud-${index}`}
          position={cloud.position}
          {...commonProps}
          {...cloud} // Sobrescreve as propriedades comuns se especificado
        />
      ))}
    </>
  )
}

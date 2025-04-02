import React from "react"
import PropTypes from "prop-types"
import CloudSimple from "./CloudSimple"

const DEFAULT_CLOUD_PROPS = {
  clouds: [],
  commonProps: {
    fixedSeed: 1, // Seed comum para todas
    sizeAttenuation: false,
    segments: 8, // Padrão otimizado
  },
}

const CloudGroupComponent = ({
  clouds = DEFAULT_CLOUD_PROPS.clouds,
  commonProps = DEFAULT_CLOUD_PROPS.commonProps,
}) => {
  return (
    <>
      {clouds.map((cloud, index) => {
        // Gera key única baseada em posição e seed
        const positionHash = cloud.position ? cloud.position.join("-") : index
        const cloudKey = `cloud-${commonProps.fixedSeed}-${positionHash}`

        return (
          <CloudSimple
            key={cloudKey}
            position={cloud.position}
            {...commonProps}
            {...cloud}
          />
        )
      })}
    </>
  )
}

CloudGroupComponent.propTypes = {
  clouds: PropTypes.arrayOf(
    PropTypes.shape({
      position: PropTypes.arrayOf(PropTypes.number).isRequired,
      // Adicione outras props específicas aqui
    })
  ).isRequired,
  commonProps: PropTypes.shape({
    fixedSeed: PropTypes.number,
    // Outras props comuns
  }),
}

CloudGroupComponent.defaultProps = DEFAULT_CLOUD_PROPS

export const CloudGroup = React.memo(CloudGroupComponent)
export default CloudGroup

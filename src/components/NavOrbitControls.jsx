// src/components/NavOrbitControls.js

import { OrbitControls } from "@react-three/drei"
import { useControls } from "leva"
import React from "react" // Adicionando import do React

const NavOrbitControls = ({ isNavSection }) => {
  // Se não estiver na seção nav, não renderiza nada
  if (!isNavSection) return null

  // Controles para ajuste em desenvolvimento
  const {
    minDistance,
    maxDistance,
    minPolarAngle,
    maxPolarAngle,
    minAzimuthAngle,
    maxAzimuthAngle,
  } = useControls("Nav Camera Limits", {
    minDistance: { value: 2, min: 0.1, max: 250 },
    maxDistance: { value: 30, min: 0.1, max: 150 },
    minPolarAngle: { value: Math.PI * 0.3, min: 0, max: Math.PI },
    maxPolarAngle: { value: Math.PI * 0.6, min: 0, max: Math.PI },
    minAzimuthAngle: { value: -Math.PI * 0.3, min: -Math.PI, max: 0 },
    maxAzimuthAngle: { value: Math.PI * 0.3, min: 0, max: Math.PI },
  })

  return (
    <OrbitControls
      minDistance={minDistance}
      maxDistance={maxDistance}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
      minAzimuthAngle={minAzimuthAngle}
      maxAzimuthAngle={maxAzimuthAngle}
      enablePan={false}
      enableDamping={true}
      dampingFactor={0.05}
      makeDefault={false}
    />
  )
}

export default NavOrbitControls

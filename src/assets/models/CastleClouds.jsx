import React from "react"
import { useGLTF } from "@react-three/drei"
import { useMask } from "@react-three/drei"

export function CastleClouds(props) {
  const { nodes, materials } = useGLTF("/models/castleClouds.glb")
  const stencil = useMask(1, false) // Cria a máscara stencil

  return (
    <group {...props} dispose={null}>
      {/* Máscara invisível para as nuvens */}
      <mesh
        geometry={nodes.castleClouds.geometry}
        visible={false} // Torna invisível
      >
        <meshBasicMaterial {...stencil} colorWrite={false} />
      </mesh>

      {/* Nuvens visíveis com máscara aplicada */}
      <mesh
        geometry={nodes.castleClouds.geometry}
        material={materials.castleClouds}
        customDepthMaterial={stencil} // Aplica a máscara
      />
    </group>
  )
}

useGLTF.preload("/models/castleClouds.glb")

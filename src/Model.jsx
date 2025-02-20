import React from "react"
import { useGLTF } from "@react-three/drei"

export function Model(props) {
  const { nodes, materials } = useGLTF("/models/mirrorIframe.glb")
  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.mirrorIframe.geometry}
        material={nodes.mirrorIframe.material}
        position={[-1.64, 1.393, -0.832]}
        rotation={[-1.567, -0.002, -2.037]}
      />
    </group>
  )
}

useGLTF.preload("/models/mirrorIframe.glb")

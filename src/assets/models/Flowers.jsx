import React, { useEffect } from "react"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

export function Flowers(props) {
  const { nodes, materials } = useGLTF("/models/Flower.glb")

  // Modifica o material para habilitar o alpha
  useEffect(() => {
    if (materials.FlowersBake) {
      materials.FlowersBake.transparent = true
      materials.FlowersBake.alphaTest = 0.2
      materials.FlowersBake.side = THREE.DoubleSide
      materials.FlowersBake.needsUpdate = true
    }
  }, [materials])

  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.Flowers.geometry}
        material={materials.FlowersBake}
      />
    </group>
  )
}

useGLTF.preload("/models/Flower.glb")

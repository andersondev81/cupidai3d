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
      <group position={[0, 2.839, 0]}>
        <mesh geometry={nodes.Mesh011.geometry} material={materials.leaf} />
        <mesh geometry={nodes.Mesh011_1.geometry} material={materials.flower} />
      </group>
    </group>
  )
}

useGLTF.preload("/models/Flower.glb")

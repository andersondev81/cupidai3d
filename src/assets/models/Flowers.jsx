import React, { useEffect } from "react"
import { useGLTF, useTexture } from "@react-three/drei"
import * as THREE from "three"

export function Flowers(props) {
  const { nodes, materials } = useGLTF("/models/Flower.glb")
  const clouds = useTexture("/images/bg1.jpg")

  // Configura o environment map e modifica os materiais
  useEffect(() => {
    if (clouds) {
      clouds.mapping = THREE.EquirectangularReflectionMapping
    }

    if (materials.FlowersBake) {
      materials.FlowersBake.transparent = true
      materials.FlowersBake.alphaTest = 0.2
      materials.FlowersBake.side = THREE.DoubleSide
      materials.FlowersBake.envMap = clouds
      materials.FlowersBake.envMapIntensity = 1.3
      materials.FlowersBake.needsUpdate = true
    }

    if (materials.leaf) {
      materials.leaf.envMap = clouds
      materials.leaf.envMapIntensity = 1.3
      materials.leaf.needsUpdate = true
    }

    if (materials.flower) {
      materials.flower.envMap = clouds
      materials.flower.envMapIntensity = 1.3
      materials.flower.needsUpdate = true
    }
  }, [materials, clouds])

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

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

    if (materials.Flowers_Baked) {
      materials.Flowers_Baked.transparent = true
      materials.Flowers_Baked.alphaTest = 0.2
      materials.Flowers_Baked.side = THREE.DoubleSide
      materials.Flowers_Baked.envMap = clouds
      materials.Flowers_Baked.envMapIntensity = 1.3
      materials.Flowers_Baked.needsUpdate = true
    }
  }, [materials, clouds])

  return (
    <group {...props} dispose={null}>
      <group position={[0, 2.841, 0]}>
        <mesh
          geometry={nodes.Flowers.geometry}
          material={materials.Flowers_Baked}
        />
      </group>
    </group>
  )
}

useGLTF.preload("/models/Flower.glb")

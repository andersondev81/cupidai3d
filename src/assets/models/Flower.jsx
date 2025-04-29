// Flower.jsx
import React, { useMemo } from "react"
import { useGLTF, useTexture } from "@react-three/drei"
import { MeshStandardMaterial, NearestFilter, DoubleSide } from "three"
import * as THREE from "three"

export function Flower(props) {
  const { nodes } = useGLTF("/models/Flower.glb")
  const textures = useTexture({
    diffuse: "/texture/FlowersColor.webp",
    normal: "/texture/Flowers_Baked_PBR_Normal.jpg",
    alpha: "/texture/Flowers_Baked_PBR_Alpha.jpg",
    env: "/images/studio.jpg",
  })

  // Configure textures
  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = false
        texture.minFilter = NearestFilter
        texture.magFilter = NearestFilter
      }
    })
    textures.env.mapping = THREE.EquirectangularReflectionMapping
  }, [textures])

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: textures.diffuse,
        normalMap: textures.normal,
        normalScale: new THREE.Vector2(2, 2), // Ajuste a intensidade aqui
        normalMapType: THREE.TangentSpaceNormalMap, // Tipo do normal map
        alphaMap: textures.alpha,
        envMap: textures.env,
        envMapIntensity: 1.4,
        transparent: true,
        alphaTest: 0.2,
        side: THREE.DoubleSide,
        roughness: 1,
        metalness: 1.2,
      }),
    [textures]
  )

  return (
    <group {...props} dispose={null}>
      <group position={[0, 0, 0]}>
        <mesh geometry={nodes.flowers.geometry} material={material} />
      </group>
    </group>
  )
}

// Preload assets
useGLTF.preload("/models/Flower.glb")
useTexture.preload("/texture/Flowers_Baked_PBR_Diffuse.jpg")
useTexture.preload("/texture/Flowers_Baked_PBR_Normal.jpg")
useTexture.preload("/texture/Flowers_Baked_PBR_Alpha.jpg")
useTexture.preload("/images/bg1.jpg")

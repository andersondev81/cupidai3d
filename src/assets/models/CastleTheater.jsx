import React, { Suspense, useMemo } from "react"
import { useGLTF, useTexture } from "@react-three/drei"
import {
  MeshStandardMaterial,
  DoubleSide,
  NormalBlending,
  NearestFilter,
  Color,
} from "three"

// Componente de material e texturas para o Castelo
const useCastleMaterial = () => {
  const textures = useTexture({
    map: "/texture/project6/CastleColorB.jpg",
    normalMap: "/texture/project6/CastleNormal.jpg",
    emissiveMap: "/texture/project6/CastleEmissive.jpg",
  })

  // Ajustes de texturas
  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = false
        texture.minFilter = texture.magFilter = NearestFilter
      }
    })
  }, [textures])

  return useMemo(() => {
    return new MeshStandardMaterial({
      map: textures.map,
      normalMap: textures.normalMap,
      emissiveMap: textures.emissiveMap,
      emissive: new Color(0xffffff),
      emissiveIntensity: 16,
      transparent: false,
      alphaTest: 0.5,
      side: DoubleSide,
      blending: NormalBlending,
      roughness: 0.5,
      metalness: 0,
    })
  }, [textures])
}

const CastleTheater = () => {
  const { nodes } = useGLTF("/models/project6/Castle.glb")
  const material = useCastleMaterial()

  return (
    <group dispose={null}>
      <mesh geometry={nodes.castleUV_Baked.geometry} material={material} />
    </group>
  )
}

useGLTF.preload("/models/project6/Castle.glb")

export default CastleTheater

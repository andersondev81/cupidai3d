import React, { Suspense, useMemo } from "react"
import { useGLTF, useTexture } from "@react-three/drei"
import {
  Color,
  MeshStandardMaterial,
  DoubleSide,
  NormalBlending,
  NearestFilter,
} from "three"
import Modeload from "../../components/helpers/Modeload"
import StatsPanel from "../../components/helpers/StatsPanel"

// Componente de material e texturas para o Castelo
const useCastleMaterial = () => {
  const textures = useTexture({
    map: "/texture/project6/CastleColorB.jpg",
    normalMap: "/texture/project6/CastleNormal.jpg",
    emissiveMap: "/texture/project6/CastleEmissive.jpg",
  })

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

const CastleModel = () => {
  const { nodes } = useGLTF("/models/project6/Castle.glb")
  const material = useCastleMaterial()

  return (
    <group dispose={null}>
      <mesh
        geometry={nodes.castleUV_Baked.geometry}
        material={material}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={1}
      />
    </group>
  )
}

useGLTF.preload("/models/project6/Castle.glb")

// Componente Principal
const Castle = () => {
  return (
    <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <StatsPanel />
      <Suspense fallback={<Modeload />}>
        <CastleModel />
      </Suspense>
    </group>
  )
}

export default Castle

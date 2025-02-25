import React, { useMemo, useEffect } from "react"
import { useGLTF, useTexture } from "@react-three/drei"
import { useLoader } from "@react-three/fiber"

import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"
import {
  Color,
  MeshPhysicalMaterial,
  DoubleSide,
  NormalBlending,
  NearestFilter,
  EquirectangularReflectionMapping,
} from "three"
import { normalMap } from "three/examples/jsm/nodes/Nodes.js"

const useStairsMaterial = () => {
  // Carregar texturas do Stairs
  const textures = useTexture({
    map: "/texture/stairs_Color.webp",
    normalMap: "/texture/stairs_Normal.webp",
    alphaMap: "/texture/stairs_Alpha.webp",
    roughnessMap: "/texture/stairs_Roughness.webp",
  })

  // Carregar HDR específico para o Stairs
  const envMap = useLoader(RGBELoader, "/images/PanoramaV1.hdr")
  envMap.mapping = EquirectangularReflectionMapping

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = false
        texture.minFilter = NearestFilter
        texture.magFilter = NearestFilter
      }
    })
  }, [textures])

  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        ...textures,
        color: 0x62bfed,
        transparent: true,
        alphaTest: 0.01,
        depthWrite: true,
        depthTest: true,
        side: DoubleSide,
        blending: NormalBlending,
        roughness: 0.4,
        metalness: 0.6,
      }),
    [textures, envMap]
  )

  // Força atualização quando o HDR for carregado
  useEffect(() => {
    if (envMap) {
      material.needsUpdate = true
    }
  }, [envMap, material])

  return material
}

export function Stairs(props) {
  const { nodes } = useGLTF("/models/stairs.glb")
  const material = useStairsMaterial()

  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.stairs_Baked.geometry}
        material={material}
        position={[0, 0.317, 4.033]}
      />
    </group>
  )
}

useGLTF.preload("/models/stairs.glb")

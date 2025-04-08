import React, { useMemo, useRef, useEffect } from "react"
import { useGLTF, useTexture } from "@react-three/drei"
import {
  DoubleSide,
  NormalBlending,
  NearestFilter,
  Color,
  MeshPhysicalMaterial,
} from "three"

// Configurações base para o material com branco intenso
const MATERIAL_SETTINGS = {
  emissiveColor: new Color(1, 1, 1), // Branco puro em RGB
  emissiveIntensity: 4.3,
  transparent: false,
  alphaTest: 0.05,
}

// Cache de materiais
const materialCache = new Map()

const useHeartTextMaterial = () => {
  // Carregar texturas do HeartText
  const textures = useTexture({
    map: "/texture/HeTextBake.webp",
    // metalnessMap: "/texture/HeText_Metalness.webp",
    // roughnessMap: "/texture/HeText_Roughness.webp",
    emissiveMap: "/texture/HeText_Emissive.webp",
  })

  // Configura texturas
  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = false
        texture.minFilter = NearestFilter
        texture.magFilter = NearestFilter
        texture.needsUpdate = true
      }
    })
  }, [textures])

  // Cria ou recupera material do cache
  const material = useMemo(() => {
    const key = "heartText"

    if (!materialCache.has(key)) {
      materialCache.set(
        key,
        new MeshPhysicalMaterial({
          ...MATERIAL_SETTINGS,
          map: textures.map,
          metalnessMap: textures.metalnessMap,
          roughnessMap: textures.roughnessMap,
          emissiveMap: textures.emissiveMap,
          emissive: MATERIAL_SETTINGS.emissiveColor,
          emissiveIntensity: MATERIAL_SETTINGS.emissiveIntensity,
          side: DoubleSide,
          blending: NormalBlending,
          metalness: 1,
          roughness: 0.4,
        })
      )
    }
    return materialCache.get(key)
  }, [textures])

  return material
}

export function HeartText({ onSectionChange, ...props }) {
  const { nodes } = useGLTF("/models/HeartText.glb")
  const material = useHeartTextMaterial()
  const materialsRef = useRef([material])

  // Cleanup
  useEffect(() => {
    return () => {
      materialsRef.current.forEach(material => {
        if (material && material.dispose) {
          material.dispose()
        }
      })
    }
  }, [])

  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.HeText.geometry}
        material={material}
        position={[0, 0.145, 2.005]}
        castShadow
        receiveShadow
        layers-enable={2}
      />
    </group>
  )
}

useGLTF.preload("/models/HeartText.glb")

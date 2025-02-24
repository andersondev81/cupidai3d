import React, { useMemo, useRef, useEffect } from "react"
import { useGLTF, useTexture } from "@react-three/drei"
import { EffectComposer, SelectiveBloom } from "@react-three/postprocessing"
import {
  MeshStandardMaterial,
  DoubleSide,
  NormalBlending,
  NearestFilter,
  Layers,
  Color,
  MeshPhysicalMaterial,
} from "three"

// Camada específica para elementos HeartText com emissive map
const BLOOM_LAYER = new Layers()
BLOOM_LAYER.set(2)

// Configurações base para o material com branco intenso
const MATERIAL_SETTINGS = {
  emissiveColor: new Color(1, 1, 1), // Branco puro em RGB
  emissiveIntensity: 2,
  transparent: false,
  alphaTest: 0.01,
}

// Cache de materiais
const materialCache = new Map()

const useHeartTextMaterial = () => {
  // Carregar texturas do HeartText
  const textures = useTexture({
    map: "/texture/HeText_Color.webp",
    metalnessMap: "/texture/HeText_Metalness.webp",
    roughnessMap: "/texture/HeText_Roughness.webp",
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
  const sceneRef = useRef(null)
  const emissiveGroupRef = useRef(null)
  const materialsRef = useRef([material])

  // Aplica layer de bloom nos elementos emissivos após renderização
  useEffect(() => {
    if (emissiveGroupRef.current) {
      // Configura a camada para todos os meshes filhos
      emissiveGroupRef.current.traverse(child => {
        if (child.isMesh && child.material.emissive) {
          child.layers.enable(2) // Habilita a camada 2 para elementos com emissive
        }
      })
    }
  }, [])

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
    <>
      <group {...props} dispose={null} ref={sceneRef}>
        {/* Grupo específico para elementos que receberão bloom */}
        <group ref={emissiveGroupRef}>
          <mesh
            geometry={nodes.HeText.geometry}
            material={material}
            position={[0, 0.145, 2.005]}
            castShadow
            receiveShadow
          />
        </group>
      </group>

      {/* EffectComposer com configurações otimizadas para branco intenso */}
      <EffectComposer>
        <SelectiveBloom
          lights={[]}
          selection={sceneRef}
          selectionLayer={2}
          luminanceThreshold={0.59} // Reduzido para capturar mais das áreas brancas
          luminanceSmoothing={0.8} // Adicionado para transição mais suave
          mipmapBlur
          intensity={3.9} // Aumentado para bloom mais intenso
          radius={0.5} // Aumentado para glow mais difuso
        />
      </EffectComposer>
    </>
  )
}

useGLTF.preload("/models/HeartText.glb")

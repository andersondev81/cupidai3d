import React, { useMemo, useRef, useEffect } from "react"
import { useGLTF, useTexture, Float } from "@react-three/drei"
import {
  Color,
  MeshStandardMaterial,
  NearestFilter,
  FrontSide,
  AdditiveBlending,
  Layers,
} from "three"
import {
  EffectComposer,
  Bloom,
  SelectiveBloom,
} from "@react-three/postprocessing"
import RotateAxis from "../../components/helpers/RotateAxis"

// Cache de materiais
const materialCache = new Map()

// Configurações base para materiais
const MATERIAL_SETTINGS = {
  emissiveColor: new Color(0x48cae4),
  emissiveIntensity: 6,
  transparent: true,
  alphaTest: 0.005,
  depthTest: true,
  roughness: 0,
  metalness: 0,
}

// Camada específica para elementos com emissive map
const BLOOM_LAYER = new Layers()
BLOOM_LAYER.set(1) // Usando a camada 1 para os elementos com emissive map

const OrbMesh = React.memo(props => {
  const { nodes } = useGLTF("/models/Orbit.glb")
  const materialsRef = useRef([])
  const emissiveGroupRef = useRef()

  // Carrega e configura texturas uma única vez
  const textures = useTexture({
    map: "/texture/Orb_AlphaV1.webp",
    alphaMap: "/texture/Orb_Alpha.webp",
    emissiveMap: "/texture/OrbBake_Emissive.webp",
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

  // Cria ou recupera materiais do cache
  const materials = useMemo(() => {
    const createMaterial = (key, config) => {
      if (!materialCache.has(key)) {
        materialCache.set(
          key,
          new MeshStandardMaterial({
            ...MATERIAL_SETTINGS,
            map: textures.map,
            alphaMap: textures.alphaMap,
            emissive: MATERIAL_SETTINGS.emissiveColor,
            emissiveMap: textures.emissiveMap,
            side: FrontSide, // Mudado de DoubleSide para FrontSide
            ...config,
          })
        )
      }
      return materialCache.get(key)
    }

    return {
      lines: createMaterial("lines", {
        opacity: 0.3,
        blending: AdditiveBlending,
      }),
      center: createMaterial("center", { opacity: 1 }),
      balls: createMaterial("balls", {
        opacity: 0.15,
        blending: AdditiveBlending,
      }),
      sphere: createMaterial("sphere", {
        color: new Color(0.678, 0.933, 0.953),
        opacity: 0.9,
        transparent: true,
      }),
    }
  }, [textures])

  // Aplica layer de bloom nos elementos emissivos após renderização
  useEffect(() => {
    if (emissiveGroupRef.current) {
      // Configura a camada para todos os meshes filhos
      emissiveGroupRef.current.traverse(child => {
        if (child.isMesh && child.material.emissive) {
          child.layers.enable(1) // Habilita a camada 1 para elementos com emissive
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

  // Reduz a complexidade da geometria da esfera
  const simplifiedSphereGeometry = useMemo(() => {
    return <sphereGeometry args={[0.02, 16, 16]} /> // Reduzido de 30,30 para 16,16
  }, [])

  return (
    <group {...props} dispose={null} position={[1.76, 1.155, -0.883]}>
      {/* Grupo para elementos com emissive que terão bloom */}
      <group ref={emissiveGroupRef}>
        {/* Linhas - com rotações otimizadas */}
        <group>
          <RotateAxis axis="y" speed={1} rotationType="euler">
            <mesh geometry={nodes.lineC?.geometry} material={materials.lines} />
          </RotateAxis>
          <RotateAxis axis="z" speed={6} rotationType="euler">
            <mesh geometry={nodes.lineB?.geometry} material={materials.lines} />
          </RotateAxis>
          <RotateAxis axis="x" speed={8} rotationType="euler">
            <mesh geometry={nodes.lineA?.geometry} material={materials.lines} />
          </RotateAxis>
        </group>

        {/* Center */}
        <RotateAxis axis="y" speed={8} rotationType="euler">
          <mesh geometry={nodes.center?.geometry} material={materials.center} />
        </RotateAxis>

        {/* Bolas - agrupadas para melhor performance */}
        <group>
          <RotateAxis axis="x" speed={6} rotationType="euler">
            <mesh geometry={nodes.ballC?.geometry} material={materials.balls} />
          </RotateAxis>
          <RotateAxis axis="y" speed={8} rotationType="euler">
            <mesh
              geometry={nodes.ballA?.geometry}
              material={materials.balls}
              scale={0.993}
            />
          </RotateAxis>
          <RotateAxis axis="z" speed={2} rotationType="euler">
            <mesh
              geometry={nodes.ballB?.geometry}
              material={materials.balls}
              scale={1.125}
            />
          </RotateAxis>
        </group>
      </group>

      {/* Esferas de efeito - NÃO terão bloom (fora do grupo emissiveGroupRef) */}
      <group>
        <mesh position={[0, 0, 0]}>
          {simplifiedSphereGeometry}
          <meshBasicMaterial
            color={new Color(0.678, 0.933, 0.953)}
            transparent
            opacity={0.9}
          />
        </mesh>
      </group>

      <RotateAxis axis="y" speed={-0.5} rotationType="euler">
        <mesh
          geometry={nodes.particles.geometry}
          material={materials.sphere}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.01}
        />
      </RotateAxis>
    </group>
  )
})

// Componente principal
const Orb = () => {
  const sceneRef = useRef()

  return (
    <>
      <group ref={sceneRef} position={[0, 0.15, 0]} rotation={[0, 0, 0]}>
        <Float
          floatIntensity={0.3}
          speed={3}
          rotationIntensity={0}
          floatingRange={[-0.1, 0.1]} // Reduzido o range de flutuação
        >
          <OrbMesh />
        </Float>
      </group>

      {/* EffectComposer com efeito SelectiveBloom para aplicar apenas em layers específicas */}
      {/* <EffectComposer>
        <SelectiveBloom
          lights={[]} // Não precisamos especificar luzes aqui
          selection={sceneRef} // Aplica apenas aos objetos na referência sceneRef
          selectionLayer={1} // Usa a camada 1 para identificar objetos
          luminanceThreshold={1.1}
          mipmapBlur
          intensity={6}
          radius={0.3}
        />
      </EffectComposer> */}
    </>
  )
}

// Preload otimizado
useGLTF.preload("/models/Orbit.glb")

export default React.memo(Orb)

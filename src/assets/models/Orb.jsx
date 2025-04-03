import React, { useMemo, useRef, useEffect, useState } from "react"
import { useGLTF, useTexture, Float } from "@react-three/drei"
import {
  Color,
  MeshStandardMaterial,
  NearestFilter,
  FrontSide,
  AdditiveBlending,
  Layers,
  Vector3
} from "three"
import { useFrame } from "@react-three/fiber"
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

// Versão modificada da RotateAxis que mantém a velocidade original
const SlowableRotateAxis = React.memo(({ axis, speed, rotationType, isSlowed, children }) => {
  const ref = useRef()

  useFrame((_, delta) => {
    if (!ref.current) return

    // Velocidade constante, independente do estado de zoom
    const effectiveSpeed = speed

    if (rotationType === "euler") {
      if (axis === "x") ref.current.rotation.x += effectiveSpeed * delta
      else if (axis === "y") ref.current.rotation.y += effectiveSpeed * delta
      else if (axis === "z") ref.current.rotation.z += effectiveSpeed * delta
    }
  })

  return <group ref={ref}>{children}</group>
})

const OrbMesh = React.memo(({ isZoomed, setIsZoomed, onSectionChange, ...props }) => {
  const { nodes } = useGLTF("/models/Orbit.glb")
  const materialsRef = useRef([])
  const emissiveGroupRef = useRef()
  const groupRef = useRef()

  // Para detectar clique duplo
  const clickTimerRef = useRef(null)
  const lastClickTimeRef = useRef(0)
  const DOUBLE_CLICK_DELAY = 300 // ms

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
            side: FrontSide,
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

      // Limpa também o timer do clique duplo
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current)
      }
    }
  }, [])

  // Evento de clique modificado para suportar clique simples e duplo
  const handleClick = (e) => {
    e.stopPropagation()

    const now = Date.now()
    const timeDiff = now - lastClickTimeRef.current

    // Limpa qualquer timer pendente
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
    }

    if (timeDiff < DOUBLE_CLICK_DELAY) {
      // É um clique duplo
      console.log("Orb double click - zooming")
      setIsZoomed(!isZoomed)
      lastClickTimeRef.current = 0 // Reseta o tempo para evitar detecção acidental
    } else {
      // Pode ser um clique simples - aguarda para ver se haverá outro
      lastClickTimeRef.current = now

      clickTimerRef.current = setTimeout(() => {
        // Se chegou aqui, era um clique simples
        console.log("Orb single click - navigating to about section")

        // Dispatch a custom event to ensure AboutOverlay is shown
        window.dispatchEvent(
          new CustomEvent('orbNavigation', {
            detail: { section: 'about' }
          })
        );

        // Estamos assumindo que seção "about" é a seção 1
        if (onSectionChange) {
          onSectionChange(1, "about")

          // Também armazenamos a fonte de navegação como 'direct' se tivermos NavigationSystem
          if (window.navigationSystem && window.navigationSystem.setNavigationSource) {
            window.navigationSystem.setNavigationSource('orb', 'direct')
          }
        }

        // Também tentamos o globalNavigation como fallback
        if (window.globalNavigation && window.globalNavigation.navigateTo) {
          window.globalNavigation.navigateTo("about")
        }

        clickTimerRef.current = null
      }, DOUBLE_CLICK_DELAY)
    }
  }


  // Evento de hover
  const handlePointerEnter = (e) => {
    e.stopPropagation()
    document.body.style.cursor = "pointer"
  }

  const handlePointerLeave = (e) => {
    e.stopPropagation()
    document.body.style.cursor = "default"
  }

  // Reduz a complexidade da geometria da esfera
  const simplifiedSphereGeometry = useMemo(() => {
    return <sphereGeometry args={[0.02, 16, 16]} />
  }, [])

  return (
    <group
      {...props}
      dispose={null}
      position={[1.76, 1.155, -0.883]}
      ref={groupRef}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* Grupo para elementos com emissive que terão bloom */}
      <group ref={emissiveGroupRef}>
        {/* Linhas - com rotações otimizadas */}
        <group>
          <SlowableRotateAxis axis="y" speed={1} rotationType="euler" isSlowed={isZoomed}>
            <mesh geometry={nodes.lineC?.geometry} material={materials.lines} />
          </SlowableRotateAxis>
          <SlowableRotateAxis axis="z" speed={6} rotationType="euler" isSlowed={isZoomed}>
            <mesh geometry={nodes.lineB?.geometry} material={materials.lines} />
          </SlowableRotateAxis>
          <SlowableRotateAxis axis="x" speed={8} rotationType="euler" isSlowed={isZoomed}>
            <mesh geometry={nodes.lineA?.geometry} material={materials.lines} />
          </SlowableRotateAxis>
        </group>

        {/* Center */}
        <SlowableRotateAxis axis="y" speed={8} rotationType="euler" isSlowed={isZoomed}>
          <mesh geometry={nodes.center?.geometry} material={materials.center} />
        </SlowableRotateAxis>

        {/* Bolas - agrupadas para melhor performance */}
        <group>
          <SlowableRotateAxis axis="x" speed={6} rotationType="euler" isSlowed={isZoomed}>
            <mesh geometry={nodes.ballC?.geometry} material={materials.balls} />
          </SlowableRotateAxis>
          <SlowableRotateAxis axis="y" speed={8} rotationType="euler" isSlowed={isZoomed}>
            <mesh
              geometry={nodes.ballA?.geometry}
              material={materials.balls}
              scale={0.993}
            />
          </SlowableRotateAxis>
          <SlowableRotateAxis axis="z" speed={2} rotationType="euler" isSlowed={isZoomed}>
            <mesh
              geometry={nodes.ballB?.geometry}
              material={materials.balls}
              scale={1.125}
            />
          </SlowableRotateAxis>
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

      <SlowableRotateAxis axis="y" speed={-0.5} rotationType="euler" isSlowed={isZoomed}>
        <mesh
          geometry={nodes.particles.geometry}
          material={materials.sphere}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.01}
        />
      </SlowableRotateAxis>
    </group>
  )
})

// Componente principal
const Orb = ({ onSectionChange }) => {
  const [isZoomed, setIsZoomed] = useState(false)
  const sceneRef = useRef()
  const floatGroupRef = useRef()
  const originalScale = useRef(new Vector3(1, 1, 1))
  const originalPosition = useRef(new Vector3(0.066, 0, -0.04))
  const targetScale = new Vector3(1.5, 1.5, 1.5)
  const targetPosition = new Vector3(0.066, 0.25, -0.04)

  // Animação de zoom com transição mais lenta
  useFrame((_, delta) => {
    if (!floatGroupRef.current) return

    const currentScale = floatGroupRef.current.scale
    const currentPosition = floatGroupRef.current.position

    // Fator de velocidade reduzido para transição mais lenta (0.5 = 4x mais lento)
    const transitionSpeed = 0.5

    if (isZoomed) {
      // Interpolação muito mais suave para o zoom in
      currentScale.lerp(targetScale, delta * transitionSpeed)
      currentPosition.lerp(targetPosition, delta * transitionSpeed)
    } else {
      // Interpolação muito mais suave para o zoom out
      currentScale.lerp(originalScale.current, delta * transitionSpeed)
      currentPosition.lerp(originalPosition.current, delta * transitionSpeed)
    }
  })

  // Salva a escala e posição original na primeira renderização
  useEffect(() => {
    if (floatGroupRef.current) {
      originalScale.current.copy(floatGroupRef.current.scale)
      originalPosition.current.copy(floatGroupRef.current.position)
    }
  }, [])

  return (
    <>
      <group ref={sceneRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <group ref={floatGroupRef} position={[0.066, 0, -0.04]}>
          <Float
            floatIntensity={0.3}
            speed={3}
            rotationIntensity={0}
            floatingRange={[-0.1, 0.1]}
          >
            <OrbMesh
              isZoomed={isZoomed}
              setIsZoomed={setIsZoomed}
              onSectionChange={onSectionChange}
            />
          </Float>
        </group>
      </group>
    </>
  )
}

// Preload otimizado
useGLTF.preload("/models/Orbit.glb")

export default React.memo(Orb)
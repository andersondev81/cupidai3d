import React, { useMemo, useRef, useEffect, useState } from "react"
import { useGLTF, useTexture, Float } from "@react-three/drei"
import {
  Color,
  MeshStandardMaterial,
  NearestFilter,
  FrontSide,
  AdditiveBlending,
  Layers,
  Vector3,
} from "three"
import { useFrame } from "@react-three/fiber"
import audioManager from "./AudioManager"
// Constants
const BLOOM_LAYER = new Layers()
BLOOM_LAYER.set(1)
const DOUBLE_CLICK_DELAY = 300
const EMISSIVE_COLOR = new Color(0x48cae4)

// Material configurations
const createMaterialSettings = (textures, overrides = {}) => ({
  emissive: EMISSIVE_COLOR,
  emissiveIntensity: 2,
  transparent: true,
  alphaTest: 0.005,
  depthTest: true,
  roughness: 0,
  metalness: 0,
  map: textures.map,
  alphaMap: textures.alphaMap,
  emissiveMap: textures.emissiveMap,
  side: FrontSide,
  ...overrides,
})

// Custom hook for materials management
const useOrbMaterials = textures => {
  const materialCache = useRef(new Map())

  return useMemo(() => {
    const getMaterial = (key, config) => {
      if (!materialCache.current.has(key)) {
        materialCache.current.set(
          key,
          new MeshStandardMaterial(createMaterialSettings(textures, config))
        )
      }
      return materialCache.current.get(key)
    }

    return {
      lines: getMaterial("lines", {
        opacity: 0.3,
        blending: AdditiveBlending,
      }),
      center: getMaterial("center", { opacity: 1 }),
      balls: getMaterial("balls", {
        opacity: 0.15,
        blending: AdditiveBlending,
      }),
      sphere: getMaterial("sphere", {
        color: new Color(0.678, 0.933, 0.953),
        opacity: 0.9,
        transparent: true,
      }),
    }
  }, [textures])
}

// Rotating component
const RotatingAxis = React.memo(({ axis, speed, children }) => {
  const ref = useRef()

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation[axis] += speed * delta
  })

  return <group ref={ref}>{children}</group>
})

// Main Orb Mesh Component
const OrbMesh = React.memo(({ isZoomed, setIsZoomed, onSectionChange }) => {
  const { nodes } = useGLTF("/models/Orbit.glb")
  const textures = useTexture({
    map: "/texture/Orb_AlphaV1.webp",
    alphaMap: "/texture/Orb_Alpha.webp",
    emissiveMap: "/texture/OrbBake_Emissive.webp",
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
  }, [textures])

  const materials = useOrbMaterials(textures)
  const emissiveGroupRef = useRef()
  const clickTimerRef = useRef(null)
  const lastClickTimeRef = useRef(0)

  // Setup bloom layer
  useEffect(() => {
    if (emissiveGroupRef.current) {
      emissiveGroupRef.current.traverse(child => {
        if (child.isMesh && child.material.emissive) {
          child.layers.enable(1)
        }
      })
    }
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current)
      }
    }
  }, [])

  const handleNavigation = (navigationSource = "direct") => {
    audioManager.play("transition")

    if (navigationSource === "pole") {
      if (window.navigationSystem?.clearPositionForElement) {
        window.navigationSystem.clearPositionForElement("orb")
      }
    }
    else if (navigationSource === "direct" && window.controls?.current) {
      try {
        const position = window.controls.current.getPosition()
        const target = window.controls.current.getTarget()

        if (window.navigationSystem?.storePosition) {
          window.navigationSystem.storePosition(
            "orb",
            [position.x, position.y, position.z],
            [target.x, target.y, target.z]
          )
        }
      } catch (err) {
        console.error("Failed to store camera position:", err)
      }
    }

    if (window.navigationSystem?.setNavigationSource) {
      window.navigationSystem.setNavigationSource("orb", navigationSource)
    }

    window.dispatchEvent(
      new CustomEvent("orbNavigation", { detail: { section: "about" } })
    )

    onSectionChange?.(1, "about")
    window.globalNavigation?.navigateTo?.("about")
  }

  const handleClick = e => {
    e.stopPropagation()
    const now = Date.now()
    const timeDiff = now - lastClickTimeRef.current

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
    }

    if (timeDiff < DOUBLE_CLICK_DELAY) {
      setIsZoomed(!isZoomed)
      lastClickTimeRef.current = 0
    } else {
      lastClickTimeRef.current = now
      clickTimerRef.current = setTimeout(() => {
        const source =
          window.navigationSystem?.getNavigationSource?.("orb") === "pole"
            ? "pole"
            : "direct"
        handleNavigation(source)
      }, DOUBLE_CLICK_DELAY)
    }
  }

  const handlePointerEnter = e => {
    e.stopPropagation()
    document.body.style.cursor = "pointer"
  }

  const handlePointerLeave = () => {
    document.body.style.cursor = "default"
  }

  return (
    <group
      position={[1.76, 1.155, -0.883]}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <group ref={emissiveGroupRef}>
        {/* Lines */}
        <group>
          <RotatingAxis axis="y" speed={1}>
            <mesh geometry={nodes.lineC?.geometry} material={materials.lines} />
          </RotatingAxis>
          <RotatingAxis axis="z" speed={6}>
            <mesh geometry={nodes.lineB?.geometry} material={materials.lines} />
          </RotatingAxis>
          <RotatingAxis axis="x" speed={8}>
            <mesh geometry={nodes.lineA?.geometry} material={materials.lines} />
          </RotatingAxis>
        </group>

        {/* Center */}
        <RotatingAxis axis="y" speed={8}>
          <mesh geometry={nodes.center?.geometry} material={materials.center} />
        </RotatingAxis>

        {/* Balls */}
        <group>
          <RotatingAxis axis="x" speed={6}>
            <mesh geometry={nodes.ballC?.geometry} material={materials.balls} />
          </RotatingAxis>
          <RotatingAxis axis="y" speed={8}>
            <mesh
              geometry={nodes.ballA?.geometry}
              material={materials.balls}
              scale={0.993}
            />
          </RotatingAxis>
          <RotatingAxis axis="z" speed={2}>
            <mesh
              geometry={nodes.ballB?.geometry}
              material={materials.balls}
              scale={1.125}
            />
          </RotatingAxis>
        </group>
      </group>

      {/* Sphere effect */}
      <mesh>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial
          color={new Color(0.678, 0.933, 0.953)}
          transparent
          opacity={0.9}
        />
      </mesh>

      <RotatingAxis axis="y" speed={-0.5}>
        <mesh
          geometry={nodes.particles.geometry}
          material={materials.sphere}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.01}
        />
      </RotatingAxis>
    </group>
  )
})

// Main Orb Component
const Orb = ({ onSectionChange }) => {
  const [isZoomed, setIsZoomed] = useState(false)
  const floatGroupRef = useRef()
  const originalScale = useRef(new Vector3(1, 1, 1))
  const originalPosition = useRef(new Vector3(0.066, 0, -0.04))
  const targetScale = new Vector3(1.5, 1.5, 1.5)
  const targetPosition = new Vector3(0.066, 0.25, -0.04)

  useFrame((_, delta) => {
    if (!floatGroupRef.current) return

    const transitionSpeed = 0.5
    floatGroupRef.current.scale.lerp(
      isZoomed ? targetScale : originalScale.current,
      delta * transitionSpeed
    )
    floatGroupRef.current.position.lerp(
      isZoomed ? targetPosition : originalPosition.current,
      delta * transitionSpeed
    )
  })

  useEffect(() => {
    if (floatGroupRef.current) {
      originalScale.current.copy(floatGroupRef.current.scale)
      originalPosition.current.copy(floatGroupRef.current.position)
    }
  }, [])

  return (
    <group position={[0, 0, 0]}>
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
  )
}

useGLTF.preload("/models/Orbit.glb")
export default React.memo(Orb)

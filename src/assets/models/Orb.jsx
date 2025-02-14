<<<<<<< HEAD
"use client"
import React, { useMemo } from "react"
import { useGLTF, useTexture, Float, Sparkles } from "@react-three/drei"
import {
  Color,
  MeshStandardMaterial,
  sRGBEncoding,
  NearestFilter,
  DoubleSide,
  NormalBlending,
  AdditiveBlending,
  MathUtils,
} from "three"
import RotateAxis from "../../components/helpers/RotateAxis"
import { EffectsTree } from "../../components/helpers/EffectsTree"

const emissiveColor = new Color(0x48cae4)

const OrbMesh = props => {
  const { nodes } = useGLTF("/models/Orbit.glb")

  const textures = useTexture({
    map: "/texture/Orb_AlphaV1.webp",
    emissiveMap: "/texture/Orb_AlphaV1.webp",
    alphaMap: "/texture/Orb_Alpha.webp", // Usando a mesma textura para alphaMap
  })

  useMemo(() => {
    textures.map.encoding = sRGBEncoding
    if (textures.emissiveMap) {
      textures.emissiveMap.encoding = sRGBEncoding
    }

    // Configurações gerais para todas as texturas carregadas
    ;[
      textures.map,
      textures.normalMap,
      textures.emissiveMap,
      textures.alphaMap,
      textures.roughnessMap,
      textures.metalnessMap,
    ].forEach(texture => {
      if (texture) {
        texture.flipY = false
        texture.minFilter = NearestFilter
        texture.magFilter = NearestFilter
      }
    })
  }, [textures])

  // Material para as Linhas (LineA, LineB, LineC)
  const materialLines = useMemo(() => {
    return new MeshStandardMaterial({
      map: textures.map,
      normalMap: textures.normalMap,
      emissiveMap: textures.emissiveMap,
      emissive: emissiveColor,
      alphaMap: textures.alphaMap,
      roughnessMap: textures.roughnessMap,
      metalnessMap: textures.metalnessMap,
      emissiveIntensity: 2,
      transparent: true,
      alphaTest: 0.005,
      depthTest: true,
      side: DoubleSide,
      blending: NormalBlending,
      roughness: 0,
      metalness: 0,
      wireframe: false,
      opacity: 0.3,
    })
  }, [textures])

  // Material para o Center
  const materialCenter = new MeshStandardMaterial({
    map: textures.map,
    normalMap: textures.normalMap,
    emissiveMap: textures.emissiveMap,
    emissive: emissiveColor,
    alphaMap: textures.alphaMap,
    roughnessMap: textures.roughnessMap,
    metalnessMap: textures.metalnessMap,
    emissiveIntensity: 2,
    transparent: true,
    alphaTest: 0.005,
    depthTest: true,
    side: DoubleSide,
    blending: NormalBlending,
    roughness: 0,
    metalness: 0,
    opacity: 1,
  })

  // Material para as Bolas (BallA, BallB, BallC)
  const materialBalls = new MeshStandardMaterial({
    map: textures.map,
    normalMap: textures.normalMap,
    emissiveMap: textures.emissiveMap,
    emissive: emissiveColor,
    alphaMap: textures.alphaMap,
    roughnessMap: textures.roughnessMap,
    metalnessMap: textures.metalnessMap,
    emissiveIntensity: 2,
    transparent: true,
    alphaTest: 0.005,
    depthTest: true,
    side: DoubleSide,
    blending: AdditiveBlending,
    roughness: 0,
    metalness: 0,
    opacity: 0.15,
  })

  return (
    <group {...props} dispose={null} position={[1.76, 1.155, -0.883]}>
      {/* Linhas */}
      <RotateAxis axis="y" speed={1} rotationType="euler">
        <mesh geometry={nodes.lineC?.geometry} material={materialLines} />
      </RotateAxis>
      <RotateAxis axis="z" speed={1} rotationType="euler">
        <mesh geometry={nodes.lineB?.geometry} material={materialLines} />
      </RotateAxis>
      <RotateAxis axis="x" speed={1} rotationType="euler">
        <mesh geometry={nodes.lineA?.geometry} material={materialLines} />
      </RotateAxis>

      {/* Center */}
      <RotateAxis axis="y" speed={2} rotationType="euler">
        <mesh geometry={nodes.center?.geometry} material={materialCenter} />
      </RotateAxis>

      {/* Bolas */}
      <RotateAxis axis="x" speed={0.5} rotationType="euler">
        <mesh geometry={nodes.ballC?.geometry} material={materialBalls} />
      </RotateAxis>
      <RotateAxis axis="y" speed={1} rotationType="euler">
        <mesh
          geometry={nodes.ballA?.geometry}
          material={materialBalls}
          scale={0.993}
        />
      </RotateAxis>
      <RotateAxis axis="y" speed={2} rotationType="euler">
        <mesh
          geometry={nodes.ballB?.geometry}
          material={materialBalls}
          scale={1.125}
        />
      </RotateAxis>

      {/* Esfera de efeito */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.02, 30, 30]} />
        <meshBasicMaterial
          color={new Color(0.678, 0.933, 0.953)} // Azul claro (#ade8f4)
          toneMapped={false}
          opacity={0.9}
          transparent={true}
        />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.02, 30, 30]} />
        <meshBasicMaterial
          color={new Color(0.678, 0.933, 0.953)} // Azul claro (#ade8f4)
          toneMapped={false}
          opacity={0.5}
          transparent={true}
        />
        {/* Ajuste do Sparkles para envolver a esfera */}
        <Sparkles
          count={50}
          scale={0.1}
          size={0.4}
          speed={0.2}
          position={[0, 0, 0]}
          rotation={[MathUtils.degToRad(90), 0, MathUtils.degToRad(90)]}
        />
      </mesh>
    </group>
  )
}

useGLTF.preload("/models/Orbit.glb")

const Orb = () => {
  return (
    <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <EffectsTree />
      <Float floatIntensity={0.5} speed={4} axis="y" rotationIntensity={0}>
        <OrbMesh />
      </Float>
    </group>
  )
}

export default Orb
||||||| parent of d3ce3f9 (New Castle)
=======
"use client"
import React, { useMemo } from "react"
import { useGLTF, useTexture, Float, Sparkles } from "@react-three/drei"
import {
  Color,
  MeshStandardMaterial,
  sRGBEncoding,
  NearestFilter,
  DoubleSide,
  NormalBlending,
  AdditiveBlending,
  MathUtils,
} from "three"
import RotateAxis from "../../components/helpers/RotateAxis"
import { EffectsTree } from "../../components/helpers/EffectsTree"

const emissiveColor = new Color(0x48cae4)

const OrbMesh = props => {
  const { nodes } = useGLTF("/models/Orbit.glb")

  const textures = useTexture({
    map: "/texture/Orb_AlphaV1.webp",
    emissiveMap: "/texture/Orb_AlphaV1.webp",
    alphaMap: "/texture/Orb_Alpha.webp", // Usando a mesma textura para alphaMap
  })

  useMemo(() => {
    textures.map.encoding = sRGBEncoding
    if (textures.emissiveMap) {
      textures.emissiveMap.encoding = sRGBEncoding
    }

    // Configurações gerais para todas as texturas carregadas
    ;[
      textures.map,
      textures.normalMap,
      textures.emissiveMap,
      textures.alphaMap,
      textures.roughnessMap,
      textures.metalnessMap,
    ].forEach(texture => {
      if (texture) {
        texture.flipY = false
        texture.minFilter = NearestFilter
        texture.magFilter = NearestFilter
      }
    })
  }, [textures])

  // Material para as Linhas (LineA, LineB, LineC)
  const materialLines = useMemo(() => {
    return new MeshStandardMaterial({
      map: textures.map,
      normalMap: textures.normalMap,
      emissiveMap: textures.emissiveMap,
      emissive: emissiveColor,
      alphaMap: textures.alphaMap,
      roughnessMap: textures.roughnessMap,
      metalnessMap: textures.metalnessMap,
      emissiveIntensity: 2,
      transparent: true,
      alphaTest: 0.005,
      depthTest: true,
      side: DoubleSide,
      blending: NormalBlending,
      roughness: 0,
      metalness: 0,
      wireframe: false,
      opacity: 0.3,
    })
  }, [textures])

  // Material para o Center
  const materialCenter = new MeshStandardMaterial({
    map: textures.map,
    normalMap: textures.normalMap,
    emissiveMap: textures.emissiveMap,
    emissive: emissiveColor,
    alphaMap: textures.alphaMap,
    roughnessMap: textures.roughnessMap,
    metalnessMap: textures.metalnessMap,
    emissiveIntensity: 2,
    transparent: true,
    alphaTest: 0.005,
    depthTest: true,
    side: DoubleSide,
    blending: NormalBlending,
    roughness: 0,
    metalness: 0,
    opacity: 1,
  })

  // Material para as Bolas (BallA, BallB, BallC)
  const materialBalls = new MeshStandardMaterial({
    map: textures.map,
    normalMap: textures.normalMap,
    emissiveMap: textures.emissiveMap,
    emissive: emissiveColor,
    alphaMap: textures.alphaMap,
    roughnessMap: textures.roughnessMap,
    metalnessMap: textures.metalnessMap,
    emissiveIntensity: 2,
    transparent: true,
    alphaTest: 0.005,
    depthTest: true,
    side: DoubleSide,
    blending: AdditiveBlending,
    roughness: 0,
    metalness: 0,
    opacity: 0.15,
  })

  return (
    <group {...props} dispose={null} position={[1.76, 1.155, -0.883]}>
      {/* Linhas */}
      <RotateAxis axis="y" speed={1} rotationType="euler">
        <mesh geometry={nodes.lineC?.geometry} material={materialLines} />
      </RotateAxis>
      <RotateAxis axis="z" speed={6} rotationType="euler">
        <mesh geometry={nodes.lineB?.geometry} material={materialLines} />
      </RotateAxis>
      <RotateAxis axis="x" speed={8} rotationType="euler">
        <mesh geometry={nodes.lineA?.geometry} material={materialLines} />
      </RotateAxis>

      {/* Center */}
      <RotateAxis axis="y" speed={8} rotationType="euler">
        <mesh geometry={nodes.center?.geometry} material={materialCenter} />
      </RotateAxis>

      {/* Bolas */}
      <RotateAxis axis="x" speed={6} rotationType="euler">
        <mesh geometry={nodes.ballC?.geometry} material={materialBalls} />
      </RotateAxis>
      <RotateAxis axis="y" speed={8} rotationType="euler">
        <mesh
          geometry={nodes.ballA?.geometry}
          material={materialBalls}
          scale={0.993}
        />
      </RotateAxis>
      <RotateAxis axis="z" speed={2} rotationType="euler">
        <mesh
          geometry={nodes.ballB?.geometry}
          material={materialBalls}
          scale={1.125}
        />
      </RotateAxis>

      {/* Esfera de efeito */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.02, 30, 30]} />
        <meshBasicMaterial
          color={new Color(0.678, 0.933, 0.953)} // Azul claro (#ade8f4)
          toneMapped={false}
          opacity={0.9}
          transparent={true}
        />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.02, 30, 30]} />
        <meshBasicMaterial
          color={new Color(0.678, 0.933, 0.953)} // Azul claro (#ade8f4)
          toneMapped={false}
          opacity={0.5}
          transparent={true}
        />
      </mesh>
      <RotateAxis axis="y" speed={-0.5} rotationType="euler">
        <mesh
          geometry={nodes.particles.geometry}
          material={nodes.particles.material}
          color={new Color(0.678, 0.933, 0.953)}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.01}
        />
      </RotateAxis>
    </group>
  )
}

useGLTF.preload("/models/Orbit.glb")

const Orb = () => {
  return (
    <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <EffectsTree />
      <Float floatIntensity={0.5} speed={4} axis="y" rotationIntensity={0}>
        <OrbMesh />
      </Float>
    </group>
  )
}

export default Orb
>>>>>>> d3ce3f9 (New Castle)

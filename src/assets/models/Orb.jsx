import React, { useMemo } from "react"
import { useGLTF, useTexture } from "@react-three/drei"
import {
  MeshStandardMaterial,
  Color,
  DoubleSide,
  NormalBlending,
  NearestFilter,
} from "three"

const useOrbMaterial = () => {
  const textures = useTexture({
    map: "/texture/Circles_Alpha.webp",
    emissiveMap: "/texture/Circles_Emissive.webp",
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
      // emissive: new Color(0xffffff),
      emissiveIntensity: 16,
      transparent: true,
      alphaTest: 0.5,
      side: DoubleSide,
      blending: NormalBlending,
      roughness: 0.1,
      metalness: 0,
    })
  }, [textures])
}

// Changed back to default export
const Orb = props => {
  const { nodes, materials } = useGLTF("/models/Orbit.glb")
  const orbMaterial = useOrbMaterial()

  return (
    <group {...props} dispose={null} position={[1.76, 1.155, -0.883]}>
      <mesh geometry={nodes.lineC.geometry} material={orbMaterial} />
      <mesh geometry={nodes.lineB.geometry} material={orbMaterial} />
      <mesh geometry={nodes.lineA.geometry} material={orbMaterial} />
      <mesh geometry={nodes.center.geometry} material={nodes.center.material} />
      <mesh geometry={nodes.ballB.geometry} material={nodes.ballB.material} />
      <mesh geometry={nodes.ballA.geometry} material={nodes.ballA.material} />
    </group>
  )
}

export default Orb

useGLTF.preload("/models/Orbit.glb")

import React, { Suspense, useEffect, useMemo, useRef } from "react"
import { useGLTF, useTexture } from "@react-three/drei"
import RotateAxis from "../../components/helpers/RotateAxis"
import {
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  DoubleSide,
  NormalBlending,
  NearestFilter,
} from "three"

// Componente de material e texturas para o Castelo
const usePoleMaterial = () => {
  const textures = useTexture({
    map: "/texture/Pole_Color.webp",
    Displacement: "/texture/Pole_Height.webp",
    Metalness: "/texture/Pole_Metalness.webp",
    normalMap: "/texture/Pole_Normal.webp",
    Roughness: "/texture/Pole_Roughness.webp",
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
    return new MeshPhysicalMaterial({
      map: textures.map,
      displacementMap: textures.Displacement,
      roughnessMap: textures.Roughness,
      metalnessMap: textures.Metalness,
      normalMap: textures.normalMap,
      transparent: false,
      alphaTest: 0.5,
      side: DoubleSide,
      blending: NormalBlending,
      displacementScale: 0.001,
      roughness: 0,
      metalness: 0.6,
    })
  }, [textures])
}

export function Pole({ onSectionChange, section, ...props }) {
  const { nodes, materials } = useGLTF("/models/Pole.glb")
  const material = usePoleMaterial()
  return (
    <group {...props} dispose={null}>
      <group position={[0.1, 0, -0.2]} rotation={[0, Math.PI + 4.5, 0]}>
        <mesh
          geometry={nodes.pole.geometry}
          material={material}
          rotation={[0, 0, 0]}
        />
        <mesh geometry={nodes.flowers.geometry} material={material} scale={1} />
        <mesh
          geometry={nodes.aidatingcoach.geometry}
          material={material}
          position={[0, 0, 0]}
          onClick={() => onSectionChange(2, "aidatingcoach")}
          onPointerEnter={() => {
            document.body.style.cursor = "pointer"
          }}
          onPointerLeave={() => {
            document.body.style.cursor = "default"
          }}
        />
        <mesh
          geometry={nodes.roadmap.geometry}
          material={material}
          position={[0, 0, 0]}
          onClick={() => onSectionChange(5, "roadmap")}
          onPointerEnter={() => {
            document.body.style.cursor = "pointer"
          }}
          onPointerLeave={() => {
            document.body.style.cursor = "default"
          }}
        />
        <mesh
          geometry={nodes.download.geometry}
          material={material}
          position={[0, 0, 0]}
          onClick={() => onSectionChange(3, "download")}
          onPointerEnter={() => {
            document.body.style.cursor = "pointer"
          }}
          onPointerLeave={() => {
            document.body.style.cursor = "default"
          }}
        />
        <mesh
          geometry={nodes.about.geometry}
          material={material}
          position={[0, 0, 0]}
          onClick={() => onSectionChange(3, "download")}
          onPointerEnter={() => {
            document.body.style.cursor = "pointer"
          }}
          onPointerLeave={() => {
            document.body.style.cursor = "default"
          }}
        />
        <group position={[-0.014, 2.547, -0.003]}>
          <RotateAxis axis="y" speed={1} rotationType="euler">
            <mesh
              geometry={nodes.token.geometry}
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              material={material}
              onClick={() => onSectionChange(4, "token")}
              onPointerEnter={() => {
                document.body.style.cursor = "pointer"
              }}
              onPointerLeave={() => {
                document.body.style.cursor = "default"
              }}
            />
          </RotateAxis>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload("/models/Pole.glb")

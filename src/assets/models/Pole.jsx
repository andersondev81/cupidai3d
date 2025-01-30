import React, { Suspense, useEffect, useMemo, useRef } from "react"
import { useGLTF, useTexture } from "@react-three/drei"
import RotateAxis from "../../components/helpers/RotateAxis"
import {
  Color,
  MeshStandardMaterial,
  DoubleSide,
  NormalBlending,
  NearestFilter,
} from "three"

// Componente de material e texturas para o Castelo
const usePoleMaterial = () => {
  const textures = useTexture({
    map: "/texture/Pole_ColorAO.png",
    normalMap: "/texture/Pole_Normal.png",
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

      emissiveIntensity: 16,
      transparent: false,
      alphaTest: 0.5,
      side: DoubleSide,
      blending: NormalBlending,
      roughness: 0.6,
      metalness: 0.3,
    })
  }, [textures])
}

const pinkMaterial = new MeshStandardMaterial({
  color: new Color(0xff69b4), // Rosa
  roughness: 0.1,
  metalness: 0.3,
  transparent: false,
  alphaTest: 0.5,
  side: DoubleSide,
  blending: NormalBlending,
  side: DoubleSide,
})

export function Pole({ onSectionChange, section, ...props }) {
  const { nodes, materials } = useGLTF("/models/Pole.glb")
  const material = usePoleMaterial()
  return (
    <group {...props} dispose={null}>
      <group
        position={[0.1, 0, -0.2]}
        scale={0.2}
        rotation={[0, Math.PI / 3.5, 0]}
      >
        <mesh
          geometry={nodes.Pole.geometry}
          material={material}
          rotation={[0, 0, 0]}
        />
        <mesh geometry={nodes.Flowers.geometry} material={pinkMaterial} />
        <mesh
          geometry={nodes.HeartAi.geometry}
          material={material}
          position={[-0.872, 5.237, -0.047]}
          onClick={() => onSectionChange(2, "aidatingcoach")}
          onPointerEnter={() => {
            document.body.style.cursor = "pointer"
          }}
          onPointerLeave={() => {
            document.body.style.cursor = "default"
          }}
        />
        <mesh
          geometry={nodes.HeartRoad.geometry}
          material={material}
          position={[-0.747, 4.069, -0.011]}
          onClick={() => onSectionChange(5, "roadmap")}
          onPointerEnter={() => {
            document.body.style.cursor = "pointer"
          }}
          onPointerLeave={() => {
            document.body.style.cursor = "default"
          }}
        />
        <mesh
          geometry={nodes.HeartAbout.geometry}
          material={material}
          position={[0.764, 4.069, -0.011]}
          onClick={() => onSectionChange(1, "about")}
          onPointerEnter={() => {
            document.body.style.cursor = "pointer"
          }}
          onPointerLeave={() => {
            document.body.style.cursor = "default"
          }}
        />
        <mesh
          geometry={nodes.HeartX.geometry}
          material={material}
          position={[0.014, 3.743, 0.164]}
          onClick={() => onSectionChange(0, "intro")}
          onPointerEnter={() => {
            document.body.style.cursor = "pointer"
          }}
          onPointerLeave={() => {
            document.body.style.cursor = "default"
          }}
        />
        <mesh
          geometry={nodes.HeartDown.geometry}
          material={material}
          position={[0.054, 5.066, 0.776]}
          onClick={() => onSectionChange(3, "download")}
          onPointerEnter={() => {
            document.body.style.cursor = "pointer"
          }}
          onPointerLeave={() => {
            document.body.style.cursor = "default"
          }}
        />
        <group position={[0.009, 6.185, -0.016]}>
          <RotateAxis axis="y" speed={1} rotationType="euler">
            <mesh
              geometry={nodes.HeartToken.geometry}
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              material={material}
              scale={1}
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

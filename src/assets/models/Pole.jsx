import React, { useMemo, useEffect } from "react"
import { useGLTF, useTexture } from "@react-three/drei"
import { useLoader } from "@react-three/fiber"

import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"
import RotateAxis from "../../components/helpers/RotateAxis"
import {
  MeshPhysicalMaterial,
  DoubleSide,
  NormalBlending,
  NearestFilter,
  EquirectangularReflectionMapping,
} from "three"

const usePoleMaterial = () => {
  // Carregar texturas do Pole
  const textures = useTexture({
    map: "/texture/Pole_ColorV3AO.webp",
    // displacementMap: "/texture/Pole_Height.webp",
    metalnessMap: "/texture/Pole_Metalness.webp",
    // normalMap: "/texture/Pole_Normal.webp",
    roughnessMap: "/texture/Pole_Roughness.webp",
  })

  // Carregar HDR específico para o Pole
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
        transparent: false,
        alphaTest: 0.5,
        side: DoubleSide,
        blending: NormalBlending,
        // displacementScale: 0.001,
        roughness: 0.1,
        metalness: 1,
        envMap: envMap,
        envMapIntensity: 1.2, // Ajuste para melhor reflexo
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

export function Pole({ onSectionChange, ...props }) {
  const { nodes } = useGLTF("/models/Pole.glb")
  const material = usePoleMaterial()

  // Função para eventos de clique
  const createClickHandler = (sectionIndex, sectionName) => e => {
    e.stopPropagation()
    onSectionChange(sectionIndex, sectionName)
  }

  const pointerHandlers = {
    onPointerEnter: e => {
      e.stopPropagation()
      document.body.style.cursor = "pointer"
    },
    onPointerLeave: e => {
      e.stopPropagation()
      document.body.style.cursor = "default"
    },
  }

  return (
    <group {...props} dispose={null}>
      <group position={[0.2, -0.35, -0.2]} rotation={[0, Math.PI + 5, 0]}>
        <mesh geometry={nodes.pole.geometry} material={material} />
        <mesh geometry={nodes.flowers.geometry} material={material} scale={1} />

        <mesh
          geometry={nodes.aidatingcoach.geometry}
          material={material}
          onClick={createClickHandler(2, "aidatingcoach")}
          {...pointerHandlers}
        />

        <mesh
          geometry={nodes.roadmap.geometry}
          material={material}
          onClick={createClickHandler(5, "roadmap")}
          {...pointerHandlers}
        />

        <mesh
          geometry={nodes.download.geometry}
          material={material}
          onClick={createClickHandler(3, "download")}
          {...pointerHandlers}
        />

        <mesh
          geometry={nodes.about.geometry}
          material={material}
          onClick={createClickHandler(1, "about")}
          {...pointerHandlers}
        />

        <group position={[-0.014, 2.547, -0.003]}>
          <RotateAxis axis="y" speed={1}>
            <mesh
              geometry={nodes.token.geometry}
              material={material}
              onClick={createClickHandler(4, "token")}
              {...pointerHandlers}
            />
          </RotateAxis>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload("/models/Pole.glb")

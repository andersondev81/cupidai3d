import { useGLTF, useTexture } from "@react-three/drei"
import { useLoader } from "@react-three/fiber"
import React, { useEffect, useMemo } from "react"
import { MeshStandardMaterial } from "three"
import * as THREE from "three"
import { RGBELoader } from "three/addons/loaders/RGBELoader.js"
import {
  Color,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  DoubleSide,
  NormalBlending,
  NearestFilter,
  EquirectangularReflectionMapping,
} from "three"
import RotateAxis from "../../components/helpers/RotateAxis"

const usePoleMaterial = () => {
  // Carregar texturas do Pole
  const textures = useTexture({
    map: "/texture/PoleColorAO.webp",
    metalnessMap: "/texture/PoleMetallicA.webp",
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
      new MeshBasicMaterial({
        map: textures.map,
        metalnessMap: textures.metalnessMap,
        roughnessMap: textures.roughnessMap,
        emissiveMap: textures.emissiveMap,
        transparent: false,
        alphaTest: 0.5,
        side: DoubleSide,
        blending: NormalBlending,
        roughness: 0,
        metalness: 1.3,
        envMap: envMap,
        envMapIntensity: 1.9,
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

// Added new material function for hearts
const useHeartsMaterial = () => {
  // Load heart textures
  const textures = useTexture({
    map: "/texture/heartColor.webp",
    emissiveMap: "/texture/Heart_EmissiveW.webp",
  })

  // Process all textures
  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = false
        texture.minFilter = NearestFilter
        texture.magFilter = NearestFilter
      }
    })
  }, [textures])

  // Create and return material
  return useMemo(
    () =>
      new MeshPhysicalMaterial({
        map: textures.map,
        emissiveMap: textures.emissiveMap,
        emissive: new THREE.Color(0x00bdff),
        emissiveIntensity: 2.5,
        side: DoubleSide,
        metalness: 1,
        roughness: 0.4,
      }),
    [textures]
  )
}

export function Pole({ onSectionChange, ...props }) {
  const { nodes } = useGLTF("/models/Pole.glb")
  const material = usePoleMaterial()
  const materialHearts = useHeartsMaterial()

  // Simplified click handler using the navigation system
  // Update the handleElementClick function in Pole.jsx

  // Find this code block in the createClickHandler function:
  const createClickHandler = (sectionIndex, sectionName) => e => {
    e.stopPropagation()
    console.log(`Pole: Clicked on section ${sectionName}`)

    // Tag this navigation as coming from the pole
    if (window.navigationSystem) {
      // Get the corresponding element ID for this section
      const elementId =
        sectionName === "aidatingcoach"
          ? "mirror"
          : sectionName === "token"
          ? "atm"
          : sectionName === "roadmap"
          ? "scroll"
          : null

      if (elementId) {
        // NEW: Set navigation source to 'pole'
        if (window.navigationSystem.setNavigationSource) {
          window.navigationSystem.setNavigationSource(elementId, "pole")
          console.log(`Pole: Set navigation source for ${elementId} to 'pole'`)
        }

        // Clear any stored position to ensure we don't return to a specific camera position
        if (window.navigationSystem.clearPositionForElement) {
          window.navigationSystem.clearPositionForElement(elementId)
        }
      }
    }

    if (onSectionChange && typeof onSectionChange === "function") {
      console.log(`Pole: Using onSectionChange callback for ${sectionName}`)
      onSectionChange(sectionIndex, sectionName)
    }

    if (window.globalNavigation && window.globalNavigation.navigateTo) {
      console.log(`Pole: Using global navigation for ${sectionName}`)
      window.globalNavigation.navigateTo(sectionName)
    }

    console.log(
      `Pole: Navigation to ${sectionName} attempted. Check if camera moved.`
    )
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

  // Verificar se os nós existem antes de tentar acessar suas geometrias
  if (!nodes || !nodes.pole) {
    console.warn("Pole nodes not loaded properly")
    return null
  }

  return (
    <group {...props} dispose={null}>
      <group position={[0.2, -0.35, -0.2]} rotation={[0, Math.PI + 5, 0]}>
        <mesh geometry={nodes.pole.geometry} material={material} />

        {nodes.aidatingcoach && (
          <mesh
            geometry={nodes.aidatingcoach.geometry}
            material={materialHearts}
            onClick={createClickHandler(2, "aidatingcoach")}
            {...pointerHandlers}
          />
        )}

        {nodes.roadmap && (
          <mesh
            geometry={nodes.roadmap.geometry}
            material={materialHearts}
            onClick={createClickHandler(5, "roadmap")}
            {...pointerHandlers}
          />
        )}

        {nodes.download && (
          <mesh
            geometry={nodes.download.geometry}
            material={materialHearts}
            onClick={createClickHandler(3, "download")}
            {...pointerHandlers}
          />
        )}

        {nodes.about && (
          <mesh
            geometry={nodes.about.geometry}
            material={materialHearts}
            onClick={createClickHandler(1, "about")}
            {...pointerHandlers}
          />
        )}

        <group position={[-0.014, 2.547, -0.003]}>
          <RotateAxis axis="y" speed={1}>
            {nodes.token && (
              <mesh
                geometry={nodes.token.geometry}
                material={materialHearts}
                onClick={createClickHandler(4, "token")}
                {...pointerHandlers}
              />
            )}
          </RotateAxis>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload("/models/Pole.glb")

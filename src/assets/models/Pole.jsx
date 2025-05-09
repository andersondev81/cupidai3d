import { useGLTF, useTexture } from "@react-three/drei" // Adicionei useGLTF de volta aqui
import { useLoader } from "@react-three/fiber"
import { useMemo } from "react"
import * as THREE from "three"
import {
  TextureLoader,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MeshBasicMaterial,
  DoubleSide,
  NearestFilter,
  EquirectangularReflectionMapping,
} from "three"
import RotateAxis from "../../components/helpers/RotateAxis"

// Configurações de textura
const TEXTURE_SETTINGS = {
  flipY: false,
  minFilter: NearestFilter,
  magFilter: NearestFilter,
}

// Caminhos dos environment maps separados
const POLE_ENV_MAP_PATH = "/images/studio.jpg"
const HEARTS_ENV_MAP_PATH = "/images/studio.jpg"

const usePoleMaterial = () => {
  const textures = useTexture({
    map: "/texture/PoleColor.webp",
    metalnessMap: "/texture/Pole_Metallic.webp",
    roughnessMap: "/texture/Pole_Roughness.webp",
  })

  const envMap = useLoader(TextureLoader, POLE_ENV_MAP_PATH)
  envMap.mapping = EquirectangularReflectionMapping

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) Object.assign(texture, TEXTURE_SETTINGS)
    })
  }, [textures])

  return useMemo(
    () =>
      new MeshStandardMaterial({
        ...textures,
        envMap,
        envMapIntensity: 2,
        side: DoubleSide,
        roughness: 0.7,
        metalness: 0.7,
      }),
    [textures, envMap]
  )
}

const useHeartsMaterial = () => {
  const textures = useTexture({
    map: "/texture/heartColor.webp",
    emissiveMap: "/texture/HeartPoleEmissive.webp",
  })

  const envMap = useLoader(TextureLoader, HEARTS_ENV_MAP_PATH)
  envMap.mapping = EquirectangularReflectionMapping

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) Object.assign(texture, TEXTURE_SETTINGS)
    })
  }, [textures])

  return useMemo(
    () =>
      new MeshPhysicalMaterial({
        ...textures,
        envMap,
        side: DoubleSide,
        emissive: new THREE.Color(0x00bdff),
        emissiveIntensity: 6,
        metalness: 1.2,
        roughness: 0.5,
        envMapIntensity: 3.5,
      }),
    [textures, envMap]
  )
}

const useFlowersMaterial = () => {
  const textures = useTexture({
    map: "/texture/PoleColor.webp",
    metalnessMap: "/texture/Pole_Metallic.webp",
    roughnessMap: "/texture/Pole_Roughness.webp",
  })

  const envMap = useLoader(TextureLoader, POLE_ENV_MAP_PATH)
  envMap.mapping = EquirectangularReflectionMapping

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) Object.assign(texture, TEXTURE_SETTINGS)
    })
  }, [textures])

  return useMemo(
    () =>
      new MeshStandardMaterial({
        ...textures,
        envMap,
        envMapIntensity: 1,
        side: DoubleSide,
        roughness: 1,
        metalness: 0.5,
      }),
    [textures, envMap]
  )
}
export function Pole({ onSectionChange, ...props }) {
  const { nodes } = useGLTF("/models/Pole.glb")
  const material = usePoleMaterial()
  const materialHearts = useHeartsMaterial()
  const materialFlowers = useFlowersMaterial()
  const createClickHandler = (sectionIndex, sectionName) => e => {
    e.stopPropagation()
    // console.log(`Pole: Clicked on section ${sectionName}`)

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
          : sectionName === "about"
          ? "orb" // Adicionado este caso
          : null

      if (elementId) {
        if (window.navigationSystem.setNavigationSource) {
          window.navigationSystem.setNavigationSource(elementId, "pole")
        }

        // Clear any stored position to ensure we don't return to a specific camera position
        if (window.navigationSystem.clearPositionForElement) {
          window.navigationSystem.clearPositionForElement(elementId)
        }
      }
    }

    if (onSectionChange && typeof onSectionChange === "function") {
      // console.log(`Pole: Using onSectionChange callback for ${sectionName}`)
      onSectionChange(sectionIndex, sectionName)
    }

    if (window.globalNavigation && window.globalNavigation.navigateTo) {
      // console.log(`Pole: Using global navigation for ${sectionName}`)
      window.globalNavigation.navigateTo(sectionName)
    }

    // console.log(
    //   `Pole: Navigation to ${sectionName} attempted. Check if camera moved.`
    // )
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
        <mesh geometry={nodes.flowers.geometry} material={materialFlowers} />
        {nodes.aidatingcoach && (
          <mesh
            geometry={nodes.aidatingcoach.geometry}
            material={materialHearts}
            onClick={e => {
              createClickHandler(2, "aidatingcoach")(e)
              if (window.audioManager && window.audioManager.play) {
                window.audioManager.play("transition")
              }
            }}
            {...pointerHandlers}
          />
        )}

        {nodes.roadmap && (
          <mesh
            geometry={nodes.roadmap.geometry}
            material={materialHearts}
            onClick={e => {
              createClickHandler(5, "roadmap")(e)
              if (window.audioManager && window.audioManager.play) {
                window.audioManager.play("transition")
              }
            }}
            {...pointerHandlers}
          />
        )}

        {nodes.download && (
          <mesh
            geometry={nodes.download.geometry}
            material={materialHearts}
            onClick={e => {
              createClickHandler(3, "download")(e)
              if (window.audioManager && window.audioManager.play) {
                window.audioManager.play("transition")
              }
            }}
          />
        )}

        {nodes.about && (
          <mesh
            geometry={nodes.about.geometry}
            material={materialHearts}
            onClick={e => {
              createClickHandler(1, "about")(e)
              if (window.audioManager && window.audioManager.play) {
                window.audioManager.play("transition")
              }
            }}
          />
        )}

        <group position={[-0.014, 2.547, -0.003]}>
          <RotateAxis axis="y" speed={1}>
            {nodes.token && (
              <mesh
                geometry={nodes.token.geometry}
                material={materialHearts}
                onClick={e => {
                  createClickHandler(4, "token")(e)
                  if (window.audioManager && window.audioManager.play) {
                    window.audioManager.play("transition")
                  }
                }}
              />
            )}
          </RotateAxis>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload("/models/Pole.glb")

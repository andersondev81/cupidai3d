import React, { useEffect, useState } from "react"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

export default function AtmIframe(props) {
  const { nodes, materials } = useGLTF("/models/atmIframe.glb")
  const [checkerTexture, setCheckerTexture] = useState(null)

  // Carrega a textura
  useEffect(() => {
    const textureLoader = new THREE.TextureLoader()
    textureLoader.load(
      "/texture/checker.webp",
      loadedTexture => {
        loadedTexture.wrapS = THREE.RepeatWrapping
        loadedTexture.wrapT = THREE.RepeatWrapping
        loadedTexture.repeat.set(2, 2) // Ajuste a repetição conforme necessário
        setCheckerTexture(loadedTexture)
      },
      undefined,
      error => console.error("Erro ao carregar textura:", error)
    )
  }, [])

  // Criando um material com a textura xadrez
  const checkerMaterial = React.useMemo(() => {
    if (nodes.atmIframe?.material) {
      // Clonar o material original para preservar outras propriedades
      const newMaterial = nodes.atmIframe.material.clone()
      // Configurar o material com a textura quando disponível
      if (checkerTexture) {
        newMaterial.map = checkerTexture
        newMaterial.needsUpdate = true
      }
      // Tornar o material double-sided
      newMaterial.side = THREE.DoubleSide
      return newMaterial
    }

    // Fallback para um material básico
    return new THREE.MeshStandardMaterial({
      map: checkerTexture,
      side: THREE.DoubleSide,
    })
  }, [nodes.atmIframe?.material, checkerTexture])

  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.atmIframe.geometry}
        material={checkerMaterial}
        position={[1.675, 1.185, 0.86]}
        rotation={[1.47, 0.194, -1.088]}
      />
    </group>
  )
}

useGLTF.preload("/models/atmIframe.glb")

import React, { useEffect, useState } from "react"
import { useGLTF, useTexture } from "@react-three/drei"
import * as THREE from "three"

export default function MirrorIframe(props) {
  const { nodes, materials } = useGLTF("/models/mirrorIframe.glb")
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
    if (nodes.mirrorIframe?.material) {
      // Clonar o material original para preservar outras propriedades
      const newMaterial = nodes.mirrorIframe.material.clone()
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
  }, [nodes.mirrorIframe?.material, checkerTexture])

  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.mirrorIframe.geometry}
        material={checkerMaterial}
        position={[-1.64, 1.393, -0.832]}
        rotation={[-1.567, -0.002, -2.037]}
      />
    </group>
  )
}

useGLTF.preload("/models/mirrorIframe.glb")

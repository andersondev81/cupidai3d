import React, { useEffect, useState } from "react"
import { useGLTF } from "@react-three/drei"
import * as THREE from "three"

export default function ScrolIframe(props) {
  const { nodes, materials } = useGLTF("/models/scrollframe.glb")
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
    if (nodes.scroolIframe?.material) {
      // Clonar o material original para preservar outras propriedades
      const newMaterial = nodes.scroolIframe.material.clone()
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
  }, [nodes.scroolIframe?.material, checkerTexture])

  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.scroolIframe.geometry}
        material={checkerMaterial}
        position={[-1.805, 1.106, 0.908]}
        rotation={[-3.142, 1.051, -1.568]}
      />
    </group>
  )
}

useGLTF.preload("/models/scrollframe.glb")

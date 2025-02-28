import React, { useRef, useEffect } from "react"
import { useThree } from "@react-three/fiber"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"
import * as THREE from "three"
import { useControls, button } from "leva"

const EnvMapLoader = () => {
  const { scene } = useThree()
  const fileInputRef = useRef(null)

  useEffect(() => {
    // Cria elemento de input de arquivo fora do Canvas
    const fileInput = document.createElement('input')
    fileInput.type = 'file'
    fileInput.style.display = 'none'
    fileInput.accept = '.hdr,.jpg,.jpeg,.png,.webp'
    document.body.appendChild(fileInput)

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0]
      if (!file) return

      const fileURL = URL.createObjectURL(file)

      if (file.name.toLowerCase().endsWith('.hdr')) {
        // Para arquivos HDR
        const loader = new RGBELoader()
        loader.load(fileURL, (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping
          scene.environment = texture
          scene.background = texture
        })
      } else if (file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/)) {
        // Para imagens comuns
        const loader = new THREE.TextureLoader()
        loader.load(fileURL, (texture) => {
          texture.mapping = THREE.EquirectangularReflectionMapping
          scene.environment = texture
          scene.background = texture
        })
      }
    })

    fileInputRef.current = fileInput

    return () => {
      document.body.removeChild(fileInput)
    }
  }, [scene])

  // Adiciona um botão simples no painel Leva
  useControls({
    "Upload Environment Map": button(() => {
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
    })
  })

  // Não renderiza nada no Canvas
  return null
}

export default EnvMapLoader
import React, { useEffect, useRef, useCallback } from "react"
import { useThree } from "@react-three/fiber"

/**
 * Componente que desativa a emissão de materiais para objetos na layer 1
 * para evitar que sejam afetados pelo bloom.
 */
export const MaterialEmissionControl = () => {
  const { scene } = useThree()
  const materialsModified = useRef({})
  const initialized = useRef(false)

  // Função para processar a cena e modificar materiais
  const processScene = useCallback(() => {
    if (initialized.current) return

    console.log("MaterialEmissionControl: Processando cena...")

    // Traverse na cena para encontrar todos os objetos
    scene.traverse(object => {
      // Verificar se é um objeto com material
      if (object.isMesh && object.material) {
        // Suporte para arrays de materiais
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material]

        // Verificar a layer do objeto
        const isLayer1 = (object.layers.mask & (1 << 1)) !== 0

        if (isLayer1) {
          console.log(
            `Encontrado objeto na layer 1: ${object.name || "sem nome"}`
          )

          // Processar cada material do objeto
          materials.forEach(material => {
            // Pular materiais que não têm propriedades de emissão
            if (material.emissiveIntensity === undefined) return

            // Guardar configurações originais para poder restaurar depois
            const id = object.uuid + "_" + (material.uuid || Math.random())
            materialsModified.current[id] = {
              material,
              originalEmissiveIntensity: material.emissiveIntensity,
              originalEmissive: material.emissive
                ? material.emissive.clone()
                : null,
            }

            // Desativar emissão para objetos na layer 1
            material.emissiveIntensity = 0
            console.log(`Desativou emissão para material`)
          })
        }
      }
    })

    initialized.current = true
    console.log(
      `MaterialEmissionControl: ${
        Object.keys(materialsModified.current).length
      } materiais processados`
    )
  }, [scene])

  // Processar a cena uma vez quando o componente for montado
  useEffect(() => {
    // Dar um pequeno delay para garantir que a cena esteja carregada
    const timer = setTimeout(() => {
      processScene()
    }, 100)

    // Cleanup: restaurar configurações originais
    return () => {
      clearTimeout(timer)

      Object.values(materialsModified.current).forEach(
        ({ material, originalEmissiveIntensity, originalEmissive }) => {
          if (material) {
            material.emissiveIntensity = originalEmissiveIntensity
            if (originalEmissive && material.emissive) {
              material.emissive.copy(originalEmissive)
            }
          }
        }
      )

      console.log("MaterialEmissionControl: restaurou configurações originais")
    }
  }, [processScene])

  return null // Este componente não renderiza nada
}

export default MaterialEmissionControl

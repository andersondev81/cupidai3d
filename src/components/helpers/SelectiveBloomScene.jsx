// SelectiveBloom.jsx
import { useState, useEffect, useMemo } from "react"
import * as THREE from "three"
import { useThree, useFrame } from "@react-three/fiber"
import {
  EffectComposer,
  RenderPass,
  UnrealBloomPass,
  ShaderPass,
} from "three-stdlib"
import { useControls } from "leva"

// Constante para definir a layer de bloom
const BLOOM_LAYER = 2

// Hook para bloom seletivo
export const useSelectiveBloom = () => {
  const { gl, scene, camera, size } = useThree()
  const [bloomLayer] = useState(() => new THREE.Layers())
  const [darkMaterial] = useState(
    () => new THREE.MeshBasicMaterial({ color: "black" })
  )
  const [materials] = useState({})

  // Configurações do bloom com Leva UI
  const bloomParams = useControls("Selective Bloom", {
    enabled: true,
    strength: { value: 1.5, min: 0, max: 3, step: 0.01 },
    radius: { value: 0.4, min: 0, max: 1, step: 0.01 },
    threshold: { value: 0.2, min: 0, max: 1, step: 0.01 },
  })

  // Inicializa a layer de bloom
  useEffect(() => {
    bloomLayer.set(BLOOM_LAYER)
  }, [bloomLayer])

  // Configuração dos compositores
  const [composers] = useState(() => {
    // Compositor para renderizar apenas os objetos com bloom
    const bloomComposer = new EffectComposer(gl)
    bloomComposer.renderToScreen = false

    // Compositor final que combina a cena normal com o efeito bloom
    const finalComposer = new EffectComposer(gl)

    return { bloomComposer, finalComposer }
  })

  // Configura as passagens quando temos o tamanho da tela
  useEffect(() => {
    const { bloomComposer, finalComposer } = composers

    // Limpa passes anteriores
    while (bloomComposer.passes.length)
      bloomComposer.removePass(bloomComposer.passes[0])
    while (finalComposer.passes.length)
      finalComposer.removePass(finalComposer.passes[0])

    // Passagens para o compositor de bloom
    const renderPass = new RenderPass(scene, camera)
    bloomComposer.addPass(renderPass)

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      bloomParams.strength,
      bloomParams.radius,
      bloomParams.threshold
    )
    bloomComposer.addPass(bloomPass)

    // Passagens para o compositor final
    const finalRenderPass = new RenderPass(scene, camera)
    finalComposer.addPass(finalRenderPass)

    // Shader para combinar as duas texturas
    const bloomShaderPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: bloomComposer.renderTarget2.texture },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D baseTexture;
          uniform sampler2D bloomTexture;
          varying vec2 vUv;
          void main() {
            gl_FragColor = texture2D(baseTexture, vUv) + vec4(1.0) * texture2D(bloomTexture, vUv);
          }
        `,
      }),
      "baseTexture"
    )
    bloomShaderPass.needsSwap = true
    finalComposer.addPass(bloomShaderPass)

    return () => {
      // Dispose apenas os objetos que têm o método dispose
      if (bloomPass && typeof bloomPass.dispose === "function") {
        bloomPass.dispose()
      }

      // RenderPass não tem método dispose na three-stdlib
      // Não chame dispose() nesses objetos

      // ShaderPass pode ter método dispose, verificar antes
      if (bloomShaderPass && typeof bloomShaderPass.dispose === "function") {
        bloomShaderPass.dispose()
      }
    }
  }, [
    composers,
    camera,
    scene,
    size,
    bloomParams.strength,
    bloomParams.radius,
    bloomParams.threshold,
  ])

  // Redimensiona os compositores quando o tamanho da tela muda
  useEffect(() => {
    const { bloomComposer, finalComposer } = composers
    bloomComposer.setSize(size.width, size.height)
    finalComposer.setSize(size.width, size.height)
  }, [composers, size])

  // Funções para escurecer os objetos sem bloom e restaurar os materiais
  const darkenNonBloomed = obj => {
    if (obj.isMesh && bloomLayer.test(obj.layers) === false) {
      materials[obj.uuid] = obj.material
      obj.material = darkMaterial
    }
  }

  const restoreMaterial = obj => {
    if (materials[obj.uuid]) {
      obj.material = materials[obj.uuid]
      delete materials[obj.uuid]
    }
  }

  // Hook de renderização que aplica o bloom seletivo
  useFrame(() => {
    if (!bloomParams.enabled) return

    const { bloomComposer, finalComposer } = composers

    // Primeira passagem: renderiza apenas os objetos com bloom
    scene.traverse(darkenNonBloomed)
    bloomComposer.render()
    scene.traverse(restoreMaterial)

    // Segunda passagem: renderiza a cena inteira com o bloom aplicado
    finalComposer.render()
  }, 100) // Prioridade alta (valor alto) para executar após outras atualizações

  // Retorna funções para controlar o bloom
  return {
    enableBloom: object => {
      if (object) object.layers.enable(BLOOM_LAYER)
    },
    disableBloom: object => {
      if (object) object.layers.disable(BLOOM_LAYER)
    },
    toggleBloom: object => {
      if (object) object.layers.toggle(BLOOM_LAYER)
    },
  }
}

export default useSelectiveBloom

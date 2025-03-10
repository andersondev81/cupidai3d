// components/EffectsTree.jsx
import React, { useMemo } from "react"
import { EffectComposer, Bloom } from "@react-three/postprocessing"

export const EffectsTree = ({ mobile = false }) => {
  // Configurações reduzidas para dispositivos móveis
  const bloomConfig = mobile
    ? {
        enabled: true,
        luminanceThreshold: 1.2,
        intensity: 3.0, // Intensidade reduzida
        mipmapBlur: false, // Desabilita mipmap blur para melhor performance
        kernelSize: 2, // Kernel menor
        luminanceSmoothing: 0.7,
        radius: 0.3,
      }
    : {
        enabled: true,
        luminanceThreshold: 1.1,
        intensity: 7.5,
        mipmapBlur: true,
        kernelSize: 4,
        luminanceSmoothing: 0.94,
        radius: 0.42,
      }

  const effectsTree = useMemo(() => {
    // Em dispositivos móveis, podemos simplificar ou remover efeitos
    if (mobile) {
      // Versão simplificada para iOS - apenas bloom básico
      return (
        <EffectComposer multisampling={0} disableNormalPass>
          {bloomConfig.enabled && <Bloom {...bloomConfig} />}
        </EffectComposer>
      )
    }

    // Versão completa para desktop
    return (
      <EffectComposer disableNormalPass>
        {bloomConfig.enabled && <Bloom {...bloomConfig} layers={[2]} />}
      </EffectComposer>
    )
  }, [bloomConfig, mobile])

  return <>{effectsTree}</>
}

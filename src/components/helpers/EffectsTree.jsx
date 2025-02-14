import React, { useMemo } from "react"
import {
  EffectComposer,
  Vignette,
  Bloom,
  Noise,
} from "@react-three/postprocessing"
import { useControls } from "leva"

export const EffectsTree = () => {
  // Certifique-se de que o nome da função é 'EffectsTree'
  const vignetteConfig = useControls("vignette", {
    enabled: false,
    offset: { value: 0.55, min: 0, max: 1 },
    darkness: { value: 0.48, min: 0, max: 1.2 },
  })

  const bloomConfig = useControls("bloom", {
    enabled: true,
    luminanceThreshold: { value: 0.39, min: 0, max: 1 },
    intensity: { value: 7.5, min: 0, max: 28 },
    mipmapBlur: true,
    kernelSize: { value: 4, options: [0, 1, 2, 3, 4, 5] },
    luminanceSmoothing: { value: 0.94, min: 0, max: 2 },
    radius: { value: 0.42, min: 0, max: 1 },
  })

  const noiseConfig = useControls("noise", {
    enabled: false,
    opacity: { value: 0.07, min: 0, max: 1 },
  })

  const effectsTree = useMemo(() => {
    return (
      <EffectComposer disableNormalPass>
        {vignetteConfig.enabled && <Vignette {...vignetteConfig} />}
        {bloomConfig.enabled && <Bloom {...bloomConfig} />}
        {noiseConfig.enabled && <Noise {...noiseConfig} />}
      </EffectComposer>
    )
  }, [vignetteConfig, bloomConfig, noiseConfig])

  return <>{effectsTree}</>
}

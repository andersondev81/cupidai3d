import React, { useMemo } from "react"
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing"
import { useControls } from "leva"

export const EffectsTree = () => {
  const bloomConfig = useControls("bloom", {
    enabled: true,
    luminanceThreshold: { value: 0.37, min: 0, max: 2 },
    intensity: { value: 7.5, min: 0, max: 20 },
    mipmapBlur: true,
    kernelSize: { value: 4, options: [0, 1, 2, 3, 4, 5] },
    luminanceSmoothing: { value: 1.2, min: 0, max: 2 },
    radius: { value: 0.75, min: 0, max: 1 },
  })

  const noiseConfig = useControls("noise", {
    enabled: false,
    opacity: { value: 0.07, min: 0, max: 1 },
  })

  const effectsTree = useMemo(() => {
    return (
      <EffectComposer disableNormalPass>
        {bloomConfig.enabled && <Bloom {...bloomConfig} />}
        {noiseConfig.enabled && <Noise {...noiseConfig} />}
      </EffectComposer>
    )
  }, [bloomConfig, noiseConfig])

  return <>{effectsTree}</>
}

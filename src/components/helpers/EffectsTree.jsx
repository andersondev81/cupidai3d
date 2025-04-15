import { Bloom, EffectComposer } from "@react-three/postprocessing"
import { useControls } from "leva"
import React, { useMemo } from "react"

export const EffectsTree = () => {
  const bloomConfig = useControls("bloom", {
    enabled: false,
    luminanceThreshold: { value: 1.1, min: 0, max: 2 },
    intensity: { value: 7.5, min: 0, max: 28 },
    mipmapBlur: true,
    kernelSize: { value: 4, options: [0, 1, 2, 3, 4, 5] },
    luminanceSmoothing: { value: 0.94, min: 0, max: 2 },
    radius: { value: 0.42, min: 0, max: 1 },
  })

  const effectsTree = useMemo(() => {
    return (
<EffectComposer disableNormalPass multisampling={0}>
  {bloomConfig.enabled && (
    <Bloom
      {...bloomConfig}
      mipmapBlur={false}
      kernelSize={2}
      intensity={5}
    />
  )}
</EffectComposer>
    )
  }, [bloomConfig])

  return <>{effectsTree}</>
}

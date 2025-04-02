import React from "react"
import { Environment } from "@react-three/drei"
import { useThree } from "@react-three/fiber"
import { useControls } from "leva"
import { Perf } from "r3f-perf"
import EnvMapLoader from "./EnvMapLoader"

const ENVIRONMENT_OPTIONS = {
  "Sky Linekotsi": "/images/sky_linekotsi_16_HDRI.hdr",
  "Sky 20": "/images/sky20.hdr",
  "Vino Sky": "/images/VinoSky.hdr",
  "Vino Sky V1": "/images/VinoSkyV1.hdr",
}

const ENVIRONMENT_PRESETS = {
  None: null,
  Apartment: "apartment",
  City: "city",
  Dawn: "dawn",
  Forest: "forest",
  Lobby: "lobby",
  Night: "night",
  Park: "park",
  Studio: "studio",
  Sunset: "sunset",
  Warehouse: "warehouse",
}

const SceneController = ({ section, cameraRef, useCameraAnimation }) => {
  useCameraAnimation(section, cameraRef)
  const { scene } = useThree()

  const {
    environment,
    showBackground,
    preset,
    presetIntensity,
    backgroundBlur,
    environmentIntensity,
  } = useControls(
    "Environment",
    {
      environment: {
        value: "Vino Sky V1",
        options: Object.keys(ENVIRONMENT_OPTIONS),
        label: "HDR File",
      },
      showBackground: {
        value: true,
        label: "Show Background",
      },
      preset: {
        value: "Sunset",
        options: Object.keys(ENVIRONMENT_PRESETS),
        label: "Lighting Preset",
      },
    },
    { collapsed: false }
  )

  const environmentFile = ENVIRONMENT_OPTIONS[environment]
  const presetValue = ENVIRONMENT_PRESETS[preset]

  return (
    <>
      <Environment
        files={environmentFile}
        resolution={256}
        background={showBackground}
        backgroundBlurriness={backgroundBlur}
        environmentIntensity={environmentIntensity}
        preset={null}
      />


      {presetValue && (
        <Environment
          preset={presetValue}
          environmentIntensity={presetIntensity}
        />
      )}

      <EnvMapLoader />

      {process.env.NODE_ENV !== "production" && <Perf position="top-left" />}
    </>
  )
}

export default React.memo(SceneController)
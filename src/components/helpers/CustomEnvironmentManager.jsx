import React, { useRef, useState, useEffect } from "react"
import * as THREE from "three"
import { useThree } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import { useControls, button, folder } from "leva"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"
import { EquirectangularReflectionMapping } from "three"

const ENVIRONMENT_OPTIONS = {
  "Sky Linekotsi": "/images/sky_linekotsi_16_HDRI.hdr",
  "Sky 20": "/images/sky20.hdr",
  "Vino Sky": "/images/VinoSky.hdr",
  "Vino Sky V1": "/images/PanoramaV1.hdr",
  "Custom Upload": "custom",
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

export const CustomEnvironmentManager = () => {
  const { scene } = useThree()
  const [customEnvMap, setCustomEnvMap] = useState(null)
  const [lastUploadedFile, setLastUploadedFile] = useState("No file selected")
  const fileInputRef = useRef(null)

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLastUploadedFile(file.name)

    try {
      const fileURL = URL.createObjectURL(file)

      if (file.name.toLowerCase().endsWith('.hdr')) {
        const loader = new RGBELoader()
        const texture = await new Promise((resolve, reject) => {
          loader.load(fileURL, resolve, undefined, reject)
        })

        texture.mapping = EquirectangularReflectionMapping
        setCustomEnvMap(texture)

      } else if (file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/)) {
        const texture = new THREE.TextureLoader().load(fileURL)
        texture.mapping = EquirectangularReflectionMapping
        setCustomEnvMap(texture)
      }
    } catch (error) {
      console.error("Error loading environment map:", error)
      alert("Failed to load the image as an environment map. Please try a different file.")
    }
  }

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const {
    environment,
    showBackground,
    preset,
    backgroundBlur,
    environmentIntensity,
    presetIntensity,
  } = useControls('Environment', {
    environment: {
      value: 'Vino Sky V1',
      options: Object.keys(ENVIRONMENT_OPTIONS),
      label: 'Environment',
    },
    showBackground: {
      value: true,
      label: 'Show Background',
    },
    preset: {
      value: 'Sunset',
      options: Object.keys(ENVIRONMENT_PRESETS),
      label: 'Lighting Preset',
    },
    customEnvironment: folder({
      uploadCustom: button(() => openFileDialog()),
      currentFile: {
        value: lastUploadedFile,
        editable: false,
        label: 'Current File',
      },
    }, { render: (get) => get("Environment.environment") === "Custom Upload" }),
  }, { collapsed: false })

  useEffect(() => {
    if (environment === 'Custom Upload' && customEnvMap) {
      scene.environment = customEnvMap

      if (showBackground) {
        scene.background = customEnvMap
      } else {
        scene.background = null
      }
    }
  }, [customEnvMap, environment, showBackground, scene])

  useEffect(() => {
    if (environment === 'Custom Upload') {
      if (!customEnvMap) {
        openFileDialog()
      }
    } else {
      scene.environment = null
      scene.background = null
    }
  }, [environment, customEnvMap, scene])

  const environmentFile = ENVIRONMENT_OPTIONS[environment]
  const presetValue = ENVIRONMENT_PRESETS[preset]

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        accept=".hdr,.jpg,.jpeg,.png,.webp"
        onChange={handleFileUpload}
      />

      {environment !== "Custom Upload" && (
        <Environment
          files={environmentFile}
          resolution={256}
          background={showBackground}
          backgroundBlurriness={backgroundBlur}
          environmentIntensity={environmentIntensity}
          preset={null}
        />
      )}

      {presetValue && (
        <Environment
          preset={presetValue}
          environmentIntensity={presetIntensity}
        />
      )}
    </>
  )
}

export default CustomEnvironmentManager
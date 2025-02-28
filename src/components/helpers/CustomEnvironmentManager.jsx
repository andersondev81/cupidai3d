import React, { useRef, useState, useEffect } from "react"
import * as THREE from "three"
import { useThree } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
import { useControls, button, folder } from "leva"
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader"
import { EquirectangularReflectionMapping } from "three"

// Environment options from your existing code
const ENVIRONMENT_OPTIONS = {
  "Sky Linekotsi": "/images/sky_linekotsi_16_HDRI.hdr",
  "Sky 20": "/images/sky20.hdr",
  "Vino Sky": "/images/VinoSky.hdr",
  "Vino Sky V1": "/images/PanoramaV1.hdr",
  "Custom Upload": "custom",
}

// Environment presets
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

  // Create a function to handle file uploads
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Store the file for display in the controls
    setLastUploadedFile(file.name)

    try {
      // Create a URL for the file
      const fileURL = URL.createObjectURL(file)

      // Handle different file types
      if (file.name.toLowerCase().endsWith('.hdr')) {
        // HDR files need to be loaded with RGBELoader
        const loader = new RGBELoader()
        const texture = await new Promise((resolve, reject) => {
          loader.load(fileURL, resolve, undefined, reject)
        })

        texture.mapping = EquirectangularReflectionMapping
        setCustomEnvMap(texture)

      } else if (file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp)$/)) {
        // Regular image files can be loaded with TextureLoader
        const texture = new THREE.TextureLoader().load(fileURL)
        texture.mapping = EquirectangularReflectionMapping
        setCustomEnvMap(texture)
      }
    } catch (error) {
      console.error("Error loading environment map:", error)
      alert("Failed to load the image as an environment map. Please try a different file.")
    }
  }

  // Trigger file input click when button is pressed
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Leva controls for environment settings
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

  // Apply the custom environment map when it changes
  useEffect(() => {
    if (environment === 'Custom Upload' && customEnvMap) {
      // Apply the custom environment map
      scene.environment = customEnvMap

      if (showBackground) {
        scene.background = customEnvMap
        // Apply blur if needed (requires a shader approach)
      } else {
        scene.background = null
      }
    }
  }, [customEnvMap, environment, showBackground, scene])

  // Handle changes to environment selection
  useEffect(() => {
    if (environment === 'Custom Upload') {
      if (!customEnvMap) {
        // Prompt the user to upload a file
        openFileDialog()
      }
    } else {
      // Reset custom environment when selecting a preset
      scene.environment = null
      scene.background = null
    }
  }, [environment, customEnvMap, scene])

  // Get the file path and preset for built-in environments
  const environmentFile = ENVIRONMENT_OPTIONS[environment]
  const presetValue = ENVIRONMENT_PRESETS[preset]

  return (
    <>
      {/* Hidden file input element */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        accept=".hdr,.jpg,.jpeg,.png,.webp"
        onChange={handleFileUpload}
      />

      {/* Only render the Environment component when not using custom upload */}
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

      {/* Only render second Environment component when preset is not "None" */}
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
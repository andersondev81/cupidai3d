import { CameraControls, useGLTF, useTexture } from "@react-three/drei"
import { button, monitor, useControls } from "leva"
import React, { Suspense, useEffect, useMemo, useRef } from "react"
import {
  Color,
  DoubleSide,
  LinearFilter,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NearestFilter,
  NormalBlending,
  VideoTexture,
} from "three"
import { Select } from "@react-three/postprocessing"
import FountainParticles from "../../components/FountainParticles"
import RotateAxis from "../../components/helpers/RotateAxis"

// Constants
const SMALL_SCREEN_THRESHOLD = 768
const TRANSITION_DELAY = 100
const AUDIO_FILE_PATH = "/src/assets/sounds/heartportal.MP3"

// Camera Positions Configuration
const cameraConfig = {
  default: {
    large: [
      132.95512091806918, 87.33269746995288, 188.3864842177005,
      -0.1823668021901385, -0.24424001987657776, 0.22391277970336168,
    ],
    small: [
      132.95512091806918, 87.33269746995288, 188.3864842177005,
      -0.1823668021901385, -0.24424001987657776, 0.22391277970336168,
    ],
  },
  sections: {
    large: {
      nav: [
        -0.1484189177185437, 0.9565803692840462, 6.591986961996083,
        -0.21830679207380707, 1.042078953185994, 0.860456882413919,
      ],
      about: [
        2.036849267056926, 1.1276933552454578, -1.0231282019898584,
        0.37394830262366985, 1.0624176349739602, -0.187605864806909,
      ],
      aidatingcoach: [
        -2.434203790421109, 1.6557626961206224, -1.2415015061749266,
        -0.30992362617772434, 1.2392967457625186, -0.11582946349265688,
      ],
      download: [
        -2.434203790421109, 1.6557626961206224, -1.2415015061749266,
        -0.30992362617772434, 1.2392967457625186, -0.11582946349265688,
      ],
      token: [
        2.0799027767746923, 1.1492603137264552, 1.0627122850364636,
        -1.2102179925739383, 0.8585880494001786, -0.5986556331928229,
      ],
      roadmap: [
        -2.231073073487725, 1.1995652698467631, 1.135322606706848,
        -0.17684615441762777, 0.9455151215049427, 0.03254375215457311,
      ],
    },
    small: {
      nav: [
        -0.47993818136505073, 1.13917177154802, 6.743922666460792,
        -1.3224149774642704, 1.6753152120757284, 1.0989767468615808,
      ],
      about: [
        1.8562259954731093, 1.1626020325030495, -0.926552435064171,
        1.3674383110764547, 1.1705903196566405, -0.662785847191283,
      ],
      aidatingcoach: [
        -2.3148021101664606, 1.1024327055391172, -1.1063841608771088,
        -0.1820891855994354, 1.1199307653182649, -0.05437741521465597,
      ],
      download: [
        1.8562259954731093, 1.1626020325030495, -0.926552435064171,
        1.3674383110764547, 1.1705903196566405, -0.662785847191283,
      ],
      token: [
        2.118405773953273, 1.2172470657362846, 1.0635730429142927,
        0.04723852527162822, 0.585365963592996, 0.11077814711949062,
      ],
      roadmap: [
        -2.231073073487725, 1.1995652698467631, 1.135322606706848,
        -0.17684615441762777, 0.9455151215049427, 0.03254375215457311,
      ],
    },
  },
}

// Custom Hooks
const TRANSITION_SOUND = "/src/assets/sounds/camerawoosh.MP3"
const AUDIO_PATHS = {
  nav: "/src/assets/sounds/nav.mp3",
  about: "/src/assets/sounds/orb.mp3",
  aidatingcoach: "/src/assets/sounds/daingcoachmirror.MP3",
  download: "/src/assets/sounds/daingcoachmirror.mp3",
  token: "/src/assets/sounds/atmambiance.mp3",
  roadmap: "/src/assets/sounds/roadmap.mp3",
}
const NAV_EXTRA_SOUNDS = {
  templeAmbient: "/src/assets/sounds/templeambiance.mp3",
  fountain: "/src/assets/sounds/fountain.mp3",
}

// Enhanced Audio Hook
const useMultiAudio = () => {
  const audioContextRef = useRef(null)
  const audioElementsRef = useRef({})
  const gainNodesRef = useRef({})
  const currentSectionRef = useRef(null)
  const transitionSoundRef = useRef(null)
  const transitionGainRef = useRef(null)
  const navExtraSoundsRef = useRef({})
  const navExtraGainsRef = useRef({})

  const initAudio = () => {
    try {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)()

      transitionSoundRef.current = new Audio(TRANSITION_SOUND)
      const transitionSource = audioContextRef.current.createMediaElementSource(
        transitionSoundRef.current
      )
      transitionGainRef.current = audioContextRef.current.createGain()
      transitionGainRef.current.gain.value = 0.5
      transitionSource.connect(transitionGainRef.current)
      transitionGainRef.current.connect(audioContextRef.current.destination)

      Object.entries(NAV_EXTRA_SOUNDS).forEach(([key, path]) => {
        const audioElement = new Audio(path)
        audioElement.loop = true
        navExtraSoundsRef.current[key] = audioElement

        const source =
          audioContextRef.current.createMediaElementSource(audioElement)
        const gainNode = audioContextRef.current.createGain()
        gainNode.gain.value = 0.3
        source.connect(gainNode)
        gainNode.connect(audioContextRef.current.destination)
        navExtraGainsRef.current[key] = gainNode
      })

      // Initialize section sounds
      Object.entries(AUDIO_PATHS).forEach(([section, path]) => {
        const audioElement = new Audio(path)
        audioElement.loop = true
        audioElementsRef.current[section] = audioElement

        const source =
          audioContextRef.current.createMediaElementSource(audioElement)
        const gainNode = audioContextRef.current.createGain()
        gainNode.gain.value = 0.3

        source.connect(gainNode)
        gainNode.connect(audioContextRef.current.destination)
        gainNodesRef.current[section] = gainNode
      })

      console.log("Audio system initialized successfully")
    } catch (error) {
      console.error("Error initializing audio system:", error)
    }
  }

  const playTransitionSound = () => {
    if (transitionSoundRef.current) {
      transitionSoundRef.current.currentTime = 0
      const playPromise = transitionSoundRef.current.play()

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Error playing transition sound:", error)
        })
      }
    }
  }

  const playSound = section => {
    try {
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume()
      }

      playTransitionSound()

      if (currentSectionRef.current && currentSectionRef.current !== section) {
        const currentAudio = audioElementsRef.current[currentSectionRef.current]
        if (currentAudio) {
          currentAudio.pause()
          currentAudio.currentTime = 0
        }

        if (currentSectionRef.current === "nav") {
          Object.values(navExtraSoundsRef.current).forEach(audio => {
            if (audio) {
              audio.pause()
              audio.currentTime = 0
            }
          })
        }
      }

      setTimeout(() => {
        const newAudio = audioElementsRef.current[section]
        if (newAudio) {
          newAudio.currentTime = 0
          newAudio.play().catch(console.error)

          if (section === "nav") {
            Object.values(navExtraSoundsRef.current).forEach(audio => {
              if (audio) {
                audio.currentTime = 0
                audio.play().catch(console.error)
              }
            })
          }

          currentSectionRef.current = section
        }
      }, 500) // Increased delay between transition and section sounds
    } catch (error) {
      console.error("Error playing sounds:", error)
    }
  }

  const stopSound = () => {
    try {
      if (currentSectionRef.current) {
        const currentAudio = audioElementsRef.current[currentSectionRef.current]
        if (currentAudio) {
          currentAudio.pause()
          currentAudio.currentTime = 0
        }

        // Stop nav extra sounds if in nav section
        if (currentSectionRef.current === "nav") {
          Object.values(navExtraSoundsRef.current).forEach(audio => {
            if (audio) {
              audio.pause()
              audio.currentTime = 0
            }
          })
        }

        currentSectionRef.current = null
      }
    } catch (error) {
      console.error("Error stopping sound:", error)
    }
  }

  const updateListenerPosition = position => {
    if (audioContextRef.current && position) {
      const [x, y, z] = position
      audioContextRef.current.listener.setPosition(x, y, z)
    }
  }

  const cleanup = () => {
    try {
      if (transitionSoundRef.current) {
        transitionSoundRef.current.pause()
        transitionSoundRef.current = null
      }

      Object.values(audioElementsRef.current).forEach(audio => {
        if (audio) {
          audio.pause()
          audio.currentTime = 0
        }
      })

      Object.values(navExtraSoundsRef.current).forEach(audio => {
        if (audio) {
          audio.pause()
          audio.currentTime = 0
        }
      })

      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    } catch (error) {
      console.error("Error during cleanup:", error)
    }
  }

  return {
    initAudio,
    playSound,
    stopSound,
    updateListenerPosition,
    cleanup,
  }
}
// Materials textures---------------------------------------------

// Castle Material
const useCastleMaterial = () => {
  const textures = useTexture({
    map: "/texture/CastleBake.webp",
    normalMap: "/texture/Castle_Normal.webp",
    roughnessMap: "/texture/Castle_Roughness.webp",
    emissiveMap: "/texture/Castle_Emissive.webp",
  })

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = false
        texture.minFilter = texture.magFilter = NearestFilter
      }
    })
  }, [textures])

  return useMemo(
    () =>
      new MeshPhysicalMaterial({
        map: textures.map,
        // normalMap: textures.normalMap,
        roughnessMap: textures.roughnessMap,
        emissiveMap: textures.emissiveMap,
        emissive: new Color(0xffffff), // Adicionando a cor emissiva
        emissiveIntensity: 0.5,
        transparent: false,
        alphaTest: 0.5,
        side: DoubleSide,
        blending: NormalBlending,
        roughness: 1.6,
        metalness: 1,
      }),
    [textures]
  )
}

// Gods Material
const useGodsMaterial = () => {
  const textures = useTexture({
    map: "/texture/gods_colorsTest2.webp",
  })

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = false
        texture.minFilter = texture.magFilter = NearestFilter
        texture.colorSpace = "srgb" // Adicione esta linha
      }
    })
  }, [textures])

  return useMemo(
    () =>
      new MeshBasicMaterial({
        map: textures.map,
        transparent: false,
        alphaTest: 0.5,
        side: DoubleSide,
        blending: NormalBlending,
        roughness: 0.2,
        metalness: 1,
      }),
    [textures]
  )
}
// Hoof Material
const useHoofMaterial = () => {
  const textures = useTexture({
    map: "/texture/HoofGlassBake.webp",
    // alphaMap: "/texture/HoofGlass_Alpha.webp",
    roughnessMap: "/texture/HoofGlassBake.webp",
  })

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = false
        texture.minFilter = texture.magFilter = NearestFilter
      }
    })
  }, [textures])

  return useMemo(
    () =>
      new MeshPhysicalMaterial({
        map: textures.map,
        // alphaMap: textures.alphaMap,
        // roughnessMap: textures.roughnessMap,
        transparent: false,
        // opacity: 1,
        side: DoubleSide,
        blending: NormalBlending,
        roughness: 0.2,
        metalness: 1,
        // transmission: 0.95,
        // ior: 1.5,
        // thickness: 0.5,
        // envMapIntensity: 1,
        // clearcoat: 1,
        // clearcoatRoughness: 0.1,
      }),
    [textures]
  )
}

//atm Material
const useAtmMaterial = () => {
  const textures = useTexture({
    map: "/texture/atmColor.webp",
    roughnessMap: "/texture/atmRoughness.webp",
    metalnessMap: "/texture/atmMetalness.webp",
    materialEmissive: "/texture/atmEmissive.webp",
  })

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = false
        texture.minFilter = texture.magFilter = NearestFilter
      }
    })
  }, [textures])

  return useMemo(
    () =>
      new MeshPhysicalMaterial({
        map: textures.map,
        roughnessMap: textures.roughnessMap,
        metalnessMap: textures.metalnessMap,
        emissiveMap: textures.materialEmissive,
        transparent: false,
        alphaTest: 0.05,
        side: DoubleSide,
        blending: NormalBlending,
        emissive: new Color(0xf6d8ff),
        emissiveIntensity: 3.2,
      }),
    [textures]
  )
}

//Scroll Material
const useScrollMaterial = () => {
  const textures = useTexture({
    map: "/texture/Scroll_Color.webp",
  })

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = false
        texture.minFilter = texture.magFilter = NearestFilter
      }
    })
  }, [textures])

  return useMemo(
    () =>
      new MeshStandardMaterial({
        map: textures.map,
        roughness: 0.7,
        metalness: 0.0,
        side: DoubleSide,
      }),
    [textures]
  )
}

//Portal Material
const usePortalMaterial = () => {
  return useMemo(() => {
    const video = document.createElement("video")
    video.src = "/video/tunel.mp4"
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.autoplay = true
    video.play()

    const videoTexture = new VideoTexture(video)
    videoTexture.minFilter = LinearFilter
    videoTexture.magFilter = LinearFilter
    videoTexture.flipY = false

    return new MeshBasicMaterial({
      map: videoTexture,
      side: DoubleSide,
    })
  }, [])
}
// Fontaine Water Material
const useWaterMaterial = () => {
  return useMemo(() => {
    const video = document.createElement("video")
    video.src = "/video/waterColor.mp4"
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.autoplay = true
    video.play()

    const videoTexture = new VideoTexture(video)
    videoTexture.minFilter = LinearFilter
    videoTexture.magFilter = LinearFilter
    videoTexture.flipY = false

    return new MeshPhysicalMaterial({
      map: videoTexture,
      transparent: false,
      roughness: 0.2,
      metalness: 0,
      side: DoubleSide,
      emissive: new Color(0xffa6f3),
      emissiveIntensity: 2,
    })
  }, [])
}

// Components
const CastleModel = ({ onCastleClick }) => {
  const { nodes } = useGLTF("/models/Castle.glb")
  const material = useCastleMaterial()
  const godsMaterial = useGodsMaterial()
  const hoofMaterial = useHoofMaterial()
  const atmMaterial = useAtmMaterial()
  const portal = usePortalMaterial()
  const scrollMaterial = useScrollMaterial()
  const waterMaterial = useWaterMaterial()

  return (
    <group dispose={null}>
      <mesh geometry={nodes.castle.geometry} material={material} />

      <mesh geometry={nodes.gods.geometry} material={godsMaterial} />
      <mesh
        geometry={nodes.hoofGlassA.geometry}
        material={hoofMaterial}
        position={[0, 3.343, 0]}
      />
      <mesh
        geometry={nodes.atm.geometry}
        material={atmMaterial}
        position={[1.665, 1.259, 0.854]}
        rotation={[1.458, 0.219, 0.486]}
        scale={0.01}
        layers-enable={2}
      />
      <group position={[-0.056, 1.247, -2.117]}>
        <RotateAxis axis="y" speed={0.7} rotationType="euler">
          <mesh geometry={nodes.blow.geometry} material={material} />
        </RotateAxis>
      </group>
      <group>
        <RotateAxis axis="y" speed={1} rotationType="euler">
          <mesh
            geometry={nodes.LogoCupid.geometry}
            material={material}
            position={[0.001, 4.18, -0.006]}
            layers-enable={2}
          />
        </RotateAxis>
      </group>
      <mesh
        geometry={nodes.scroll.geometry}
        material={scrollMaterial}
        position={[0, 0.648, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <Select disabled>
        <mesh
          geometry={nodes.heartVid.geometry}
          material={portal}
          position={[0, 1.698, 2.119]}
          layers-enable={1}
        />
      </Select>
      <mesh
        geometry={nodes.water.geometry}
        material={waterMaterial}
        position={[0, 0.704, 2.406]}
        layers-enable={2}
      />
      <FountainParticles
        count={80}
        color="lightpink"
        size={0.03}
        speed={0.65}
        spread={0.3}
        layers-enable={2}
      />
    </group>
  )
}

// Main Component
const Castle = ({ activeSection }) => {
  const controls = useRef()
  const { initAudio, playSound, stopSound, updateListenerPosition, cleanup } =
    useMultiAudio()
  const getCameraPosition = section => {
    const isSmallScreen = window.innerWidth < SMALL_SCREEN_THRESHOLD
    const screenType = isSmallScreen ? "small" : "large"

    if (section === "default") {
      return cameraConfig.default[screenType]
    }

    return cameraConfig.sections[screenType][section]
  }

  const playTransition = sectionName => {
    if (!controls.current) return

    controls.current.enabled = true // Sempre mantém enabled como true

    const targetPosition = getCameraPosition(
      sectionName === "default" ? "default" : sectionName
    )

    if (targetPosition) {
      controls.current.setLookAt(...targetPosition, true).then(() => {
        controls.current.enabled = sectionName === "nav"
      })

      updateListenerPosition(targetPosition.slice(0, 3))

      if (sectionName !== "default") {
        playSound(sectionName)
      } else {
        stopSound()
      }
    }
  }

  // useEffect(() => {
  //   if (!controls.current) return;

  //   window.controls = controls;
  //   initAudio();

  //   // REMOVIDO TODAS AS RESTRIÇÕES
  //   const defaultPosition = getCameraPosition("default");
  //   controls.current.setLookAt(...defaultPosition, false);

  //   setTimeout(() => {
  //     playTransition("nav");
  //   }, TRANSITION_DELAY);

  //   return cleanup;
  // }, []);

  // Initialize camera and audio

  // useEffect(() => {
  //   if (!controls.current) return

  //   window.controls = controls
  //   // initAudio()

  //   controls.current.minPolarAngle = Math.PI * 0.15
  //   controls.current.maxPolarAngle = Math.PI * 0.55
  //   controls.current.minDistance = 5
  //   controls.current.maxDistance = 20
  //   controls.current.boundaryFriction = 1
  //   controls.current.boundaryEnclosesCamera = true
  //   controls.current.verticalDragToForward = false
  //   controls.current.dollyToCursor = false
  //   controls.current.minY = 1
  //   controls.current.maxY = 15

  //   const defaultPosition = getCameraPosition("default")
  //   controls.current.setLookAt(...defaultPosition, false)

  //   setTimeout(() => {
  //     playTransition("nav")
  //   }, TRANSITION_DELAY)

  //   return cleanup
  // }, [])
  // Handle active section changes
  useEffect(() => {
    if (activeSection) {
      playTransition(activeSection)
    }
  }, [activeSection])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (controls.current && activeSection) {
        const newPosition = getCameraPosition(activeSection)
        controls.current.setLookAt(...newPosition, true)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [activeSection])

  // Debug controls
  useControls("settings", {
    fps: monitor(() => performance.now()),
    smoothTime: {
      value: 0.6,
      min: 0.1,
      max: 2,
      step: 0.1,
      onChange: v => {
        if (controls.current) {
          controls.current.smoothTime = v
        }
      },
    },
    getLookAt: button(() => {
      if (controls.current) {
        const position = controls.current.getPosition()
        const target = controls.current.getTarget()
        console.log([...position, ...target])
      }
    }),
  })

  return (
    <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <CameraControls
        ref={controls}
        makeDefault
        smoothTime={0.6}
        minPolarAngle={Math.PI * 0.15}
        maxPolarAngle={Math.PI * 0.55}
        minDistance={0.1}
        maxDistance={20}
        boundaryFriction={1}
        boundaryEnclosesCamera={true}
        verticalDragToForward={false}
        dollyToCursor={false}
        minY={1}
        maxY={15}
      />
      <Suspense>
        <CastleModel onCastleClick={playTransition} />
      </Suspense>
    </group>
  )
}
useGLTF.preload("/models/Castle.glb")

export default Castle

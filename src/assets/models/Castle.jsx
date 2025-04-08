import { CameraControls, useGLTF, useTexture } from "@react-three/drei"
import { Select } from "@react-three/postprocessing"
import { button, useControls } from "leva"
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react"
import {
  Color,
  DoubleSide,
  LinearFilter,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MeshLambertMaterial,
  MeshPhongMaterial,
  NearestFilter,
  NormalBlending,
  RepeatWrapping,
  VideoTexture,
} from "three"
import * as THREE from "three"
import FountainParticles from "../../components/FountainParticles"
import RotateAxis from "../../components/helpers/RotateAxis"
import AtmIframe from "../models/AtmIframe"
import MirrorIframe from "../models/MirrorIframe"
import ScrollIframe from "../models/ScrolIframe"

const SMALL_SCREEN_THRESHOLD = 768
const TRANSITION_DELAY = 100

// Adjust resource paths for deployment
// const getAssetPath = path => {
//   // Remove /src/ from paths and ensure they work in deployment
//   return path.replace("/src/", "/")
// }

// Audio paths with corrected paths
// const TRANSITION_SOUND = getAssetPath("/assets/sounds/camerawoosh.MP3")
// const AUDIO_PATHS = {
//   nav: getAssetPath("/assets/sounds/nav.mp3"),
//   about: getAssetPath("/assets/sounds/orb.mp3"),
//   aidatingcoach: getAssetPath("/assets/sounds/daingcoachmirror.MP3"),
//   download: getAssetPath("/assets/sounds/daingcoachmirror.mp3"),
//   token: getAssetPath("/assets/sounds/atmambiance.mp3"),
//   roadmap: getAssetPath("/assets/sounds/roadmap.mp3"),
// }

// const NAV_EXTRA_SOUNDS = {
//   templeAmbient: getAssetPath("/assets/sounds/templeambiance.mp3"),
//   fountain: getAssetPath("/assets/sounds/fountain.mp3"),
// }
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
        1.936122025766665, 1.1392067925461205, -0.9748917781012864,
        0.4694349273915467, 1.0221643232260371, -0.2668941766080719,
      ],
      // aidatingcoach: [
      //   -2.2760569098812082, 1.4206049444523328,
      //   -1.131720176265031,
      //   0.1949301285107338,
      //   1.5907278022411098,
      //   0.1158981525808553,

      // ],
      aidatingcoach: [
        -2.361710501463067,

        1.439377184450022,

        -1.1825955618240986,

        -0.16561813012505458,

        1.5435201358103645,

        -0.07648364070439503,
      ],

      // aidatingcoach: [
      //   -1.724581420919758,

      //   1.0878093340956256,

      //   1.7689856870620106,

      //   -0.21830679207380707,

      //   1.042078953185994,

      //   0.860456882413919,
      // ],

      download: [
        1.936122025766665, 1.1392067925461205, -0.9748917781012864,
        0.4694349273915467, 1.0221643232260371, -0.2668941766080719,
      ],
      // token: [
      //   1.471229417317432, 1.243021425805931, 1.751274978169417,
      //   -0.218306792073807, 1.042078953185994, 0.860456882413919,
      // ],
      token: [
        1.825378771634347, 1.233948744799477, 0.9290349176726579,
        -0.1281470601284271, 0.805001281674392, -0.041739658223842804,
      ],
      // token: [
      //   1.8594047310086075, 1.2131688334714825, 0.9650521303938466,
      //   0.20040299564538017, 0.827161135786848, 0.08615779431913168,
      // ],
      roadmap: [
        -2.162176291859386,

        1.1693966697832865,

        1.1159461725522344,

        0.027134998854945094, 1.177966566007922,

        -0.17952880154910716,
      ],
      // Nova posição para a visualização do iframe do ATM
      atm: [
        1.374503345207453, 1.441964012122825, 1.68925639812635,
        -0.218306792073807, 1.042078953185994, 0.860456882413919,
      ],
    },
    small: {
      nav: [
        -0.47993818136505073, 1.13917177154802, 6.743922666460792,
        -1.3224149774642704, 1.6753152120757284, 1.0989767468615808,
      ],
      about: [
        2.3794036621880066, 1.2374886332491917, -1.2579531405441664,
        -0.3255291216311705, 1.3232162748274139, 0.2492021531029873,
      ],
      aidatingcoach: [
        -2.3148021101664606, 1.1024327055391172, -1.1063841608771088,
        -0.1820891855994354, 1.1199307653182649, -0.05437741521465597,
      ],
      download: [
        1.8562259954731093, 1.1626020325030495, -0.926552435064171,
        1.3674383110764547, 1.1705903196566405, -0.662785847191283,
      ],
      token: [-1.413729, 1.421313, 1.655757, -0.218307, 1.042079, 0.860457],
      roadmap: [
        -2.231073073487725, 1.199565269846763, 1.135322606706848,
        -0.176846154417628, 0.945515121504943, 0.032543752154573,
      ],
      // Versão para tela pequena
      atm: [
        1.374503345207453, 1.441964012122825, 1.68925639812635,
        -0.218306792073807, 1.042078953185994, 0.860456882413919,
      ],
    },
  },
}

// Enhanced Audio Hook with iOS compatibility
// const useMultiAudio = () => {
//   const audioContextRef = useRef(null)
//   const audioElementsRef = useRef({})
//   const gainNodesRef = useRef({})
//   const currentSectionRef = useRef(null)
//   const transitionSoundRef = useRef(null)
//   const transitionGainRef = useRef(null)
//   const navExtraSoundsRef = useRef({})
//   const navExtraGainsRef = useRef({})
//   const [audioInitialized, setAudioInitialized] = useState(false)

//   const initAudio = () => {
//     try {
//       // Only create AudioContext after user interaction
//       if (!audioContextRef.current) {
//         audioContextRef.current = new (window.AudioContext ||
//           window.webkitAudioContext)()
//       }

//       if (transitionSoundRef.current) return // Prevent double initialization

//       // Setup transition sound
//       transitionSoundRef.current = new Audio(TRANSITION_SOUND)
//       transitionSoundRef.current.load() // Load but don't play

//       if (audioContextRef.current) {
//         const transitionSource =
//           audioContextRef.current.createMediaElementSource(
//             transitionSoundRef.current
//           )
//         transitionGainRef.current = audioContextRef.current.createGain()
//         transitionGainRef.current.gain.value = 0.5
//         transitionSource.connect(transitionGainRef.current)
//         transitionGainRef.current.connect(audioContextRef.current.destination)
//       }

//       // Setup Nav extra sounds
//       Object.entries(NAV_EXTRA_SOUNDS).forEach(([key, path]) => {
//         const audioElement = new Audio(path)
//         audioElement.loop = true
//         audioElement.load() // Load but don't play
//         navExtraSoundsRef.current[key] = audioElement

//         if (audioContextRef.current) {
//           const source =
//             audioContextRef.current.createMediaElementSource(audioElement)
//           const gainNode = audioContextRef.current.createGain()
//           gainNode.gain.value = 0.3
//           source.connect(gainNode)
//           gainNode.connect(audioContextRef.current.destination)
//           navExtraGainsRef.current[key] = gainNode
//         }
//       })

//       // Initialize section sounds
//       Object.entries(AUDIO_PATHS).forEach(([section, path]) => {
//         const audioElement = new Audio(path)
//         audioElement.loop = true
//         audioElement.load() // Load but don't play
//         audioElementsRef.current[section] = audioElement

//         if (audioContextRef.current) {
//           const source =
//             audioContextRef.current.createMediaElementSource(audioElement)
//           const gainNode = audioContextRef.current.createGain()
//           gainNode.gain.value = 0.3

//           source.connect(gainNode)
//           gainNode.connect(audioContextRef.current.destination)
//           gainNodesRef.current[section] = gainNode
//         }
//       })

//       setAudioInitialized(true)
//       console.log("Audio system initialized successfully")
//     } catch (error) {
//       console.error("Error initializing audio system:", error)
//     }
//   }

//   const resumeAudioContext = () => {
//     if (audioContextRef.current?.state === "suspended") {
//       audioContextRef.current.resume().catch(err => {
//         console.warn("Could not resume AudioContext:", err)
//       })
//     }
//   }

//   const playTransitionSound = () => {
//     if (!audioInitialized) return

//     resumeAudioContext()

//     if (transitionSoundRef.current) {
//       transitionSoundRef.current.currentTime = 0
//       const playPromise = transitionSoundRef.current.play()

//       if (playPromise !== undefined) {
//         playPromise.catch(error => {
//           console.warn("Error playing transition sound:", error)
//         })
//       }
//     }
//   }

//   const playSound = section => {
//     if (!audioInitialized) return

//     try {
//       resumeAudioContext()

//       playTransitionSound()

//       if (currentSectionRef.current && currentSectionRef.current !== section) {
//         const currentAudio = audioElementsRef.current[currentSectionRef.current]
//         if (currentAudio) {
//           currentAudio.pause()
//           currentAudio.currentTime = 0
//         }

//         if (currentSectionRef.current === "nav") {
//           Object.values(navExtraSoundsRef.current).forEach(audio => {
//             if (audio) {
//               audio.pause()
//               audio.currentTime = 0
//             }
//           })
//         }
//       }

//       setTimeout(() => {
//         const newAudio = audioElementsRef.current[section]
//         if (newAudio) {
//           const playPromise = newAudio.play()

//           if (playPromise !== undefined) {
//             playPromise.catch(err => {
//               console.warn(`Could not play audio for section ${section}:`, err)
//             })
//           }

//           if (section === "nav") {
//             Object.values(navExtraSoundsRef.current).forEach(audio => {
//               if (audio) {
//                 const navPlayPromise = audio.play()
//                 if (navPlayPromise !== undefined) {
//                   navPlayPromise.catch(console.error)
//                 }
//               }
//             })
//           }

//           currentSectionRef.current = section
//         }
//       }, 500)
//     } catch (error) {
//       console.error("Error playing sounds:", error)
//     }
//   }

//   const stopSound = () => {
//     if (!audioInitialized) return

//     try {
//       if (currentSectionRef.current) {
//         const currentAudio = audioElementsRef.current[currentSectionRef.current]
//         if (currentAudio) {
//           currentAudio.pause()
//           currentAudio.currentTime = 0
//         }

//         // Stop nav extra sounds if in nav section
//         if (currentSectionRef.current === "nav") {
//           Object.values(navExtraSoundsRef.current).forEach(audio => {
//             if (audio) {
//               audio.pause()
//               audio.currentTime = 0
//             }
//           })
//         }

//         currentSectionRef.current = null
//       }
//     } catch (error) {
//       console.error("Error stopping sound:", error)
//     }
//   }

//   const updateListenerPosition = position => {
//     if (audioContextRef.current && position && audioInitialized) {
//       const [x, y, z] = position
//       try {
//         if (audioContextRef.current.listener.setPosition) {
//           audioContextRef.current.listener.setPosition(x, y, z)
//         }
//       } catch (error) {
//         console.warn("Could not set audio listener position:", error)
//       }
//     }
//   }

//   const cleanup = () => {
//     try {
//       if (transitionSoundRef.current) {
//         transitionSoundRef.current.pause()
//       }

//       Object.values(audioElementsRef.current).forEach(audio => {
//         if (audio) {
//           audio.pause()
//         }
//       })

//       Object.values(navExtraSoundsRef.current).forEach(audio => {
//         if (audio) {
//           audio.pause()
//         }
//       })

//       if (
//         audioContextRef.current &&
//         audioContextRef.current.state !== "closed"
//       ) {
//         audioContextRef.current.close().catch(console.error)
//       }
//     } catch (error) {
//       console.error("Error during cleanup:", error)
//     }
//   }

//   return {
//     initAudio,
//     playSound,
//     stopSound,
//     updateListenerPosition,
//     cleanup,
//     audioInitialized,
//     resumeAudioContext,
//   }
// }

// Localizar o hook useVideoTexture (por volta da linha 220-240)
const useVideoTexture = videoPath => {
  const [texture, setTexture] = useState(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const video = document.createElement("video")
    video.src = videoPath
    video.loop = true
    video.muted = true
    video.playsInline = true
    // Adicione essas duas linhas:
    video.autoplay = true
    // video.play()
    // video.load()

    videoRef.current = video

    const videoTexture = new VideoTexture(video)
    videoTexture.minFilter = LinearFilter
    videoTexture.magFilter = LinearFilter
    videoTexture.flipY = false

    setTexture(videoTexture)

    // Cleanup
    return () => {
      video.pause()
      video.src = ""
    }
  }, [videoPath])

  const playVideo = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.warn("Could not play video:", err)
      })
    }
  }

  return { texture, playVideo }
}
// Castle materials
const useCastleMaterial = (
  materialType = "standard",
  metalness = 1.3,
  roughness = 1.6
) => {
  const textures = useTexture({
    map: "/texture/castle_Base_ColorAO.webp",
    metalnessMap: "/texture/castle_Metallic.webp",
    roughnessMap: "/texture/castle_Roughness.webp",
  })

  const clouds = useTexture("/images/bg1.jpg")

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = true
        texture.minFilter = texture.magFilter = NearestFilter
      }
    })

    if (clouds) {
      clouds.mapping = THREE.EquirectangularReflectionMapping
    }
  }, [textures, clouds])

  return useMemo(() => {
    // Propriedades base compartilhadas por todos os materiais
    const commonProps = {
      map: textures.map,
      side: DoubleSide,
      transparent: false,
      alphaTest: 0.05,
    }

    // Propriedades específicas para materiais que suportam PBR (sem emissive)
    const pbrProps = {
      ...commonProps,
      roughnessMap: textures.roughnessMap,
      roughness: roughness,
      metalness: metalness,
      blending: NormalBlending,
      envMap: clouds,
      envMapIntensity: 1.0,
    }

    // Criar o material baseado no tipo selecionado
    switch (materialType) {
      case "physical":
        return new MeshPhysicalMaterial(pbrProps)
      case "basic":
        return new MeshBasicMaterial({
          ...commonProps,
          color: new Color(0xffffff),
        })
      case "standard":
      default:
        return new MeshStandardMaterial(pbrProps)
    }
  }, [textures, materialType, metalness, roughness, clouds])
}

const useCastleHeartMaterial = (
  metalness = 1.4,
  roughness = 0,
  emissiveIntensity = 0,
  emissiveColor = "#0000000"
) => {
  const textures = useTexture({
    map: "/texture/castleHeart_Base_colorAO.webp",
  })

  const clouds = useTexture("/images/bg1.jpg")

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = true
        texture.minFilter = texture.magFilter = NearestFilter
      }
    })

    if (clouds) {
      clouds.mapping = THREE.EquirectangularReflectionMapping
    }
  }, [textures, clouds])

  return useMemo(() => {
    return new MeshStandardMaterial({
      map: textures.map,
      side: DoubleSide,
      transparent: false,
      alphaTest: 0.05,
      roughnessMap: textures.roughnessMap,
      roughness: roughness,
      metalness: metalness,
      metalnessMap: textures.metalnessMap,
      emissiveMap: textures.emissiveMap,

      emissive: new Color(emissiveColor),
      emissiveIntensity: emissiveIntensity,
      blending: NormalBlending,
      envMap: clouds,
    })
  }, [textures, metalness, roughness, emissiveIntensity, emissiveColor, clouds])
}

const useCastleHeartMaskMaterial = () => {
  return useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color("#DABB46"),
        transparent: false,
        alphaTest: 0.05,
        side: DoubleSide,
        blending: NormalBlending,
        roughness: 0,
        metalness: 1,
      }),
    []
  )
}

const useCastleLightsMaterial = () => {
  const { emissiveMap } = useTexture({
    emissiveMap: "/texture/castleLights_Emissive.webp",
  })

  return new MeshStandardMaterial({
    emissive: new Color("#fff"),
    emissiveIntensity: 2,
    emissiveMap: emissiveMap,
    side: DoubleSide,
  })
}

const usecastleGodsWallsMaterial = (
  materialType = "standard",
  metalness = 1.3,
  roughness = 1.6
) => {
  const textures = useTexture({
    map: "/texture/castleGodsWall_Base_color.webp",
    roughnessMap: "/texture/castleGodsWall_Roughness.webp",
  })

  const clouds = useTexture("/images/bg1.jpg")

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = true
        texture.minFilter = texture.magFilter = NearestFilter
      }
    })

    if (clouds) {
      clouds.mapping = THREE.EquirectangularReflectionMapping
    }
  }, [textures, clouds])

  return useMemo(() => {
    // Propriedades base compartilhadas por todos os materiais
    const commonProps = {
      map: textures.map,
      side: DoubleSide,
      transparent: false,
      alphaTest: 0.05,
    }

    // Propriedades específicas para materiais que suportam PBR
    const pbrProps = {
      ...commonProps,
      roughnessMap: textures.roughnessMap,
      roughness: roughness,
      metalness: metalness,
      blending: NormalBlending,
      envMap: clouds,
      envMapIntensity: 1.0,
    }

    switch (materialType) {
      case "physical":
        return new MeshPhysicalMaterial(pbrProps)
      case "basic":
        return new MeshBasicMaterial({
          ...commonProps,
          color: new Color(0xffffff),
        })
      case "standard":
      default:
        return new MeshStandardMaterial(pbrProps)
    }
  }, [textures, materialType, metalness, roughness, clouds])
}

const useCastleWallsMaterial = (
  materialType = "standard",
  metalness = 1.3,
  roughness = 1.6
) => {
  const textures = useTexture({
    map: "/texture/castleWalls_Base_color.webp",
    roughnessMap: "/texture/castleWalls_Roughness.webp",
  })

  const clouds = useTexture("/images/bg1.jpg")

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = true
        texture.minFilter = texture.magFilter = NearestFilter
      }
    })

    if (clouds) {
      clouds.mapping = THREE.EquirectangularReflectionMapping
    }
  }, [textures, clouds])

  return useMemo(() => {
    // Propriedades base compartilhadas por todos os materiais
    const commonProps = {
      map: textures.map,
      side: DoubleSide,
      transparent: false,
      alphaTest: 0.05,
    }

    // Propriedades específicas para materiais que suportam PBR
    const pbrProps = {
      ...commonProps,
      roughnessMap: textures.roughnessMap,
      roughness: roughness,
      metalness: metalness,
      blending: NormalBlending,
      envMap: clouds,
      envMapIntensity: 1.0,
    }

    // Criar o material baseado no tipo selecionado
    switch (materialType) {
      case "physical":
        return new MeshPhysicalMaterial(pbrProps)
      case "basic":
        return new MeshBasicMaterial({
          ...commonProps,
          color: new Color(0xffffff),
        })
      case "standard":
      default:
        return new MeshStandardMaterial(pbrProps)
    }
  }, [textures, materialType, metalness, roughness, clouds])
}

const useCastlePilarsMaterial = (
  materialType = "standard",
  metalness = 1.3,
  roughness = 1.6
) => {
  const textures = useTexture({
    map: "/texture/castlePilars_Base_color.webp",
    roughnessMap: "/texture/castlePilars_Roughness.webp",
    metalnessMap: "/texture/castlePilars_Metallic.webp",
  })

  const clouds = useTexture("/images/bg1.jpg")

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = true
        texture.minFilter = texture.magFilter = NearestFilter
      }
    })

    if (clouds) {
      clouds.mapping = THREE.EquirectangularReflectionMapping
    }
  }, [textures, clouds])

  return useMemo(() => {
    // Propriedades base compartilhadas por todos os materiais
    const commonProps = {
      map: textures.map,
      side: DoubleSide,
      transparent: false,
      alphaTest: 0.05,
    }

    // Propriedades específicas para materiais que suportam PBR
    const pbrProps = {
      ...commonProps,
      roughnessMap: textures.roughnessMap,
      roughness: roughness,
      metalness: metalness,
      blending: NormalBlending,
      envMap: clouds,
      envMapIntensity: 1.0,
    }

    // Criar o material baseado no tipo selecionado
    switch (materialType) {
      case "physical":
        return new MeshBasicMaterial(pbrProps)
      case "basic":
        return new MeshPhysicalMaterial({
          ...commonProps,
          color: new Color(0xffffff),
        })
      case "standard":
      default:
        return new MeshStandardMaterial(pbrProps)
    }
  }, [textures, materialType, metalness, roughness, clouds])
}
// Floor Material
const useFloorMaterial = (
  materialType = "physical", // "standard", "physical", ou "basic"
  metalness = 1.35,
  roughness = 1
) => {
  const textures = useTexture({
    map: "/texture/floor_Base_colorAO.jpg",
    roughnessMap: "/texture/floor_Roughness.webp",
    metalnessMap: "/texture/floorHeart_Metallic.webp",
  })

  const clouds = useTexture("/images/bg1.jpg")

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = true
        texture.minFilter = texture.magFilter = NearestFilter
      }
    })

    if (clouds) {
      clouds.mapping = THREE.EquirectangularReflectionMapping
    }
  }, [textures, clouds])

  return useMemo(() => {
    // Propriedades base compartilhadas por todos os materiais
    const commonProps = {
      map: textures.map,
      side: DoubleSide,
      transparent: false,
    }

    // Propriedades específicas para materiais que suportam PBR
    const pbrProps = {
      ...commonProps,
      roughnessMap: textures.roughnessMap,
      metalnessMap: textures.metalnessMap,
      roughness: roughness,
      metalness: metalness,
      blending: NormalBlending,
      envMap: clouds,
    }

    // Criar o material baseado no tipo selecionado
    switch (materialType) {
      case "standard":
        return new MeshBasicMaterial(pbrProps)
      case "basic":
        return new MeshStandardMaterial({
          ...commonProps,
          color: new Color(0xffffff),
        })
      case "physical":
      default:
        return new MeshPhysicalMaterial({
          ...pbrProps,
          // Additional physical material properties if needed
          clearcoat: 0.5,
          clearcoatRoughness: 0.1,
        })
    }
  }, [textures, materialType, metalness, roughness, clouds])
}

const useFloorHeartMaterial = (
  metalness = 1,
  roughness = 0.2,
  emissiveIntensity = 1.5,
  emissiveColor = "#fff"
) => {
  const textures = useTexture({
    map: "/texture/castleHeart_Base_colorAO.webp",
    roughnessMap: "/texture/floorHeart_Roughness.webp",
    metalnessMap: "/texture/floorHeart_Metallic.webp",
    emissiveMap: "/texture/floorHeart_Emissive.webp",
  })

  const clouds = useTexture("/images/bg1.jpg")

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = true
        texture.minFilter = texture.magFilter = NearestFilter
      }
    })

    if (clouds) {
      clouds.mapping = THREE.EquirectangularReflectionMapping
    }
  }, [textures, clouds])

  return useMemo(() => {
    return new MeshStandardMaterial({
      map: textures.map,
      roughnessMap: textures.roughnessMap,
      metalnessMap: textures.metalnessMap,
      emissiveMap: textures.emissiveMap,
      side: DoubleSide,
      roughness: roughness,
      metalness: metalness,
      emissive: new Color(emissiveColor),
      emissiveIntensity: emissiveIntensity,
      transparent: false,
      blending: NormalBlending,
      envMap: clouds,
      envMapIntensity: 1.0,
    })
  }, [textures, metalness, roughness, emissiveIntensity, emissiveColor, clouds])
}
//wings Material
const useWingsMaterial = () => {
  const textures = useTexture({
    map: "/texture/WingsColorAO.webp",
  })

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = true
        texture.minFilter = texture.magFilter = NearestFilter
      }
    })
  }, [textures])

  return useMemo(
    () =>
      new MeshStandardMaterial({
        map: textures.map,
        roughness: 0.6,
        metalness: 1,
        side: DoubleSide,
      }),
    [textures]
  )
}

//Logo Material
const useLogoMaterial = () => {
  return useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color("#FA3C81"),
        transparent: false,
        alphaTest: 0.05,
        side: DoubleSide,
        blending: NormalBlending,
        roughness: 0.3,
        metalness: 1,
      }),
    []
  )
}

//Decor Material
const useDecorMaterial = () => {
  return useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color("#DABB46"),
        transparent: false,
        alphaTest: 0.05,
        side: DoubleSide,
        blending: NormalBlending,
        roughness: 0,
        metalness: 1,
      }),
    []
  )
}
//MirrorMaterial
const useMirrorMaterial = () => {
  const clouds = useTexture("/images/clouds.jpg")

  useEffect(() => {
    if (clouds) {
      clouds.mapping = THREE.EquirectangularReflectionMapping
    }
  }, [clouds])

  return useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color("#a6cce5"),
        transparent: false,
        alphaTest: 0.05,
        side: DoubleSide,
        blending: NormalBlending,
        roughness: 0,
        metalness: 0.3,
        envMap: clouds,
        envMapIntensity: 1.0,
      }),
    [clouds]
  )
}

//Hallos Material
const useHallosMaterial = () => {
  return useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: new Color("#DABB46"),
        transparent: false,
        alphaTest: 0.05,
        side: DoubleSide,
        blending: NormalBlending,
        roughness: 0,
        metalness: 2,
      }),
    []
  )
}

// Gods Material
const useGodsMaterial = () => {
  const textures = useTexture({
    map: "/texture/godsColorAO.webp",
  })

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = true
        texture.minFilter = texture.magFilter = NearestFilter
        texture.colorSpace = "srgb"
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
    map: "/texture/hoofGlassColorBAO.webp",
    emissiveMap: "/texture/hoofGlassEmissiveV2.webp",
  })

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = true
        texture.minFilter = texture.magFilter = NearestFilter
      }
    })
  }, [textures])

  return useMemo(
    () =>
      new MeshPhysicalMaterial({
        map: textures.map,
        emissiveMap: textures.emissiveMap,
        emissive: new Color(0x578fd7),
        emissiveIntensity: 3.6,
        transparent: false,
        side: DoubleSide,
        blending: NormalBlending,
        roughness: 0.2,
        metalness: 1,
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

  const clouds = useTexture("/images/bg1.jpg")

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = true
        texture.minFilter = texture.magFilter = NearestFilter
      }
    })

    if (clouds) {
      clouds.mapping = THREE.EquirectangularReflectionMapping
    }
  }, [textures, clouds])

  return useMemo(
    () =>
      new MeshStandardMaterial({
        map: textures.map,
        roughnessMap: textures.roughnessMap,
        metalnessMap: textures.metalnessMap,
        emissiveMap: textures.materialEmissive,
        transparent: false,
        alphaTest: 0.05,
        side: DoubleSide,
        blending: NormalBlending,
        metalness: 1,
        roughness: 0.6,
        emissive: new Color(0xc4627d),
        emissiveIntensity: 3.5,
        envMap: clouds,
        envMapIntensity: 1.0,
      }),
    [textures, clouds] // Added clouds to dependencies
  )
}

//Scroll Material
const useScrollMaterial = () => {
  // Try to load the texture, fallback to a basic material if it fails
  try {
    const textures = useTexture({
      map: "./texture/ScrollColor.webp",
    })

    useMemo(() => {
      Object.values(textures).forEach(texture => {
        if (texture) {
          texture.flipY = true
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
  } catch (error) {
    console.warn("Failed to load ScrollColor texture, using fallback")
    return useMemo(
      () =>
        new MeshStandardMaterial({
          color: "#f0e6d2", // Scroll-like color
          roughness: 0.7,
          metalness: 0.0,
          side: DoubleSide,
        }),
      []
    )
  }
}

//Portal Material
const usePortalMaterial = () => {
  return useMemo(() => {
    const video = document.createElement("video")
    video.src = "/video/tunnel.mp4"
    video.loop = true
    video.muted = true
    video.playsInline = true
    video.autoplay = true
    video.play()

    const videoTexture = new VideoTexture(video)
    videoTexture.minFilter = LinearFilter
    videoTexture.magFilter = LinearFilter
    videoTexture.flipY = true

    return new MeshBasicMaterial({
      map: videoTexture,
      side: DoubleSide,
    })
  }, [])
}

// Fontaine Water Material

// Components

const CastleModel = ({
  onCastleClick,
  hasInteracted,
  onPortalPlay,
  onWaterPlay,
  atmIframeActive,
  mirrorIframeActive,
  scrollIframeActive,
  castleMaterialType,
  castleMetalness,
  castleRoughness,
  castleEmissiveIntensity,
  floorMaterialType,
  floorMetalness,
  floorRoughness,
  floorEmissiveIntensity,
  floorHeartMetalness,
  floorHeartRoughness,
  floorHeartEmissiveIntensity,
  floorHeartEmissiveColor,
}) => {
  const { nodes } = useGLTF("/models/Castle.glb")
  const material = useCastleMaterial(
    castleMaterialType,
    castleMetalness,
    castleRoughness,
    castleEmissiveIntensity
  )
  const castleHeart = useCastleHeartMaterial()
  const castleHeartMask = useCastleHeartMaskMaterial()
  const castleLights = useCastleLightsMaterial()
  const castleGodsWalls = usecastleGodsWallsMaterial()
  const castleWalls = useCastleWallsMaterial()
  const castlePilars = useCastlePilarsMaterial()
  const floorMaterial = useFloorMaterial(
    floorMaterialType,
    floorMetalness,
    floorRoughness,
    floorEmissiveIntensity
  )
  const floorHeart = useFloorHeartMaterial(
    floorHeartMetalness,
    floorHeartRoughness,
    floorHeartEmissiveIntensity,
    floorHeartEmissiveColor
  )
  const logoMaterial = useLogoMaterial()
  const decorMaterial = useDecorMaterial()
  const godsMaterial = useGodsMaterial()
  const hoofMaterial = useHoofMaterial()
  const atmMaterial = useAtmMaterial()
  const scrollMaterial = useScrollMaterial()
  const portal = usePortalMaterial()
  const mirror = useMirrorMaterial()
  const hallosMaterial = useHallosMaterial()

  // Use the video texture hook for portal
  const { texture: portalTexture, playVideo: playPortal } =
    useVideoTexture("/video/tunnel.mp4")
  const portalMaterial = useMemo(
    () =>
      portalTexture
        ? new MeshBasicMaterial({
            map: portalTexture,
            side: DoubleSide,
          })
        : new MeshBasicMaterial({
            color: 0x000000,
            side: DoubleSide,
          }),
    [portalTexture]
  )

  // Use the video texture hook for water
  const { texture: waterTexture, playVideo: playWater } =
    useVideoTexture("/video/water.mp4")
  const waterMaterial = useMemo(
    () =>
      waterTexture
        ? new MeshPhysicalMaterial({
            map: waterTexture,
            transparent: false,
            roughness: 0.2,
            metalness: 1,
            side: DoubleSide,
            emissive: new Color(0xffa6f3),
            emissiveIntensity: 1,
          })
        : new MeshPhysicalMaterial({
            emissive: new Color(0xffa6f3),
            emissiveIntensity: 1,
            side: DoubleSide,
          }),
    [waterTexture]
  )

  // Depois no useEffect para iniciar a reprodução:
  useEffect(() => {
    if (hasInteracted) {
      playPortal()
      playWater()
      if (onPortalPlay) onPortalPlay()
      if (onWaterPlay) onWaterPlay()
    }
  }, [hasInteracted, onPortalPlay])

  // Play videos when user has interacted
  useEffect(() => {
    if (hasInteracted) {
      playPortal()
      playWater()
      if (onPortalPlay) onPortalPlay()
      if (onWaterPlay) onWaterPlay()
    }
  }, [hasInteracted, onPortalPlay, onWaterPlay])

  const wingsMaterial = useWingsMaterial()

  return (
    <group dispose={null}>
      <mesh
        geometry={nodes.castle.geometry}
        material={material}
        layers-enable={1}
        castShadow={false}
        receiveShadow={false}
      />
      <mesh geometry={nodes.castleHeart.geometry} material={castleHeart} />
      <mesh
        geometry={nodes.castleHeartMask.geometry}
        material={castleHeartMask}
      />
      <mesh geometry={nodes.castleLights.geometry} material={castleLights} />
      <mesh
        geometry={nodes.castleGodsWalls.geometry}
        material={castleGodsWalls}
      />

      <mesh geometry={nodes.castleWalls.geometry} material={castleWalls} />
      <mesh geometry={nodes.castlePilars.geometry} material={castlePilars} />
      <mesh geometry={nodes.wings.geometry} material={wingsMaterial} />
      <mesh geometry={nodes.gods.geometry} material={godsMaterial} />
      <mesh geometry={nodes.decor.geometry} material={decorMaterial} />
      <mesh
        geometry={nodes.floor.geometry}
        material={floorMaterial}
        layers-enable={1}
      />
      <mesh geometry={nodes.floorHeart.geometry} material={floorHeart} />
      <mesh geometry={nodes.MirrorFrame.geometry} material={decorMaterial} />
      <mesh geometry={nodes.Mirror.geometry} material={mirror} />
      <mesh
        geometry={nodes.Hallos.geometry}
        material={hallosMaterial}
        layers-enable={2}
      />
      <mesh
        geometry={nodes.hoofGlass.geometry}
        material={hoofMaterial}
        layers-enable={2}
      />
      <mesh
        geometry={nodes.atm.geometry}
        material={atmMaterial}
        layers-enable={2}
        castShadow={false}
        receiveShadow={false}
      />
      <group position={[-0.056, 1.247, -2.117]}>
        <RotateAxis axis="y" speed={0.7} rotationType="euler">
          <mesh
            geometry={nodes.bow.geometry}
            material={decorMaterial}
            castShadow={false}
            receiveShadow={false}
          />
        </RotateAxis>
      </group>
      <group>
        <RotateAxis axis="y" speed={1} rotationType="euler">
          <mesh
            geometry={nodes.LogoCupid.geometry}
            material={logoMaterial}
            position={[0.001, 4.18, -0.006]}
            layers-enable={2}
            castShadow={false}
            receiveShadow={false}
          />
        </RotateAxis>
      </group>
      <mesh
        geometry={nodes.scroll.geometry}
        material={scrollMaterial}
        castShadow={false}
        receiveShadow={false}
      />
      <Select disabled>
        <mesh
          geometry={nodes.HeartVid.geometry}
          material={portal}
          layers-enable={1}
          castShadow={false}
          receiveShadow={false}
        />
      </Select>
      <mesh
        geometry={nodes.water.geometry}
        material={waterMaterial}
        layers-enable={2}
        castShadow={false}
        receiveShadow={false}
      />
      <FountainParticles
        count={80}
        color="lightpink"
        size={0.03}
        speed={0.65}
        spread={0.3}
        layers-enable={2}
        castShadow={false}
        receiveShadow={false}
      />
      <AtmIframe
        position={[1.675, 1.185, 0.86]}
        rotation={[1.47, 0.194, -1.088]}
        onReturnToMain={() => {
          onCastleClick("nav")
        }}
        isActive={atmIframeActive}
      />

      <MirrorIframe
        onReturnToMain={() => {
          onCastleClick("nav")
        }}
        isActive={mirrorIframeActive}
      />

      {/* Add the ScrollIframe component, but make sure it's always rendered */}
      <ScrollIframe
        onReturnToMain={() => {
          onCastleClick("nav")
        }}
        isActive={scrollIframeActive}
      />
    </group>
  )
}

// Main Component
const Castle = ({ activeSection }) => {
  const controls = useRef()
  const [atmiframeActive, setAtmiframeActive] = useState(false)
  const [mirrorIframeActive, setMirrorIframeActive] = useState(false)
  const [scrollIframeActive, setScrollIframeActive] = useState(false)
  const [cameraLocked, setCameraLocked] = useState(true)
  const [clipboardMessage, setClipboardMessage] = useState("")

  useEffect(() => {
    if (activeSection === "aidatingcoach") {
      setMirrorIframeActive(true)
    } else {
      setMirrorIframeActive(false)
    }
  }, [activeSection])

  // const { initAudio, playSound, stopSound, updateListenerPosition, cleanup } =
  //   useMultiAudio()

  const getCameraPosition = section => {
    const isSmallScreen = window.innerWidth < SMALL_SCREEN_THRESHOLD
    const screenType = isSmallScreen ? "small" : "large"

    if (section === "default") {
      return cameraConfig.default[screenType]
    }

    return cameraConfig.sections[screenType][section]
  }

  // Fix the useEffect that handles section changes
  useEffect(() => {
    if (activeSection === "token" || activeSection === "atm") {
      setAtmiframeActive(true)
    } else {
      setAtmiframeActive(false)
    }

    if (activeSection === "aidatingcoach") {
      setMirrorIframeActive(true)
    } else {
      setMirrorIframeActive(false)
    }

    // Add this condition for ScrollIframe
    if (activeSection === "roadmap") {
      setScrollIframeActive(true)
    } else {
      setScrollIframeActive(false)
    }
  }, [activeSection])

  const playTransition = sectionName => {
    if (!controls.current) return

    // Se a câmera estiver destravada, não fazemos nada
    if (!cameraLocked) return

    controls.current.enabled = true

    const targetPosition = getCameraPosition(
      sectionName === "default" ? "default" : sectionName
    )

    if (targetPosition) {
      controls.current.setLookAt(...targetPosition, true).then(() => {
        // Habilita os controles apenas para a navegação principal
        controls.current.enabled = sectionName === "nav"
      })

      // updateListenerPosition(targetPosition.slice(0, 3))

      // if (sectionName !== "default") {
      //   playSound(sectionName)
      // } else {
      //   stopSound()
      // }
    }
  }

  // Function to copy camera position to clipboard
  const copyPositionToClipboard = () => {
    if (!controls.current) return

    try {
      // Get position and target from controls
      const position = controls.current.getPosition()
      const target = controls.current.getTarget()

      // Handle different possible return formats
      let posArray, targetArray

      // Handle position - might be Vector3, array, or object with x,y,z
      if (Array.isArray(position)) {
        posArray = position
      } else if (typeof position.toArray === "function") {
        posArray = position.toArray()
      } else {
        posArray = [position.x, position.y, position.z]
      }

      // Handle target - might be Vector3, array, or object with x,y,z
      if (Array.isArray(target)) {
        targetArray = target
      } else if (typeof target.toArray === "function") {
        targetArray = target.toArray()
      } else {
        targetArray = [target.x, target.y, target.z]
      }

      // Combine into the format needed for the camera config
      const positionArray = [...posArray, ...targetArray]

      // Format the array for display and copy
      const formattedArray = positionArray
        .map(val => Number(val).toFixed(15))
        .join(", ")

      // Also create a formatted JS array for console
      const jsArrayFormat = `[\n  ${posArray
        .map(val => Number(val).toFixed(15))
        .join(",\n  ")},\n  ${targetArray
        .map(val => Number(val).toFixed(15))
        .join(",\n  ")}\n]`

      // Copy to clipboard
      navigator.clipboard
        .writeText(formattedArray)
        .then(() => {
          setClipboardMessage("Position copied to clipboard!")

          // Clear message after 3 seconds
          setTimeout(() => {
            setClipboardMessage("")
          }, 3000)
        })
        .catch(err => {
          console.error("Could not copy position to clipboard:", err)
          setClipboardMessage("Failed to copy position.")

          // Clear message after 3 seconds
          setTimeout(() => {
            setClipboardMessage("")
          }, 3000)
        })

      // Log to console in different formats for reference
      console.log("Camera raw position:", position)
      console.log("Camera raw target:", target)
      console.log("Camera position array:", positionArray)
      console.log("Camera position formatted for config:", jsArrayFormat)
    } catch (error) {
      console.error("Error getting camera position:", error)
      setClipboardMessage("Error getting camera position")

      setTimeout(() => {
        setClipboardMessage("")
      }, 3000)
    }
  }

  // Efeito de inicialização
  useEffect(() => {
    if (!controls.current) return

    window.controls = controls
    // initAudio()

    // Configuração inicial
    if (cameraLocked) {
      controls.current.minPolarAngle = Math.PI * 0.4
      controls.current.maxPolarAngle = Math.PI * 0.5
      controls.current.minDistance = 5
      controls.current.maxDistance = 20
      controls.current.boundaryFriction = 1
      controls.current.boundaryEnclosesCamera = true
      controls.current.dollyToCursor = false
      controls.current.minY = 1
      controls.current.maxY = 15

      const defaultPosition = getCameraPosition("default")
      controls.current.setLookAt(...defaultPosition, false)

      setTimeout(() => {
        playTransition("nav")
      }, TRANSITION_DELAY)
    }

    // return cleanup
  }, [])

  // Handle active section changes
  useEffect(() => {
    if (activeSection && cameraLocked) {
      playTransition(activeSection)
    }
  }, [activeSection, cameraLocked])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (controls.current && activeSection && cameraLocked) {
        const newPosition = getCameraPosition(activeSection)
        controls.current.setLookAt(...newPosition, true)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [activeSection, cameraLocked])

  // Debug controls e toggle de câmera
  useControls(
    "Controls",
    {
      cameraLocked: {
        value: cameraLocked,
        label: "Lock Camera",
        onChange: locked => {
          setCameraLocked(locked)

          if (!controls.current) return

          if (locked) {
            // Quando travada, aplicar restrições
            controls.current.minPolarAngle = Math.PI * 0.4
            controls.current.maxPolarAngle = Math.PI * 0.5
            controls.current.minDistance = 5
            controls.current.maxDistance = 20
            controls.current.boundaryFriction = 1
            controls.current.boundaryEnclosesCamera = true
            controls.current.dollyToCursor = false
            controls.current.minY = 1
            controls.current.maxY = 15

            // Retornar para a posição da seção atual
            const targetPosition = getCameraPosition(activeSection || "nav")
            if (targetPosition) {
              controls.current.setLookAt(...targetPosition, true)
            }

            // Desabilitar controle contínuo
            controls.current.enabled = activeSection === "nav"
          } else {
            // Quando destravada, remover todas as restrições
            controls.current.minPolarAngle = 0
            controls.current.maxPolarAngle = Math.PI
            controls.current.minDistance = 0.1
            controls.current.maxDistance = 100
            controls.current.boundaryFriction = 0
            controls.current.boundaryEnclosesCamera = false
            controls.current.minY = null
            controls.current.maxY = null

            // Habilitar controle contínuo
            controls.current.enabled = true
          }
        },
      },
      getLookAt: button(() => {
        copyPositionToClipboard()
      }),
      resetCamera: button(() => {
        if (!controls.current) return

        const targetPosition = getCameraPosition(activeSection || "nav")
        if (targetPosition) {
          controls.current.setLookAt(...targetPosition, true)
        }
      }),
    },
    { collapsed: false }
  )

  // Configuração de controles de mouse
  // useEffect(() => {
  //   if (!controls.current) return

  //   // Configuração principal
  //   controls.current.mouseButtons.left = 1 // ROTATE com botão esquerdo
  //   controls.current.mouseButtons.right = 4 // TRUCK (mover) com botão direito
  //   controls.current.verticalDragToForward = false // Desativa o zoom ao arrastar verticalmente

  //   // Event listeners para Ctrl+MouseLeft
  //   // const handleKeyDown = event => {
  //   //   if (event.ctrlKey && controls.current) {
  //   //     controls.current._mouseButtons.left = 4 // TRUCK com Ctrl+MouseLeft
  //   //   }
  //   }

  //   // const handleKeyUp = event => {
  //   //   if (event.key === "Control" && controls.current) {
  //   //     controls.current._mouseButtons.left = 1 // Volta para ROTATE quando solta Ctrl
  //   //   }
  //   // }

  //   window.addEventListener("keydown", handleKeyDown)
  //   window.addEventListener("keyup", handleKeyUp)

  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown)
  //     window.removeEventListener("keyup", handleKeyUp)
  //   }
  // }, [])

  // Create notification element outside the 3D canvas
  useEffect(() => {
    if (clipboardMessage) {
      // Create and append notification element
      const notification = document.createElement("div")
      notification.style.position = "absolute"
      notification.style.top = "10px"
      notification.style.right = "10px"
      notification.style.padding = "8px 12px"
      notification.style.backgroundColor = "rgba(0, 0, 0, 0.7)"
      notification.style.color = "white"
      notification.style.borderRadius = "4px"
      notification.style.zIndex = "1000"
      notification.style.fontFamily = "sans-serif"
      notification.style.fontSize = "14px"
      notification.style.transition = "opacity 0.3s ease"
      notification.style.opacity = "0"
      notification.textContent = clipboardMessage

      document.body.appendChild(notification)

      // Fade in
      setTimeout(() => {
        notification.style.opacity = "1"
      }, 10)

      // Remove after timeout
      setTimeout(() => {
        notification.style.opacity = "0"
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 300)
      }, 3000)

      // Cleanup on unmount
      return () => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }
    }
  }, [clipboardMessage])
  // Adicione os controles de materiais usando useControls do Leva
  // Adicione os controles de materiais usando useControls do Leva
  const materialControls = useControls(
    "Materials",
    {
      // Castle controls
      castleMaterialType: {
        options: ["standard", "physical", "basic", "lambert", "phong"],
        value: "standard",
        label: "Castle Material Type",
      },
      castleMetalness: {
        value: 1.32,
        min: 0,
        max: 2,
        step: 0.01,
        label: "Castle Metalness",
      },
      castleRoughness: {
        value: 1.45,
        min: 0,
        max: 2,
        step: 0.01,
        label: "Castle Roughness",
      },

      // Floor controls
      floorMaterialType: {
        options: ["standard", "physical", "basic", "lambert", "phong"],
        value: "physical",
        label: "Floor Material Type",
      },
      floorMetalness: {
        value: 1.32,
        min: 0,
        max: 2,
        step: 0.01,
        label: "Floor Metalness",
      },
      floorRoughness: {
        value: 1.45,
        min: 0,
        max: 2,
        step: 0.01,
        label: "Floor Roughness",
      },
      floorHeartMetalness: {
        value: 1,
        min: 0,
        max: 2,
        step: 0.01,
        label: "Floor Heart Metalness",
      },
      floorHeartRoughness: {
        value: 0.2,
        min: 0,
        max: 2,
        step: 0.01,
        label: "Floor Heart Roughness",
      },
      floorHeartEmissiveIntensity: {
        value: 1.5,
        min: 0,
        max: 5,
        step: 0.1,
        label: "Floor Heart Emissive",
      },
      floorHeartEmissiveColor: {
        value: "#fff",
        label: "Floor Heart Color",
      },
    },
    { collapsed: false }
  )
  return (
    <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <CameraControls
        ref={controls}
        makeDefault
        smoothTime={0.6}
        dollySpeed={0.1}
        wheelDampingFactor={0.15}
        truckSpeed={1.0}
        verticalDragToForward={false}
        dollyToCursor={false}
      />

      <Suspense>
        <CastleModel
          onCastleClick={playTransition}
          atmIframeActive={atmiframeActive}
          mirrorIframeActive={mirrorIframeActive}
          scrollIframeActive={scrollIframeActive}
          hasInteracted={true}
          castleMaterialType={materialControls.castleMaterialType}
          castleMetalness={materialControls.castleMetalness}
          castleRoughness={materialControls.castleRoughness}
          castleEmissiveIntensity={materialControls.castleEmissiveIntensity}
          floorMaterialType={materialControls.floorMaterialType}
          floorMetalness={materialControls.floorMetalness}
          floorRoughness={materialControls.floorRoughness}
          floorEmissiveIntensity={materialControls.floorEmissiveIntensity}
          floorHeartMetalness={materialControls.floorHeartMetalness}
          floorHeartRoughness={materialControls.floorHeartRoughness}
          floorHeartEmissiveIntensity={
            materialControls.floorHeartEmissiveIntensity
          }
          floorHeartEmissiveColor={materialControls.floorHeartEmissiveColor}
        />
      </Suspense>
    </group>
  )
}

export default Castle

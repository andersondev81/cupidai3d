import { CameraControls, useGLTF, useTexture } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Select } from "@react-three/postprocessing"
import { button, useControls } from "leva"
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react"
import * as THREE from "three"
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
import FountainParticles from "../../components/FountainParticles"
import RotateAxis from "../../components/helpers/RotateAxis"
import AtmIframe from "../models/AtmIframe"
import MirrorIframe from "../models/MirrorIframe"
import ScrollIframe from "../models/ScrolIframe"

import audioManager from "./AudioManager"
const SMALL_SCREEN_THRESHOLD = 768
const TRANSITION_DELAY = 100
window.lastClickedPosition = null

function smoothCameraReturn(position, target) {
  if (!window.controls || !window.controls.current) {
    console.error("No controls available for camera transition")
    return
  }

  console.log("Smooth transition to position:", position, "target:", target)

  window.controls.current.enabled = true

  setTimeout(() => {
    window.controls.current
      .setLookAt(
        position[0],
        position[1],
        position[2],
        target[0],
        target[1],
        target[2],
        true // true enables animation
      )
      .catch(err => console.error("Camera transition error:", err))
  }, 50)
}
window.lastClickedPositions = {
  mirror: null,
  atm: null,
  scroll: null,
  orb: null,
}

window.smoothCameraReturn = function (position, target) {
  if (!window.controls || !window.controls.current) {
    console.error("No controls available for camera transition")
    return
  }

  console.log("Smooth transition to position:", position, "target:", target)

  window.controls.current.enabled = true // Important - enable controls first

  setTimeout(() => {
    // Use the exact same method used for section transitions
    window.controls.current
      .setLookAt(
        position[0],
        position[1],
        position[2],
        target[0],
        target[1],
        target[2],
        true // true enables animation
      )
      .catch(err => console.error("Camera transition error:", err))
  }, 50)
}

// Estenda o sistema de navegação para lidar com o Orb também
if (window.navigationSystem) {
  const origClearPositions = window.navigationSystem.clearPositions
  window.navigationSystem.clearPositions = function () {
    // Chame a função original
    if (origClearPositions) origClearPositions()

    // Limpe o array global também
    window.lastClickedPositions = {
      mirror: null,
      atm: null,
      scroll: null,
      orb: null,
    }
    console.log("Cleared all stored positions")
  }

  // Adicione função de limpeza para elementos individuais se ainda não existir
  if (!window.navigationSystem.clearPositionForElement) {
    window.navigationSystem.clearPositionForElement = function (elementId) {
      if (
        window.lastClickedPositions &&
        window.lastClickedPositions[elementId]
      ) {
        delete window.lastClickedPositions[elementId]
        console.log(`Cleared position for ${elementId}`)
      }
    }
  }
}

const NavigationSystem = {
  // Store camera positions for each navigation element
  positions: {},
  // NEW: Track navigation sources
  navigationSources: {},

  // Initialize the system
  init: () => {
    window.navigationSystem = {
      // Store position for any interactive element
      storePosition: (elementId, position, target) => {
        NavigationSystem.positions[elementId] = { position, target }
        console.log(
          `Stored camera position for ${elementId}:`,
          NavigationSystem.positions[elementId]
        )
      },

      // NEW: Track navigation source
      setNavigationSource: (elementId, source) => {
        NavigationSystem.navigationSources[elementId] = source
        console.log(`Set navigation source for ${elementId} to ${source}`)
      },

      // NEW: Get navigation source
      getNavigationSource: elementId => {
        return NavigationSystem.navigationSources[elementId] || "direct"
      },

      // Retrieve position for any element
      getPosition: elementId => {
        return NavigationSystem.positions[elementId]
      },

      // Clear stored positions
      clearPositions: () => {
        NavigationSystem.positions = {}
        // NEW: Also clear navigation sources
        NavigationSystem.navigationSources = {}
      },

      // Clear position for a specific element
      clearPositionForElement: elementId => {
        if (NavigationSystem.positions[elementId]) {
          delete NavigationSystem.positions[elementId]
          console.log(`Cleared position for ${elementId}`)
        }
        // NEW: Also clear navigation source
        if (NavigationSystem.navigationSources[elementId]) {
          delete NavigationSystem.navigationSources[elementId]
          console.log(`Cleared navigation source for ${elementId}`)
        }
      },

      // Handle return navigation
      returnToPosition: (elementId, defaultAction) => {
        const storedPosition = NavigationSystem.positions[elementId]
        const source = NavigationSystem.navigationSources[elementId] || "direct"

        console.log(`Return navigation for ${elementId}, source: ${source}`)

        // If source is pole, we should return to the pole section
        if (source === "pole") {
          console.log("Source is pole, returning to nav section")
          if (window.globalNavigation && window.globalNavigation.navigateTo) {
            window.globalNavigation.navigateTo("nav")
            return true
          }
        }

        // Otherwise return to the stored camera position
        if (storedPosition && source === "direct") {
          const { position, target } = storedPosition
          if (window.controls && window.controls.current) {
            console.log(`Returning to stored position for ${elementId}`)
            // Return camera to stored position
            window.controls.current
              .setLookAt(
                position[0],
                position[1],
                position[2],
                target[0],
                target[1],
                target[2],
                true
              )
              .catch(err => console.error("Camera transition error:", err))
            return true
          }
        }

        // If no stored position or error, use default action
        defaultAction()
        return false
      },
    }
  },

  // Create handlers for interactive elements
  createElementHandlers: (elementId, navigateTo, setActive, isActive) => {
    const handleElementClick = e => {
      e.stopPropagation()

      // Prevent navigation if already active
      if (isActive) return

      // Store current camera position before navigating
      if (window.controls && window.controls.current) {
        try {
          const position = window.controls.current.getPosition()
          const target = window.controls.current.getTarget()

          // Convert to arrays for consistent format
          const posArray = Array.isArray(position)
            ? position
            : [position.x, position.y, position.z]
          const targetArray = Array.isArray(target)
            ? target
            : [target.x, target.y, target.z]

          // Store position
          window.navigationSystem.storePosition(
            elementId,
            posArray,
            targetArray
          )

          // NEW: Set navigation source to 'direct' for direct clicks
          window.navigationSystem.setNavigationSource(elementId, "direct")
        } catch (err) {
          console.error(
            `Failed to store camera position for ${elementId}:`,
            err
          )
        }
      }

      // Navigate to target section
      navigateTo()
    }

    const handleElementPointerEnter = e => {
      if (isActive) return
      e.stopPropagation()
      document.body.style.cursor = "pointer"
    }

    const handleElementPointerLeave = e => {
      e.stopPropagation()
      document.body.style.cursor = "default"
    }

    return {
      handleClick: handleElementClick,
      pointerHandlers: {
        onPointerEnter: handleElementPointerEnter,
        onPointerLeave: handleElementPointerLeave,
      },
    }
  },
}

// Initialize the navigation system when the module loads
NavigationSystem.init()

window.globalNavigation = {
  navigateTo: null,
  lastSection: "nav",
  sectionIndices: {
    nav: 0,
    about: 1,
    aidatingcoach: 2,
    download: 3,
    token: 4,
    roadmap: 5,
  },
  reset: function () {
    if (window.resetIframes) {
      window.resetIframes()
    }
  },
  log: function (message) {
    console.log(`[Navigation] ${message}`)
  },
}

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
  metalness = 1,
  roughness = 1.6,
  emissiveIntensity = 0,
  emissiveColor = "#000"
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

    // Propriedades específicas para materiais que suportam PBR
    const pbrProps = {
      ...commonProps,
      roughnessMap: textures.roughnessMap,
      roughness: roughness,
      metalness: metalness,
      emissiveMap: textures.emissiveMap,
      emissive: new Color(emissiveColor),
      emissiveIntensity: emissiveIntensity,
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
  }, [
    textures,
    materialType,
    metalness,
    roughness,
    emissiveIntensity,
    emissiveColor,
    clouds, // Adicionado clouds como dependência
  ])
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
  metalness = 1,
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

const useCastleWallsMaterial = (
  materialType = "standard",
  metalness = 0,
  roughness = 0.3
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
  metalness = 0,
  roughness = 1
) => {
  const textures = useTexture({
    map: "/texture/castlePilars_Base_color.webp",
    roughnessMap: "/texture/castlePilars_Roughness.webp",
    metalnessMap: "/texture/castlePilars_Metallic.webp",
    emissiveMap: "/texture/castlePilars_Emissive.webp",
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
      metalnessMap: textures.metalnessMap,
      emissiveMap: textures.emissiveMap,
      emissive: new Color(0xffffff), // Cor base para a emissão
      emissiveIntensity: 2.0, // Intensidade da emissão
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
// Floor Material
const useFloorMaterial = (
  materialType = "physical", // "standard", "physical", ou "basic"
  metalness = 0,
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

const handleAtmClick = e => {
  e.stopPropagation()

  // Prevent navigation if ATM iframe is already active
  if (atmIframeActive) return

  // Navigate to token section
  if (onCastleClick) {
    onCastleClick("token") // Uses the existing playTransition function
  }

  // Log for debugging
  if (window.globalNavigation && window.globalNavigation.log) {
    window.globalNavigation.log("ATM mesh clicked - navigation requested")
  }
}

// Pointer event handlers for visual feedback
const handlePointerEnter = e => {
  if (atmIframeActive) return // Skip if iframe is already active
  e.stopPropagation()
  document.body.style.cursor = "pointer"
}

const handlePointerLeave = e => {
  e.stopPropagation()
  document.body.style.cursor = "default"
}

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
  setAtmiframeActive,
  setMirrorIframeActive,
  setScrollIframeActive,
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
  const floorHeart = useFloorHeartMaterial()
  const logoMaterial = useLogoMaterial()
  const decorMaterial = useDecorMaterial()
  const godsMaterial = useGodsMaterial()
  const hoofMaterial = useHoofMaterial()
  const atmMaterial = useAtmMaterial()
  const scrollMaterial = useScrollMaterial()
  const portal = usePortalMaterial()
  const mirror = useMirrorMaterial()
  const hallosMaterial = useHallosMaterial()

  useFrame(({ camera }) => {
    // Chamar updateSpatialSounds com a posição da câmera a cada frame
    updateSpatialSounds(camera.position)
  })

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

  const mirrorHandlers = NavigationSystem.createElementHandlers(
    "mirror",
    () => onCastleClick("aidatingcoach"),
    setMirrorIframeActive,
    mirrorIframeActive
  )

  const atmHandlers = NavigationSystem.createElementHandlers(
    "atm",
    () => onCastleClick("token"),
    setAtmiframeActive,
    atmIframeActive
  )

  const scrollHandlers = NavigationSystem.createElementHandlers(
    "scroll",
    () => onCastleClick("roadmap"),
    setScrollIframeActive,
    scrollIframeActive
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

  const updateSpatialSounds = cameraPosition => {
    // Verificações de segurança para o AudioManager
    if (!window.audioManager || !window.audioManager.sounds) {
      console.log("AudioManager não disponível")
      return
    }

    // Coordenadas fixas dos elementos
    const orbPosition = { x: 1.76, y: 1.155, z: -0.883 }
    const fountainPosition = { x: 0, y: 0.8, z: 2.406 } // Posição da fonte

    //----- GERENCIAMENTO DO SOM DA ORB -----//

    // Cálculo de distância para o orb
    const dxOrb = cameraPosition.x - orbPosition.x
    const dyOrb = cameraPosition.y - orbPosition.y
    const dzOrb = cameraPosition.z - orbPosition.z
    const distToOrb = Math.sqrt(dxOrb * dxOrb + dyOrb * dyOrb + dzOrb * dzOrb)

    // Distância máxima para o orb
    const maxOrbDistance = 1.5

    // Gerenciar som do orb
    if (window.audioManager.sounds.orb) {
      if (distToOrb < maxOrbDistance) {
        // Cálculo de volume para o orb
        const attenuationOrb = 1 - Math.pow(distToOrb / maxOrbDistance, 3)
        const orbVolume = Math.max(0, 0.2 * attenuationOrb)

        if (orbVolume > 0.05) {
          window.audioManager.sounds.orb.audio.volume = orbVolume

          if (!window.audioManager.sounds.orb.isPlaying) {
            console.log("Iniciando som da orb")
            window.audioManager.play("orb")
          }
        } else {
          if (window.audioManager.sounds.orb.isPlaying) {
            window.audioManager.stop("orb")
          }
        }
      } else {
        if (window.audioManager.sounds.orb.isPlaying) {
          window.audioManager.stop("orb")
        }
      }
    }

    //----- GERENCIAMENTO DO SOM DA FONTE (FOUNTAIN) -----//

    // Cálculo de distância para a fonte
    const dxFountain = cameraPosition.x - fountainPosition.x
    const dyFountain = cameraPosition.y - fountainPosition.y
    const dzFountain = cameraPosition.z - fountainPosition.z
    const distToFountain = Math.sqrt(
      dxFountain * dxFountain +
        dyFountain * dyFountain +
        dzFountain * dzFountain
    )

    // Distância máxima para a fonte (um pouco maior que a do orb)
    const maxFountainDistance = 2.5

    // Gerenciar som da fonte
    if (window.audioManager.sounds.fountain) {
      // Verificar se está dentro do alcance
      if (distToFountain < maxFountainDistance) {
        // Atenuação quadrática para a fonte (menos intensa que a cúbica do orb)
        const attenuationFountain =
          1 - Math.pow(distToFountain / maxFountainDistance, 2)
        const fountainVolume = Math.max(0, 0.3 * attenuationFountain)

        // Log para debug
        // console.log(`Distância até a fonte: ${distToFountain.toFixed(2)}, Volume: ${fountainVolume.toFixed(2)}`);

        // Aplicar volume apenas se for significativo
        if (fountainVolume > 0.03) {
          window.audioManager.sounds.fountain.audio.volume = fountainVolume

          // Iniciar reprodução se não estiver tocando
          if (!window.audioManager.sounds.fountain.isPlaying) {
            console.log("Iniciando som da fonte")
            window.audioManager.play("fountain")
          }
        } else {
          // Volume muito baixo, parar o som
          if (window.audioManager.sounds.fountain.isPlaying) {
            window.audioManager.stop("fountain")
          }
        }
      } else {
        // Fora do alcance, parar o som
        if (window.audioManager.sounds.fountain.isPlaying) {
          console.log("Parando som da fonte - fora de alcance")
          window.audioManager.stop("fountain")
        }
      }
    }
  }

  // Adicione ou atualize o useEffect para garantir que tanto o som do orb quanto
  // o da fonte começam parados
  useEffect(() => {
    // Garantir que os sons começam parados
    if (window.audioManager && window.audioManager.sounds) {
      if (window.audioManager.sounds.orb) {
        window.audioManager.stop("orb")
      }
      if (window.audioManager.sounds.fountain) {
        window.audioManager.stop("fountain")
      }
    }

    // Limpar ao desmontar
    return () => {
      if (window.audioManager && window.audioManager.sounds) {
        if (window.audioManager.sounds.orb) {
          window.audioManager.stop("orb")
        }
        if (window.audioManager.sounds.fountain) {
          window.audioManager.stop("fountain")
        }
      }
    }
  }, [])

  // Adicione este hook useFrame no componente CastleModel
  // IMPORTANTE: Certifique-se de que este é o ÚNICO useFrame que chama updateSpatialSounds!
  useFrame(({ camera }) => {
    // Chamar a função de atualização de som a cada frame
    updateSpatialSounds(camera.position)
  })

  // // Adicione isto no useEffect do CastleModel para garantir que o som sempre começa parado
  // useEffect(() => {
  //   // Garantir que o som da orb começa parado
  //   if (window.audioManager && window.audioManager.sounds && window.audioManager.sounds.orb) {
  //     window.audioManager.stop('orb');
  //   }

  //   // Limpar ao desmontar
  //   return () => {
  //     if (window.audioManager && window.audioManager.sounds && window.audioManager.sounds.orb) {
  //       window.audioManager.stop('orb');
  //     }
  //   };
  // }, []);

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
      <mesh
        geometry={nodes.Mirror.geometry}
        material={mirror}
        onClick={mirrorHandlers.handleClick}
        {...mirrorHandlers.pointerHandlers}
      />
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
        onClick={atmHandlers.handleClick}
        {...atmHandlers.pointerHandlers}
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
        onClick={scrollHandlers.handleClick}
        {...scrollHandlers.pointerHandlers}
      />
      <Select disabled>
        <mesh
          geometry={nodes.HeartVid.geometry}
          material={portalMaterial}
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
      // Fix for the iframes in CastleModel component // For the AtmIframe
      component:
      <AtmIframe
        position={[1.675, 1.185, 0.86]}
        rotation={[1.47, 0.194, -1.088]}
        onReturnToMain={source => {
          // Close the iframe first for better visual feedback
          setAtmiframeActive(false)

          // Short delay to let the UI update first
          setTimeout(() => {
            if (source === "pole") {
              // If coming from pole, go back to nav section
              console.log("ATM: Source is pole, returning to nav")
              onCastleClick("nav")
            } else {
              // Check for stored position and use it if available
              const storedPosition = window.navigationSystem.getPosition("atm")
              if (storedPosition) {
                const { position, target } = storedPosition
                smoothCameraReturn(position, target)
                console.log("Returning to stored ATM position")
              } else {
                // Fallback to nav if no stored position
                console.log("No stored position for ATM, going to nav")
                onCastleClick("nav")
              }
            }
          }, 100)
        }}
        isActive={atmIframeActive}
      />
      // For the MirrorIframe component:
      <MirrorIframe
        onReturnToMain={source => {
          // Close the iframe first
          setMirrorIframeActive(false)

          // Return to stored position or nav
          setTimeout(() => {
            if (source === "pole") {
              // If coming from pole, go back to nav section
              console.log("Mirror: Source is pole, returning to nav")
              onCastleClick("nav")
            } else {
              const storedPosition =
                window.navigationSystem.getPosition("mirror")
              if (storedPosition) {
                const { position, target } = storedPosition
                smoothCameraReturn(position, target)
                console.log("Returning to stored Mirror position")
              } else {
                // Fallback to nav if no stored position
                console.log("No stored position for Mirror, going to nav")
                onCastleClick("nav")
              }
            }
          }, 100)
        }}
        isActive={mirrorIframeActive}
      />
      // For the ScrollIframe component:
      <ScrollIframe
        onReturnToMain={source => {
          // Close the iframe first
          setScrollIframeActive(false)

          // Return to stored position or nav
          setTimeout(() => {
            if (source === "pole") {
              // If coming from pole, go back to nav section
              console.log("Scroll: Source is pole, returning to nav")
              onCastleClick("nav")
            } else {
              const storedPosition =
                window.navigationSystem.getPosition("scroll")
              if (storedPosition) {
                const { position, target } = storedPosition
                smoothCameraReturn(position, target)
                console.log("Returning to stored Scroll position")
              } else {
                // Fallback to nav if no stored position
                console.log("No stored position for Scroll, going to nav")
                onCastleClick("nav")
              }
            }
          }, 100)
        }}
        isActive={scrollIframeActive}
      />
    </group>
  )
}
// Main Component
// Main Component
// Navigation system to handle all interactive elements

const Castle = ({ activeSection }) => {
  const controls = useRef()
  const [atmiframeActive, setAtmiframeActive] = useState(false)
  const [mirrorIframeActive, setMirrorIframeActive] = useState(false)
  const [scrollIframeActive, setScrollIframeActive] = useState(false)
  const [cameraLocked, setCameraLocked] = useState(true)
  const [clipboardMessage, setClipboardMessage] = useState("")

  // Reset function for iframes
  window.resetIframes = () => {
    setAtmiframeActive(false)
    setMirrorIframeActive(false)
    setScrollIframeActive(false)
  }

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

    // if (window.audioManager) {
    //   console.log("Starting ambient sound from Castle component");
    //   window.audioManager.startAmbient();
    // }

    console.log(`Playing transition to section: ${sectionName}`)

    // Parar sons da seção anterior
    if (activeSection && activeSection !== sectionName) {
      audioManager.stopSectionSounds(activeSection)
    }

    // Reproduzir o som da transição
    audioManager.play("transition")

    // Após um pequeno atraso, reproduzir o som da nova seção
    setTimeout(() => {
      // Reproduzir o som específico da seção, se existir
      if (audioManager.sounds[sectionName]) {
        audioManager.play(sectionName)
      }

      // Reproduzir sons adicionais específicos para certas seções
      switch (sectionName) {
        case "aidatingcoach":
          // Som do espelho
          if (audioManager.sounds["mirror"]) {
            audioManager.play("mirror")
          }
          break
        case "token":
          // Som do ATM/moedas
          if (audioManager.sounds["atm"]) {
            audioManager.play("atm")
          }
          if (audioManager.sounds["coins"]) {
            audioManager.play("coins")
          }
          break
        case "roadmap":
          // Som do pergaminho/papel
          if (audioManager.sounds["scroll"]) {
            audioManager.play("scroll")
          }
          if (audioManager.sounds["paper"]) {
            audioManager.play("paper")
          }
          break
      }
    }, 300) // Pequeno atraso para não sobrepor o som de transição

    // Update iframe active states based on section
    if (sectionName === "roadmap") {
      setScrollIframeActive(true)
      setAtmiframeActive(false)
      setMirrorIframeActive(false)
    } else if (sectionName === "token" || sectionName === "atm") {
      setAtmiframeActive(true)
      setScrollIframeActive(false)
      setMirrorIframeActive(false)
    } else if (sectionName === "aidatingcoach") {
      setMirrorIframeActive(true)
      setScrollIframeActive(false)
      setAtmiframeActive(false)
    } else {
      setScrollIframeActive(false)
      setAtmiframeActive(false)
      setMirrorIframeActive(false)
    }

    controls.current.enabled = true

    const targetPosition = getCameraPosition(
      sectionName === "default" ? "default" : sectionName
    )

    if (targetPosition) {
      controls.current
        .setLookAt(...targetPosition, true)
        .catch(error => {
          console.error("Camera transition error:", error)
        })
        .finally(() => {
          controls.current.enabled = sectionName === "nav"
          // console.log(`Transition to ${sectionName} complete`)
        })
    }
  }

  useEffect(() => {
    // Iniciar áudio ambiente quando o componente é montado
    audioManager.startAmbient()

    // Pré-carregar todos os sons para melhor performance
    audioManager.preloadAll()

    return () => {
      // Parar todo áudio quando o componente é desmontado
      audioManager.stopAmbient()
    }
  }, [])

  // Make the transition function available globally
  window.globalNavigation.navigateTo = playTransition

  const handleReturnToMain = () => {
    console.log("Back to main requested")
    playTransition("nav")
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

  // Make controls globally available
  useEffect(() => {
    if (!controls.current) return
    window.controls = controls

    // Initial configuration
    if (cameraLocked) {
      controls.current.minPolarAngle = Math.PI * 0.4
      controls.current.maxPolarAngle = Math.PI * 0.5
      controls.current.minDistance = 5
      controls.current.maxDistance = 10
      controls.current.boundaryFriction = 1
      controls.current.boundaryEnclosesCamera = true
      controls.current.dollyToCursor = false
      controls.current.minY = 1
      controls.current.maxY = 15

      const defaultPosition = getCameraPosition("default")
      controls.current.setLookAt(...defaultPosition, false)

      // Use direct navigation function
      setTimeout(() => {
        playTransition("nav")
      }, TRANSITION_DELAY)
    }

    return () => {
      // Cleanup
      delete window.controls
    }
  }, [])

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
            controls.current.minDistance = 5.08
            controls.current.maxDistance = 10
            controls.current.boundaryFriction = 1
            controls.current.boundaryEnclosesCamera = true
            controls.current.dollyToCursor = false
            controls.current.minY = 1
            controls.current.maxY = 5

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

  useEffect(() => {
    if (!controls.current || !controls.current.mouseButtons) return

    controls.current.mouseButtons.left = 1
    controls.current.mouseButtons.right = 4 // Truck (move) with right button
    controls.current.verticalDragToForward = false // Disable zoom on vertical drag

    // Handle Ctrl+Click safely
    const handleKeyDown = event => {
      if (event.ctrlKey && controls.current && controls.current.mouseButtons) {
        controls.current.mouseButtons.left = 4 // Truck with Ctrl+MouseLeft
      }
    }

    const handleKeyUp = event => {
      if (
        event.key === "Control" &&
        controls.current &&
        controls.current.mouseButtons
      ) {
        controls.current.mouseButtons.left = 1 // Back to ROTATE when Ctrl is released
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

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
        value: 1,
        min: 0,
        max: 2,
        step: 0.01,
        label: "Castle Metalness",
      },
      castleRoughness: {
        value: 1.6,
        min: 0,
        max: 2,
        step: 0.01,
        label: "Castle Roughness",
      },
      castleEmissiveColor: {
        value: "#f6d8fc",
        label: "Castle Emissive Color",
      },
      castleEmissiveIntensity: {
        value: 2,
        min: 0,
        max: 5,
        step: 0.1,
        label: "Castle Emissive",
      },

      // Floor controls
      floorMaterialType: {
        options: ["standard", "physical", "basic", "lambert", "phong"],
        value: "physical",
        label: "Floor Material Type",
      },
      floorMetalness: {
        value: 1,
        min: 0,
        max: 2,
        step: 0.01,
        label: "Floor Metalness",
      },
      floorRoughness: {
        value: 0.2,
        min: 0,
        max: 2,
        step: 0.01,
        label: "Floor Roughness",
      },
      floorEmissiveColor: {
        value: "#22bcff",
        label: "Floor Emissive Color",
      },
      floorEmissiveIntensity: {
        value: 2.2,
        min: 0,
        max: 5,
        step: 0.1,
        label: "Floor Emissive",
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
          controls={controls}
          onCastleClick={playTransition}
          atmIframeActive={atmiframeActive}
          mirrorIframeActive={mirrorIframeActive}
          scrollIframeActive={scrollIframeActive}
          hasInteracted={true}
          onReturnToMain={handleReturnToMain}
          castleMaterialType={materialControls.castleMaterialType}
          castleMetalness={materialControls.castleMetalness}
          castleRoughness={materialControls.castleRoughness}
          castleEmissiveIntensity={materialControls.castleEmissiveIntensity}
          floorMaterialType={materialControls.floorMaterialType}
          floorMetalness={materialControls.floorMetalness}
          floorRoughness={materialControls.floorRoughness}
          floorEmissiveIntensity={materialControls.floorEmissiveIntensity}
          setAtmiframeActive={setAtmiframeActive}
          setMirrorIframeActive={setMirrorIframeActive}
          setScrollIframeActive={setScrollIframeActive}
        />
      </Suspense>
    </group>
  )
}

export default Castle

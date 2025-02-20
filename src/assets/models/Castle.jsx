import { CameraControls, useGLTF, useTexture } from "@react-three/drei"
import { button, monitor, useControls } from "leva"
import React, { Suspense, useEffect, useMemo, useRef } from "react"
import {
  Color,
  DoubleSide,
  LinearFilter,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  NearestFilter,
  NormalBlending,
  VideoTexture,
} from "three"
import Modeload from "../../components/helpers/Modeload"
import RotateAxis from "../../components/helpers/RotateAxis"
import FountainParticles from "../../components/FountainParticles"
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
        1.8294030001912027, 1.1241952974854004, -0.9268222253732308,
        0.1723786308639481, 1.0468291516427397, -0.08072363062511172,
      ],
      aidatingcoach: [
        -2.287522183512657, 1.1140207867811742, -1.087725967459512,
        -0.08872200461723317, 1.1076978075751573, -0.030188523722664052,
      ],
      download: [
        -2.323807878032301, 1.133672409983926, -1.128058355996892,
        -0.21384977642968192, 1.1774169642201746, -0.03185946113943251,
      ],
      token: [
        2.0799027767746923, 1.1492603137264552, 1.0627122850364636,
        -1.2102179925739383, 0.8585880494001786, -0.5986556331928229,
      ],
      roadmap: [
        -2.025201516379411, 1.0672926837870658, 1.0222135061686681,
        0.03299806883202455, 0.8587359231417601, -0.08269801064024146,
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
        -2.194447186898329, 1.1074291907861749, 1.1461923290680842,
        -0.3644950377073637, 0.9540178555386187, 0.18714237486758786,
      ],
    },
  },
}

// Custom Hooks
const useAudio = () => {
  const audioContext = useRef(null)
  const audioElement = useRef(null)
  const source = useRef(null)
  const panner = useRef(null)

  const initAudio = () => {
    audioElement.current = new Audio(AUDIO_FILE_PATH)
    audioElement.current.loop = true

    audioContext.current = new (window.AudioContext ||
      window.webkitAudioContext)()
    source.current = audioContext.current.createMediaElementSource(
      audioElement.current
    )
    panner.current = audioContext.current.createPanner()

    // Configure panner
    panner.current.panningModel = "HRTF"
    panner.current.distanceModel = "inverse"
    panner.current.refDistance = 1
    panner.current.maxDistance = 100
    panner.current.rolloffFactor = 1
    panner.current.setPosition(0, 0, 0)
    source.current.connect(panner.current)
    panner.current.connect(audioContext.current.destination)
  }

  const playSound = () => {
    if (audioContext.current?.state === "suspended") {
      audioContext.current.resume()
    }
    audioElement.current?.play()
  }

  const stopSound = () => {
    audioElement.current?.pause()
    if (audioElement.current) {
      audioElement.current.currentTime = 0
    }
  }

  const updateListenerPosition = position => {
    if (audioContext.current && position) {
      const [x, y, z] = position
      audioContext.current.listener.setPosition(x, y, z)
    }
  }

  const cleanup = () => {
    audioElement.current?.pause()
    audioContext.current?.close()
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
    map: "/texture/Castle_Color.webp",
    // normalMap: "/texture/Castle_Normal.webp",
    roughnessMap: "/texture/Castle_Roughness.webp",
    metalnessMap: "/texture/Castle_Metalness.webp",
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
        metalnessMap: textures.metalnessMap,
        transparent: false,
        alphaTest: 0.5,
        side: DoubleSide,
        blending: NormalBlending,
        roughness: 0.2,
        metalness: 0.7,
      }),
    [textures]
  )
}

// Gods Material
const useGodsMaterial = () => {
  const textures = useTexture({
    map: "/texture/gods_colors.webp",
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
    map: "/texture/HoofGlass_Color.webp",
    // alphaMap: "/texture/HoofGlass_Alpha.webp",
    // roughnessMap: "/texture/HoofGlass_Roughness.webp",
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
        opacity: 1,
        side: DoubleSide,
        blending: NormalBlending,
        // roughness: 0.2,
        // metalness: 0.1,
        transmission: 0.95,
        ior: 1.5,
        thickness: 0.5,
        envMapIntensity: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
      }),
    [textures]
  )
}

//atm Material
const useAtmMaterial = () => {
  const textures = useTexture({
    map: "/texture/atmBake.webp",
    // roughnessMap: "/texture/atmRoughness.webp",
    // metalnessMap: "/texture/atmMetalness.webp",
    // materialEmissive: "/texture/atmEmissive.webp",
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
        // roughnessMap: textures.roughnessMap,
        // metalnessMap: textures.metalnessMap,
        // emissive: new Color(0xffffff), // Adicionando cor base emissiva (branco)
        // emissiveMap: textures.materialEmissive,
        transparent: false,
        alphaTest: 0.5,
        side: DoubleSide,
        blending: NormalBlending,
        roughness: 0.2,
        metalness: 0.7,
        // emissiveIntensity: 3,
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

    return new MeshStandardMaterial({
      map: videoTexture,
      transparent: false,
      roughness: 0.4,
      metalness: 1,
      side: DoubleSide,
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
          />
        </RotateAxis>
      </group>
      <mesh
        geometry={nodes.scroll.geometry}
        material={scrollMaterial}
        position={[0, 0.648, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      <mesh
        geometry={nodes.heartVid.geometry}
        material={portal}
        position={[0, 1.698, 2.119]}
      />
      <mesh
        geometry={nodes.water.geometry}
        material={waterMaterial}
        position={[0, 0.704, 2.406]}
      />
      <FountainParticles
        count={80}
        color="lightpink"
        size={0.03}
        speed={0.65}
        spread={0.3}
      />
    </group>
  )
}

// Main Component
const Castle = ({ activeSection }) => {
  const controls = useRef()
  const { initAudio, playSound, stopSound, updateListenerPosition, cleanup } =
    useAudio()
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

    controls.current.enabled = true

    const targetPosition = getCameraPosition(
      sectionName === "default" ? "default" : sectionName
    )

    if (targetPosition) {
      controls.current.setLookAt(...targetPosition, true).then(() => {
        controls.current.enabled = sectionName === "nav"
      })

      updateListenerPosition(targetPosition.slice(0, 3))

      if (sectionName === "nav") {
        playSound()
      } else {
        stopSound()
      }
    }
  }

  // Initialize camera and audio
  useEffect(() => {
    if (!controls.current) return

    window.controls = controls
    initAudio()

    controls.current.minPolarAngle = Math.PI * 0.15
    controls.current.maxPolarAngle = Math.PI * 0.55
    controls.current.minDistance = 5
    controls.current.maxDistance = 20
    controls.current.boundaryFriction = 1
    controls.current.boundaryEnclosesCamera = true
    controls.current.verticalDragToForward = false
    controls.current.dollyToCursor = false
    controls.current.minY = 1
    controls.current.maxY = 15

    const defaultPosition = getCameraPosition("default")
    controls.current.setLookAt(...defaultPosition, false)

    setTimeout(() => {
      playTransition("nav")
    }, TRANSITION_DELAY)

    return cleanup
  }, [])

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
        minDistance={50}
        maxDistance={20}
        boundaryFriction={1}
        boundaryEnclosesCamera={true}
        verticalDragToForward={false}
        dollyToCursor={false}
        minY={1}
        maxY={15}
      />
      <Suspense fallback={<Modeload />}>
        <CastleModel onCastleClick={playTransition} />
      </Suspense>
    </group>
  )
}
useGLTF.preload("/models/Castle.glb")

export default Castle

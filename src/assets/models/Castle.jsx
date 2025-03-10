import { CameraControls, useGLTF, useTexture } from "@react-three/drei"
import { Select } from "@react-three/postprocessing"
import { button, monitor, useControls } from "leva"
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react"
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
  RepeatWrapping,
} from "three"
import FountainParticles from "../../components/FountainParticles"
import RotateAxis from "../../components/helpers/RotateAxis"

// Constants
const SMALL_SCREEN_THRESHOLD = 768
const TRANSITION_DELAY = 100

// Detectar iOS - mais confiável
const isIOS = () => {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  )
}

// Componente de tela inicial para iOS
const IOSStartScreen = ({ onStart }) => {
  return (
    <div
      className="ios-start-screen"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "black",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        color: "white",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Bem-vindo!</h2>
      <p
        style={{ marginBottom: "30px", textAlign: "center", padding: "0 20px" }}
      >
        Toque no botão abaixo para iniciar a experiência.
      </p>
      <button
        onClick={onStart}
        style={{
          backgroundColor: "#FA3C81",
          color: "white",
          border: "none",
          padding: "15px 30px",
          borderRadius: "5px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        Iniciar Experiência
      </button>
    </div>
  )
}

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

// Simplified video hook for iOS
const useVideoElement = src => {
  const videoRef = useRef(null)
  const [texture, setTexture] = useState(null)

  // Create video element only after user interaction
  const createVideo = () => {
    try {
      if (videoRef.current) return

      console.log("Creating video element for:", src)
      const video = document.createElement("video")
      video.playsInline = true
      video.muted = true
      video.loop = true
      video.crossOrigin = "anonymous"
      video.setAttribute("playsinline", "")
      video.setAttribute("webkit-playsinline", "")
      video.setAttribute("muted", "")
      video.src = src
      video.load()

      videoRef.current = video

      // Create texture once video is loaded
      video.addEventListener(
        "canplaythrough",
        () => {
          console.log("Video can play:", src)

          // Create texture
          const newTexture = new VideoTexture(video)
          newTexture.minFilter = LinearFilter
          newTexture.magFilter = LinearFilter
          newTexture.flipY = false
          setTexture(newTexture)

          // Try to play
          video.play().catch(error => {
            console.warn("Video play failed:", error)
          })
        },
        { once: true }
      )
    } catch (error) {
      console.error("Error creating video:", error)
    }
  }

  // Clean up
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.src = ""
        videoRef.current = null
      }
    }
  }, [])

  return { texture, createVideo }
}

// Materials textures -----------------------------

// Castle Material
const useCastleMaterial = () => {
  const textures = useTexture({
    map: "/texture/castleColor.webp",
    metalnessMap: "/texture/castleMetallic.webp",
    roughnessMap: "/texture/castleRoughness.webp",
    emissiveMap: "/texture/castleEmissive.webp",
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
        roughnessMap: textures.roughnessMap,
        metalnessMap: textures.metalnessMap,
        emissiveMap: textures.emissiveMap,
        emissive: new Color(0xf6d8ff),
        emissiveIntensity: 3.2,
        transparent: false,
        alphaTest: 0.05,
        side: DoubleSide,
        blending: NormalBlending,
        metalness: 1,
      }),
    [textures]
  )
}

// Floor Material
const useFloorMaterial = () => {
  const textures = useTexture({
    map: "/texture/FloorColorB.webp",
    roughnessMap: "/texture/floorRoughness.webp",
    metalnessMap: "/texture/floorMetallic.webp",
    materialEmissive: "/texture/floorEmissive.webp",
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
        roughnessMap: textures.roughnessMap,
        metalnessMap: textures.metalnessMap,
        emissiveMap: textures.materialEmissive,
        transparent: false,
        alphaTest: 0.05,
        side: DoubleSide,
        metalness: 1,
        blending: NormalBlending,
        emissive: new Color(0xf6d8ff),
        emissiveIntensity: 3.2,
      }),
    [textures]
  )
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
        roughness: 0.7,
        metalness: 0.0,
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

// Flowers Material
const useFlowersMaterial = () => {
  const textures = useTexture({
    map: "/texture/FlowersColor.webp",
    normalMap: "/texture/FlowersNormal.webp",
    alphaMap: "/texture/FlowersAlpha.webp",
  })

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = false
        texture.minFilter = texture.magFilter = NearestFilter
        texture.repeat.set(1, 1)
        texture.wrapS = texture.wrapT = RepeatWrapping
      }
    })
  }, [textures])

  return useMemo(
    () =>
      new MeshPhysicalMaterial({
        map: textures.map,
        normalMap: textures.normalMap,
        alphaMap: textures.alphaMap,
        transparent: true,
        opacity: 0.85,
        alphaTest: 0.1,
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
    map: "/texture/hoofGlassColorB.webp",
    emissiveMap: "/texture/hoofGlassEmissive.webp",
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
        emissive: new Color(0xffffff),
        emissiveIntensity: 2.5,
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
    map: "/texture/ScrollColor.webp",
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
}

// Components
const CastleModel = ({ hasInteracted }) => {
  const { nodes } = useGLTF("/models/Castle.glb")
  const material = useCastleMaterial()
  const logoMaterial = useLogoMaterial()
  const decorMaterial = useDecorMaterial()
  const flowersMaterial = useFlowersMaterial()
  const godsMaterial = useGodsMaterial()
  const floorMaterial = useFloorMaterial()
  const hoofMaterial = useHoofMaterial()
  const atmMaterial = useAtmMaterial()
  const scrollMaterial = useScrollMaterial()

  // Use the video hooks
  const portalVideo = useVideoElement("/video/tunel.mp4")
  const waterVideo = useVideoElement("/video/waterColor.mp4")

  // Portal material - fallback to black if video not loaded
  const portalMaterial = useMemo(
    () =>
      portalVideo.texture
        ? new MeshBasicMaterial({ map: portalVideo.texture, side: DoubleSide })
        : new MeshBasicMaterial({ color: 0x000000, side: DoubleSide }),
    [portalVideo.texture]
  )

  // Water material - fallback to blue if video not loaded
  const waterMaterial = useMemo(
    () =>
      waterVideo.texture
        ? new MeshPhysicalMaterial({
            map: waterVideo.texture,
            transparent: false,
            roughness: 0.2,
            metalness: 0,
            side: DoubleSide,
            emissive: new Color(0xffa6f3),
            emissiveIntensity: 2,
          })
        : new MeshPhysicalMaterial({
            color: 0x00a6f3,
            emissive: new Color(0xffa6f3),
            emissiveIntensity: 2,
            side: DoubleSide,
          }),
    [waterVideo.texture]
  )

  // Initialize videos after interaction
  useEffect(() => {
    if (hasInteracted) {
      console.log("User has interacted, creating videos")
      portalVideo.createVideo()
      waterVideo.createVideo()
    }
  }, [hasInteracted])

  const wingsMaterial = useWingsMaterial()

  return (
    <group dispose={null}>
      <mesh
        geometry={nodes.Castle.geometry}
        material={material}
        layers-enable={2}
        castShadow={false}
        receiveShadow={false}
      />
      <mesh geometry={nodes.wings.geometry} material={wingsMaterial} />
      <mesh geometry={nodes.gods.geometry} material={godsMaterial} />
      <mesh geometry={nodes.Flowers.geometry} material={flowersMaterial} />
      <mesh geometry={nodes.decor.geometry} material={decorMaterial} />
      <mesh geometry={nodes.floor.geometry} material={floorMaterial} />
      <mesh geometry={nodes.MirrorFrame.geometry} material={decorMaterial} />
      <mesh
        geometry={nodes.hoofGlass.geometry}
        material={hoofMaterial}
        layers-enable={2}
        castShadow={false}
        receiveShadow={false}
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
        count={50} // Reduzido para melhor performance no iOS
        color="lightpink"
        size={0.03}
        speed={0.65}
        spread={0.3}
        layers-enable={2}
        castShadow={false}
        receiveShadow={false}
      />
    </group>
  )
}

// Main Component
const Castle = ({ activeSection }) => {
  const controls = useRef()
  const [hasInteracted, setHasInteracted] = useState(false)
  const [showIOSPrompt, setShowIOSPrompt] = useState(isIOS())

  // Handle user interaction from iOS prompt
  const handleStart = () => {
    console.log("User interaction received")
    setHasInteracted(true)
    setShowIOSPrompt(false)

    // Move to active section or default position
    setTimeout(() => {
      if (activeSection) {
        playTransition(activeSection)
      } else {
        playTransition("nav")
      }
    }, TRANSITION_DELAY)
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

    controls.current.enabled = true

    const targetPosition = getCameraPosition(
      sectionName === "default" ? "default" : sectionName
    )

    if (targetPosition) {
      controls.current
        .setLookAt(...targetPosition, true)
        .then(() => {
          controls.current.enabled = sectionName === "nav"
        })
        .catch(error => {
          console.error("Error setting camera look at:", error)
        })
    }
  }

  // Initialize camera
  useEffect(() => {
    if (!controls.current) return

    window.controls = controls

    // Set camera controls configuration
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

    // Set initial position
    const defaultPosition = getCameraPosition("default")
    controls.current.setLookAt(...defaultPosition, false)

    // Only auto-transition if not on iOS or after user interaction
    if (!isIOS() || hasInteracted) {
      setTimeout(() => {
        playTransition("nav")
      }, TRANSITION_DELAY)
    }
  }, [hasInteracted])

  // Handle active section changes
  useEffect(() => {
    if (activeSection && (hasInteracted || !isIOS())) {
      playTransition(activeSection)
    }
  }, [activeSection, hasInteracted])

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
    <>
      {showIOSPrompt && <IOSStartScreen onStart={handleStart} />}

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
        <Suspense fallback={null}>
          <CastleModel hasInteracted={hasInteracted || !isIOS()} />
        </Suspense>
      </group>
    </>
  )
}

useGLTF.preload("/models/Castle.glb")

export default Castle

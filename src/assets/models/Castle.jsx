import React, { Suspense, useEffect, useMemo, useRef } from "react"
import { useGLTF, CameraControls, Html } from "@react-three/drei"
import { useControls, button, monitor } from "leva"
import {
  Color,
  MeshStandardMaterial,
  DoubleSide,
  NormalBlending,
  NearestFilter,
} from "three"
import Modeload from "../../components/helpers/Modeload"

const defaultCameraPosition = [
  132.95512091806918,
  87.33269746995288,
  188.3864842177005,
  -0.1823668021901385,
  -0.24424001987657776,
  0.22391277970336168,
]

// Posições da câmera para cada seção
const cameraPositions = {
  nav: [
    -0.1484189177185437, 0.9565803692840462, 6.591986961996083,
    -0.21830679207380707, 1.042078953185994, 0.860456882413919,
  ],
  about: [
    4.383078095529023, 1.243425891505504, -2.2307625593864366,
    0.1723786308639481, 1.0468291516427397, -0.08072363062511172,
  ],
  aidatingcoach: [
    -2.287522183512657, 1.1140207867811742, -1.087725967459512,
    -0.08872200461723317, 1.1076978075751573, -0.030188523722664052,
  ],
  download: [
    1.8294030001912027, 1.1241952974854004, -0.9268222253732308,
    0.1723786308639481, 1.0468291516427397, -0.08072363062511172,
  ],
  token: [
    2.0799027767746923, 1.1492603137264552, 1.0627122850364636,
    -1.2102179925739383, 0.8585880494001786, -0.5986556331928229,
  ],
  roadmap: [
    -2.806686804616935,
    1.2642495533874112, 1.4887984652508282,
    0, 0.8, 0,
  ],
}



const SMALL_SCREEN_THRESHOLD = 768

const useCastleMaterial = () => {
  return useMemo(() => {
    return new MeshStandardMaterial({
      color: new Color(0xaaaaaa), // Cor neutra em vez de textura
      emissive: new Color(0x000000),
      emissiveIntensity: 0,
      transparent: false,
      alphaTest: 0.5,
      side: DoubleSide,
      blending: NormalBlending,
      roughness: 0.5,
      metalness: 0,
    })
  }, [])
}

const CastleModel = ({ onCastleClick }) => {
  const { nodes } = useGLTF("/models/Castle.glb")
  const material = useCastleMaterial()

  return (
    <group dispose={null}>
      <mesh geometry={nodes.Castle.geometry} material={material} />
      <group
        position={[1.663, 1.113, 0.851]}
        rotation={[Math.PI / 1, 1.919, Math.PI]}
        scale={[0.08, 0.08, 0.08]}
      >
        <Html
          position={[0, 0, 0]}
          transform
          distanceFactor={1.16}
          className=" p-2 "
        >
          <iframe
            src="https://getcupid.ai/Blogs"
            className="rounded-md shadow-lg"
          />
          <button
            onClick={() => onCastleClick("nav")}
            style={{
              position: "absolute",
              bottom: "-40px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            MENU
          </button>
        </Html>
      </group>
    </group>
  )
}

useGLTF.preload("/models/Castle.glb")

const Castle = ({ activeSection }) => {
  const controls = useRef()
  const audioContext = useRef(null)
  const audioElements = useRef({
    nav: null,
    roadmap: null
  })
  const sources = useRef({
    nav: null,
    roadmap: null
  })
  const panners = useRef({
    nav: null,
    roadmap: null
  })

  useEffect(() => {
    window.controls = controls

    audioElements.current.nav = new Audio('/src/assets/sounds/videoplayback.mp4')
    audioElements.current.roadmap = new Audio('/src/assets/sounds/sound2.mp4')
    audioElements.current.nav.loop = true
    audioElements.current.roadmap.loop = true

    audioContext.current = new (window.AudioContext || window.webkitAudioContext)()

    sources.current.nav = audioContext.current.createMediaElementSource(audioElements.current.nav)
    panners.current.nav = audioContext.current.createPanner()
    setupPanner(panners.current.nav)
    sources.current.nav.connect(panners.current.nav)
    panners.current.nav.connect(audioContext.current.destination)

    sources.current.roadmap = audioContext.current.createMediaElementSource(audioElements.current.roadmap)
    panners.current.roadmap = audioContext.current.createPanner()
    setupPanner(panners.current.roadmap)
    sources.current.roadmap.connect(panners.current.roadmap)
    panners.current.roadmap.connect(audioContext.current.destination)

    return () => {
      Object.values(audioElements.current).forEach(audio => audio?.pause())
      audioContext.current?.close()
    }
  }, [])

  const setupPanner = (panner) => {
    panner.panningModel = 'HRTF'
    panner.distanceModel = 'inverse'
    panner.refDistance = 1
    panner.maxDistance = 100
    panner.rolloffFactor = 1
    panner.setPosition(0, 0, 0)
  }
  useControls("settings", {
    fps: monitor(() => performance.now()),
    smoothTime: {
      value: 0.6,
      min: 0.1,
      max: 2,
      step: 0.1,
      onChange: v => (controls.current.smoothTime = v),
    },
    getLookAt: button(() => {
      const position = controls.current.getPosition()
      const target = controls.current.getTarget()
      console.log([...position, ...target])
    }),
  })


    const playSound = (section) => {
    if (audioContext.current?.state === 'suspended') {
      audioContext.current.resume()
    }
    Object.values(audioElements.current).forEach(audio => audio?.pause())
    audioElements.current[section]?.play()
  }

  const stopSound = () => {
    Object.values(audioElements.current).forEach(audio => {
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    })
  }

  const updateListenerPosition = (position) => {
    if (audioContext.current && position) {
      const [x, y, z] = position
      audioContext.current.listener.setPosition(x, y, z)
    }
  }

  const playTransition = sectionName => {
    const isSmallScreen = window.innerWidth < SMALL_SCREEN_THRESHOLD
    if (sectionName === "default") {
      controls.current.setLookAt(...defaultCameraPosition, true)
      stopSound()
      return
    }

    const targetPosition = isSmallScreen
      ? cameraPositionsSmallScreen[sectionName]
      : cameraPositions[sectionName]

    if (controls.current && targetPosition) {
      controls.current.setLookAt(...targetPosition, true)
      updateListenerPosition(targetPosition.slice(0, 3))

      if (sectionName === 'nav' || sectionName === 'roadmap') {
        playSound(sectionName)
      } else {
        stopSound()
      }
    }
  }
  useEffect(() => {
    controls.current.setLookAt(...defaultCameraPosition, false)
    setTimeout(() => {
      playTransition("nav")
    }, 100)
  }, [])

  useEffect(() => {
    if (activeSection) {
      playTransition(activeSection)
    }
  }, [activeSection])


  return (
    <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <CameraControls ref={controls} />
      <Suspense fallback={<Modeload />}>
        <CastleModel onCastleClick={playTransition} />
      </Suspense>
    </group>
  )
}

export default Castle
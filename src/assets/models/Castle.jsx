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
  const audioElement = useRef(null)
  const source = useRef(null)
  const panner = useRef(null)

  // Audio setup
  useEffect(() => {
    window.controls = controls

    audioElement.current = new Audio('/src/assets/sounds/videoplayback.mp4')
    audioElement.current.loop = true

    audioContext.current = new (window.AudioContext || window.webkitAudioContext)()
    source.current = audioContext.current.createMediaElementSource(audioElement.current)
    panner.current = audioContext.current.createPanner()
    panner.current.panningModel = 'HRTF'
    panner.current.distanceModel = 'inverse'
    panner.current.refDistance = 1
    panner.current.maxDistance = 100
    panner.current.rolloffFactor = 1
    panner.current.setPosition(0, 0, 0)

    source.current.connect(panner.current)
    panner.current.connect(audioContext.current.destination)

    return () => {
      if (audioElement.current) {
        audioElement.current.pause()
      }
      if (audioContext.current) {
        audioContext.current.close()
      }
    }
  }, [])

  const playSound = () => {
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume()
    }
    audioElement.current.play()
  }

  const stopSound = () => {
    audioElement.current.pause()
    audioElement.current.currentTime = 0
  }

  const updateListenerPosition = (position) => {
    if (audioContext.current && position) {
      const [x, y, z] = position
      audioContext.current.listener.setPosition(x, y, z)
    }
  }

  const playTransition = sectionName => {
    const isSmallScreen = window.innerWidth < SMALL_SCREEN_THRESHOLD

    // Temporariamente habilita a câmera para a transição
    if (controls.current) {
      controls.current.enabled = true
    }

    if (sectionName === "default") {
      controls.current.setLookAt(...defaultCameraPosition, true).then(() => {
        controls.current.enabled = true
      })
      stopSound()
      return
    }

    const targetPosition = isSmallScreen
      ? cameraPositionsSmallScreen[sectionName]
      : cameraPositions[sectionName]

    if (controls.current && targetPosition) {
      // Executa a transição e depois trava a câmera se necessário
      controls.current.setLookAt(...targetPosition, true).then(() => {
        controls.current.enabled = sectionName === 'nav'
      })

      updateListenerPosition(targetPosition.slice(0, 3))

      if (sectionName === 'nav') {
        playSound()
      } else {
        stopSound()
      }
    }
  }

  useEffect(() => {
    if (!controls.current) return

    controls.current.enabled = true
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

  return (
    <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <CameraControls
        ref={controls}
        makeDefault
        smoothTime={0.6}
      />
      <Suspense fallback={<Modeload />}>
        <CastleModel onCastleClick={playTransition} />
      </Suspense>
    </group>
  )
}

export default Castle
import React, { Suspense, useEffect, useMemo, useRef } from "react"
import { useGLTF, useTexture, CameraControls, Html } from "@react-three/drei"
import { useControls, button, monitor } from "leva"
import {
  Color,
  MeshStandardMaterial,
  DoubleSide,
  NormalBlending,
  NearestFilter,
} from "three"
import Modeload from "../../components/helpers/Modeload"

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

// Posições da câmera para cada seção (telas pequenas)
const cameraPositionsSmallScreen = {
  intro: [
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
}

const SMALL_SCREEN_THRESHOLD = 768

// Componente de material e texturas para o Castelo
const useCastleMaterial = () => {
  const textures = useTexture({
    map: "/texture/project6/CastleColorB.jpg",
    normalMap: "/texture/project6/CastleNormal.jpg",
    emissiveMap: "/texture/project6/CastleEmissive.jpg",
  })

  useMemo(() => {
    Object.values(textures).forEach(texture => {
      if (texture) {
        texture.flipY = false
        texture.minFilter = texture.magFilter = NearestFilter
      }
    })
  }, [textures])

  return useMemo(() => {
    return new MeshStandardMaterial({
      map: textures.map,
      normalMap: textures.normalMap,
      emissiveMap: textures.emissiveMap,
      emissive: new Color(0xffffff),
      emissiveIntensity: 16,
      transparent: false,
      alphaTest: 0.5,
      side: DoubleSide,
      blending: NormalBlending,
      roughness: 0.5,
      metalness: 0,
    })
  }, [textures])
}

const CastleModel = ({ onCastleClick }) => {
  const { nodes } = useGLTF("/models/Castle.glb")
  const material = useCastleMaterial()

  return (
    <group dispose={null}>
      <mesh geometry={nodes.Castle.geometry} material={nodes.Castle.material} />
      <group
        position={[1.663, 1.113, 0.851]}
        rotation={[Math.PI / 1, 1.919, Math.PI]}
        scale={[0.08, 0.08, 0.08]}
      >
        <Html
          position={[0, 0, 0]}
          transform
          distanceFactor={1.16}
          className=" p-2"
        >
          <iframe src="https://getcupid.ai/Blogs" />
          {/* Botão de voltar adicionado aqui */}
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

// Componente Principal
const Castle = ({ activeSection }) => {
  const controls = useRef()
  const statsRef = useRef()

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

  const playTransition = sectionName => {
    const isSmallScreen = window.innerWidth < SMALL_SCREEN_THRESHOLD
    const targetPosition = isSmallScreen
      ? cameraPositionsSmallScreen[sectionName]
      : cameraPositions[sectionName]

    if (controls.current && targetPosition) {
      controls.current.setLookAt(...targetPosition, true)
    }
  }

  useEffect(() => {
    // Posição inicial da câmera (camGo)
    controls.current.setLookAt(
      132.95512091806918,
      87.33269746995288,
      188.3864842177005,
      -0.1823668021901385,
      -0.24424001987657776,
      0.22391277970336168,
      false
    )

    // After "0" secconds go to the 'nav' section
    setTimeout(() => {
      playTransition("nav")
    }, 0)
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

import React, { Suspense, useEffect, useMemo, useRef } from "react"
import { useGLTF, useTexture, CameraControls } from "@react-three/drei"
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
  intro: [
    -0.43466055868611264, 36.71664562660475, 80.51979073678996,
    -0.1823668021901385, -0.24424001987657776, 0.22391277970336168,
  ],
  about: [
    -8.353014949489166, -0.013560590250668608, 12.57337844346448,
    -0.8475404096833372, -0.13618077972400086, 0.6684951958313516,
  ],
  aidatingcoach: [
    -3.025991809341079, -2.5682088630250557, -6.051483863275375,
    -0.14245010459722365, -1.034158299338279, -0.46664672097423954,
  ],
  download: [
    3.034860200318817, -3.069184354319493, -5.675420419784312,
    -1.1399191158334525, -1.8122717783916518, 0.19488804698262188,
  ],
  token: [
    9.38340369406869, -1.0644408728781183, -0.22568971961115283,
    -0.8892502543446409, -0.1675897029196247, -0.4149752417767108,
  ],
  roadmap: [
    -2.2822119451081493, 1.1021931209317424, 1.0992282899544978,
    0.21267852771878015, 0.9231401222415563, 0.037599014005687326,
  ],
}

// Posições da câmera para cada seção
const cameraPositionsSmallScreen = {
  intro: [
    10.236728346101938, 6.301746236952154, 14.61287344412683,
    -0.46112017760009805, 1.5111864168379876, 0.17289136379137532,
  ],
  about: [
    -8.353014949489166, -0.013560590250668608, 12.57337844346448,
    -0.8475404096833372, -0.13618077972400086, 0.6684951958313516,
  ],
  aidatingcoach: [
    -2.7485496970274723, 1.2171669841244113, 1.3227101403905195,
    -0.5354922096890259, 1.0929899188181706, 0.4284327164373669,
  ],
  download: [
    1.4636476673009642, 1.3905474975838177, -4.216559988863749,
    -0.5210618269570172, 1.4251827689316967, -1.105893976661937,
  ],
  token: [
    2.118405773953273, 1.2172470657362846, 1.0635730429142927,
    0.04723852527162822, 0.585365963592996, 0.11077814711949062,
  ],
  roadmap: [
    -2.313684779997046, 1.2083259064173375, 1.1538100144861823,
    0.1702250587616987, 0.7307799225225591, 0.16096717018623882,
  ],
}

const SMALL_SCREN_THRESHOLD = 768

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
      <mesh
        geometry={nodes.Castle.geometry}
        material={nodes.Castle.material}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={1}
      />
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
      value: 0.8,
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
    const isSmallScreen = window.innerWidth < SMALL_SCREN_THRESHOLD
    const targetPosition = isSmallScreen
      ? cameraPositionsSmallScreen[sectionName]
      : cameraPositions[sectionName]

    if (controls.current && targetPosition) {
      controls.current.setLookAt(...targetPosition, true)
    }
  }

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

import React, { Suspense, useEffect, useMemo, useRef } from "react"
import { useGLTF, useTexture, CameraControls, Html } from "@react-three/drei"
import { useControls, button, monitor, folder } from "leva"
import {
  Color,
  MeshStandardMaterial,
  DoubleSide,
  NormalBlending,
  NearestFilter,
} from "three"
import Modeload from "../../components/helpers/Modeload"
import StatsPanel from "../../components/helpers/StatsPanel"
import gsap from "gsap"

const cameraPositions = {
  intro: [
    29.077824806356972, 3.9710910170900005, 29.401594721548648,
    -0.08985556541233858, -1.5528712351535003, 0.006124480886434933,
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
    -0.089306308893148, 17.251249369255323, 7.371872885036802,
    0.00025816130769796414, 0.34598539345333384, 0.10369558199844564,
  ],
}

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

const CastleModel = () => {
  const { nodes } = useGLTF("/models/project6/Castle.glb")
  const material = useCastleMaterial()

  return (
    <group dispose={null}>
      <mesh
        geometry={nodes.castleUV_Baked.geometry}
        material={material}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={1}
      />
    </group>
  )
}

useGLTF.preload("/models/project6/Castle.glb")

const Castle = ({ activeSection }) => {
  const controls = useRef()
  const statsRef = useRef()
  const currentAnimation = useRef(null)

  const {
    smoothTime,
    targetDelay,
    targetDurationScale,
    minDuration,
    maxDuration,
  } = useControls("Animation Settings", {
    camera: folder({
      smoothTime: {
        value: 0.8,
        min: 0.1,
        max: 2,
        step: 0.1,
        onChange: v => (controls.current.smoothTime = v),
      },
    }),
    animation: folder({
      targetDelay: {
        value: 0.2,
        min: 0,
        max: 1,
        step: 0.05,
        label: "Target Delay",
      },
      targetDurationScale: {
        value: 0.8,
        min: 0.5,
        max: 1.5,
        step: 0.05,
        label: "Target Duration Scale",
      },
      minDuration: {
        value: 1.2,
        min: 0.5,
        max: 2,
        step: 0.1,
        label: "Min Duration",
      },
      maxDuration: {
        value: 2.5,
        min: 1.5,
        max: 4,
        step: 0.1,
        label: "Max Duration",
      },
    }),
    debug: folder({
      fps: monitor(() => performance.now()),
      getLookAt: button(() => {
        const position = controls.current.getPosition()
        const target = controls.current.getTarget()
        console.log([...position, ...target])
      }),
    }),
  })

  const playTransition = sectionName => {
    if (currentAnimation.current) {
      currentAnimation.current.kill()
    }

    const targetPosition = cameraPositions[sectionName]
    if (controls.current && targetPosition) {
      const [x, y, z, tx, ty, tz] = targetPosition
      const currentPos = controls.current.getPosition()
      const currentTarget = controls.current.getTarget()

      // Calculate distance for dynamic duration
      const positionDistance = Math.sqrt(
        Math.pow(x - currentPos.x, 2) +
          Math.pow(y - currentPos.y, 2) +
          Math.pow(z - currentPos.z, 2)
      )

      // Base duration using the configurable min/max values
      const baseDuration = Math.min(
        Math.max(positionDistance * 0.1, minDuration),
        maxDuration
      )

      // Create a timeline for synchronized animations
      const tl = gsap.timeline({
        defaults: {
          ease: "power2.inOut",
          onUpdate: () => {
            controls.current.setPosition(
              controls.current.x,
              controls.current.y,
              controls.current.z
            )
            controls.current.setTarget(
              controls.current.tx,
              controls.current.ty,
              controls.current.tz
            )
          },
        },
      })

      // Store the timeline for potential interruption
      currentAnimation.current = tl

      // Add position and target animations to timeline using configurable delays
      tl.to(
        controls.current,
        {
          x,
          y,
          z,
          duration: baseDuration,
        },
        0
      ).to(
        controls.current,
        {
          tx,
          ty,
          tz,
          duration: baseDuration * targetDurationScale,
        },
        baseDuration * targetDelay
      )
    }
  }

  useEffect(() => {
    if (activeSection) {
      playTransition(activeSection)
    }

    return () => {
      if (currentAnimation.current) {
        currentAnimation.current.kill()
      }
    }
  }, [
    activeSection,
    targetDelay,
    targetDurationScale,
    minDuration,
    maxDuration,
  ])

  return (
    <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
      <StatsPanel />
      <CameraControls ref={controls} />
      <Suspense fallback={<Modeload />}>
        <CastleModel />
      </Suspense>
    </group>
  )
}

export default Castle

// AdvancedFogScene.jsx
import * as THREE from "three"
import { useEffect, useRef, useMemo } from "react"
import { useThree, extend } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

// For Three.js r150+ you might need to install three-stdlib
// npm install three-stdlib
import {
  MeshPhongNodeMaterial,
  color,
  positionWorld,
  timerLocal,
  triNoise3D,
} from "three-stdlib"

extend({ MeshPhongNodeMaterial })

const SCENE_SETTINGS = {
  cameraPosition: new THREE.Vector3(30, 15, 30),
  fogDensity: 0.0025,
  planeSize: 200,
  planeScale: 3,
  buildingCount: 4000,
  buildingAreaSize: 600,
  buildingAreaOffset: 300,
  autoRotateSpeed: 0.1,
}

const COLORS = {
  sky: 0xf0f5f5,
  ground: 0xd0dee7,
  plane: 0x999999,
  windowDark: 0x000066,
  windowLight: 0xffffff,
}

export default function AdvancedFogScene() {
  const { scene, camera, gl } = useThree()
  const instancedRef = useRef()
  const clockRef = useRef(new THREE.Clock())
  const animationIdRef = useRef()

  // Create materials
  const { planeMaterial, buildingMaterial } = useMemo(() => {
    // Plane material
    const planeMaterial = new THREE.MeshPhongMaterial({
      color: COLORS.plane,
    })

    // Building material with window effect
    const timer = timerLocal()
    const fogNoiseA = triNoise3D(positionWorld.mul(0.005), 0.2, timer)
    const fogNoiseB = triNoise3D(positionWorld.mul(0.01), 0.2, timer.mul(1.2))
    const fogNoise = fogNoiseA.add(fogNoiseB).mul(color(COLORS.ground))

    const buildWindows = positionWorld.y
      .mul(10)
      .floor()
      .mod(4)
      .sign()
      .mix(color(COLORS.windowDark).add(fogNoise), color(COLORS.windowLight))

    const buildingMaterial = new MeshPhongNodeMaterial({
      colorNode: buildWindows,
    })

    return { planeMaterial, buildingMaterial }
  }, [])

  // Initialize scene
  useEffect(() => {
    // Camera setup
    camera.position.copy(SCENE_SETTINGS.cameraPosition)

    // Scene setup
    scene.background = new THREE.Color(COLORS.sky)
    scene.fog = new THREE.FogExp2(COLORS.ground, SCENE_SETTINGS.fogDensity)

    // Lighting
    scene.add(new THREE.HemisphereLight(COLORS.sky, COLORS.ground, 0.5))

    // Ground plane
    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(
        SCENE_SETTINGS.planeSize,
        SCENE_SETTINGS.planeSize
      ),
      planeMaterial
    )
    plane.rotation.x = -Math.PI / 2
    plane.scale.multiplyScalar(SCENE_SETTINGS.planeScale)
    plane.receiveShadow = true
    scene.add(plane)

    // Buildings
    const buildGeometry = new THREE.BoxGeometry(1, 1, 1)
    const buildMesh = new THREE.InstancedMesh(
      buildGeometry,
      buildingMaterial,
      SCENE_SETTINGS.buildingCount
    )

    const dummy = new THREE.Object3D()
    const center = new THREE.Vector3()

    for (let i = 0; i < buildMesh.count; i++) {
      const scaleY = Math.random() * 7 + 0.5
      dummy.position.set(
        Math.random() * SCENE_SETTINGS.buildingAreaSize -
          SCENE_SETTINGS.buildingAreaOffset,
        0,
        Math.random() * SCENE_SETTINGS.buildingAreaSize -
          SCENE_SETTINGS.buildingAreaOffset
      )

      const distance = Math.max(dummy.position.distanceTo(center) * 0.012, 1)
      dummy.position.y = 0.5 * scaleY * distance
      dummy.scale.setScalar(Math.random() * 3 + 0.5)
      dummy.scale.y = scaleY * distance
      dummy.updateMatrix()
      buildMesh.setMatrixAt(i, dummy.matrix)
    }

    scene.add(buildMesh)
    instancedRef.current = buildMesh

    // Animation loop
    const animate = () => {
      // Update time-based materials if needed
    }

    const renderLoop = () => {
      animate()
      animationIdRef.current = requestAnimationFrame(renderLoop)
    }

    animationIdRef.current = requestAnimationFrame(renderLoop)

    return () => {
      cancelAnimationFrame(animationIdRef.current)
      scene.remove(buildMesh)
      buildMesh.dispose()
      planeMaterial.dispose()
      buildingMaterial.dispose()
      scene.fog = null
    }
  }, [scene, camera, gl, planeMaterial, buildingMaterial])

  return (
    <OrbitControls
      target={[0, 2, 0]}
      minDistance={7}
      maxDistance={100}
      maxPolarAngle={Math.PI / 2}
      autoRotate
      autoRotateSpeed={SCENE_SETTINGS.autoRotateSpeed}
    />
  )
}

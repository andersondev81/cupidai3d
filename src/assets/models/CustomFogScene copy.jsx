import { useEffect, useRef } from "react"
import * as THREE from "three"
import {
  color,
  fog,
  float,
  positionWorld,
  triNoise3D,
  positionView,
  normalWorld,
  uniform,
} from "three/nodes" // Changed from "three/tsl"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { WebGPURenderer } from "three/addons/renderers/webgpu/WebGPURenderer.js"

export default function CustomFogScene() {
  const containerRef = useRef()

  useEffect(() => {
    let camera, scene, renderer, controls

    const init = () => {
      camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        1,
        600
      )
      camera.position.set(30, 15, 30)

      scene = new THREE.Scene()

      const skyColor = color(0xf0f5f5)
      const groundColor = color(0xd0dee7)

      const fogNoiseDistance = positionView.z
        .negate()
        .smoothstep(0, camera.far - 300)
      const distance = fogNoiseDistance.mul(20).max(4)
      const alpha = 0.98
      const groundFogArea = float(distance)
        .sub(positionWorld.y)
        .div(distance)
        .pow(3)
        .saturate()
        .mul(alpha)

      const timer = uniform(0).onFrameUpdate(frame => frame.time)

      const fogNoiseA = triNoise3D(positionWorld.mul(0.005), 0.2, timer)
      const fogNoiseB = triNoise3D(positionWorld.mul(0.01), 0.2, timer.mul(1.2))
      const fogNoise = fogNoiseA.add(fogNoiseB).mul(groundColor)

      scene.fogNode = fog(
        fogNoiseDistance.oneMinus().mix(groundColor, fogNoise),
        groundFogArea
      )
      scene.backgroundNode = normalWorld.y.max(0).mix(groundColor, skyColor)

      const buildWindows = positionWorld.y
        .mul(10)
        .floor()
        .mod(4)
        .sign()
        .mix(color(0x000066).add(fogNoiseDistance), color(0xffffff))

      const buildGeometry = new THREE.BoxGeometry(1, 1, 1)
      const buildMaterial = new THREE.MeshPhongNodeMaterial({
        colorNode: buildWindows,
      })
      const buildMesh = new THREE.InstancedMesh(
        buildGeometry,
        buildMaterial,
        4000
      )
      scene.add(buildMesh)

      const dummy = new THREE.Object3D()
      const center = new THREE.Vector3()

      for (let i = 0; i < buildMesh.count; i++) {
        const scaleY = Math.random() * 7 + 0.5

        dummy.position.x = Math.random() * 600 - 300
        dummy.position.z = Math.random() * 600 - 300

        const dist = Math.max(dummy.position.distanceTo(center) * 0.012, 1)

        dummy.position.y = 0.5 * scaleY * dist

        dummy.scale.x = dummy.scale.z = Math.random() * 3 + 0.5
        dummy.scale.y = scaleY * dist

        dummy.updateMatrix()
        buildMesh.setMatrixAt(i, dummy.matrix)
      }

      scene.add(
        new THREE.HemisphereLight(skyColor.value, groundColor.value, 0.5)
      )

      const planeGeometry = new THREE.PlaneGeometry(200, 200)
      const planeMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 })

      const ground = new THREE.Mesh(planeGeometry, planeMaterial)
      ground.rotation.x = -Math.PI / 2
      ground.scale.multiplyScalar(3)
      ground.castShadow = true
      ground.receiveShadow = true
      scene.add(ground)

      renderer = new WebGPURenderer({ antialias: true })
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setAnimationLoop(animate)

      containerRef.current.appendChild(renderer.domElement)

      controls = new OrbitControls(camera, renderer.domElement)
      controls.target.set(0, 2, 0)
      controls.minDistance = 7
      controls.maxDistance = 100
      controls.maxPolarAngle = Math.PI / 2
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.1
      controls.update()

      window.addEventListener("resize", onWindowResize)
    }

    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    const animate = () => {
      controls.update()
      renderer.render(scene, camera)
    }

    init()

    return () => {
      window.removeEventListener("resize", onWindowResize)
      renderer.dispose()
    }
  }, [])

  return <div ref={containerRef} style={{ width: "100vw", height: "100vh" }} />
}

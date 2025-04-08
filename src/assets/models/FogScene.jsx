// FogScene.jsx
import * as THREE from "three"
import { useRef, useEffect } from "react"
import { useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"

export default function FogScene() {
  const { scene, camera } = useThree()
  const instancedRef = useRef()

  useEffect(() => {
    setupCamera(camera)
    setupLights(scene)
    setupGround(scene)
    setupFog(scene)
    const mesh = createBuildings(scene)
    instancedRef.current = mesh

    return () => {
      scene.remove(mesh)
      mesh.dispose()
    }
  }, [scene, camera])

  return (
    <OrbitControls
      target={[0, 2, 0]}
      minDistance={7}
      maxDistance={100}
      maxPolarAngle={Math.PI / 2}
      autoRotate
      autoRotateSpeed={0.1}
    />
  )
}

function setupCamera(camera) {
  camera.position.set(30, 15, 30)
}

function setupLights(scene) {
  const hemiLight = new THREE.HemisphereLight(
    new THREE.Color(0xf0f5f5),
    new THREE.Color(0xd0dee7),
    0.5
  )
  scene.add(hemiLight)
}

function setupGround(scene) {
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200),
    new THREE.MeshPhongMaterial({ color: 0x999999 })
  )
  plane.rotation.x = -Math.PI / 2
  plane.scale.multiplyScalar(3)
  plane.receiveShadow = true
  scene.add(plane)
}

function setupFog(scene) {
  const skyColor = new THREE.Color(0xf0f5f5)
  const groundColor = new THREE.Color(0xd0dee7)
  scene.fog = new THREE.Fog(groundColor, 50, 300)
  scene.background = skyColor
}

function createBuildings(scene) {
  const geometry = new THREE.BoxGeometry(1, 1, 1)
  const material = new THREE.MeshPhongMaterial({ color: 0xffffff })
  const mesh = new THREE.InstancedMesh(geometry, material, 4000)
  const dummy = new THREE.Object3D()
  const center = new THREE.Vector3()

  for (let i = 0; i < 4000; i++) {
    const scaleY = Math.random() * 7 + 0.5
    dummy.position.set(Math.random() * 600 - 300, 0, Math.random() * 600 - 300)
    const distance = Math.max(dummy.position.distanceTo(center) * 0.012, 1)
    dummy.position.y = 0.5 * scaleY * distance
    dummy.scale.setScalar(Math.random() * 3 + 0.5)
    dummy.scale.y = scaleY * distance
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }

  scene.add(mesh)
  return mesh
}

import { useRef } from "react"
import VolumetricCloudMaterial from "../models/VolumetricCloudsMaterial"
import { useFrame } from "@react-three/fiber"
import { folder, useControls } from "leva"

export default function VolumetricClouds(props) {
  const ref = useRef()

  useFrame((scene, delta) => {
    ref.current.rotation.y += delta * 0.04
  })

  return (
    <group ref={ref}>
      <mesh scale={props.scale} position={props.position}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <VolumetricCloudMaterial {...props} />
      </mesh>
    </group>
  )
}

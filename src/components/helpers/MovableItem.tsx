import { PivotControls } from "@react-three/drei"
import { useRef } from "react"
import * as THREE from "three"

interface MoveableItemProps {
  children: React.ReactNode
}

export const MovableItem = (props: MoveableItemProps) => {
  const { children } = props
  const ref = useRef<THREE.Group>(null)

  const displayItemNewPosition = () => {
    const newWorldPosition = new THREE.Vector3()
    if (ref.current) {
      ref.current.getWorldPosition(newWorldPosition)
      console.log("New position: ", [
        newWorldPosition.x,
        newWorldPosition.y,
        newWorldPosition.z,
      ])

      const newWorldQuaternion = new THREE.Quaternion()
      ref.current.getWorldQuaternion(newWorldQuaternion)
      const newWorldRotation = new THREE.Euler().setFromQuaternion(
        newWorldQuaternion
      )
      console.log("New rotation: ", [
        newWorldRotation.x,
        newWorldRotation.y,
        newWorldRotation.z,
      ])
    }
  }

  return (
    <PivotControls
      depthTest={false}
      onDragEnd={displayItemNewPosition}
      scale={5}
    >
      <group ref={ref}>{children}</group>
    </PivotControls>
  )
}

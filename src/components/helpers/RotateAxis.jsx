import React, { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Euler, Quaternion, Vector3 } from "three"

const RotateAxis = ({
  children,
  axis = "y",
  speed = 1,
  rotationType = "euler",
}) => {
  const objectRef = useRef() // Object reference

  // Pre-create the axis vector to avoid new instance creation every frame
  const axisVector = new Vector3()

  // Updates the rotation every frame
  useFrame(({ clock }) => {
    if (objectRef.current) {
      const time = clock.getElapsedTime() * speed // Time adjusted by speed

      if (rotationType === "euler") {
        // Euler rotation
        if (axis === "x") {
          objectRef.current.rotation.x = time
        } else if (axis === "y") {
          objectRef.current.rotation.y = time
        } else if (axis === "z") {
          objectRef.current.rotation.z = time
        }
      } else if (rotationType === "quaternion") {
        // Quaternion rotation
        if (axis === "x") axisVector.set(1, 0, 0)
        else if (axis === "y") axisVector.set(0, 1, 0)
        else if (axis === "z") axisVector.set(0, 0, 1)

        const quaternion = new Quaternion().setFromAxisAngle(axisVector, time)
        objectRef.current.quaternion.copy(quaternion)
      }
    }
  })

  return (
    <group ref={objectRef}>
      {children} {/* Rendered children */}
    </group>
  )
}

export default RotateAxis

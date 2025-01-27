import React, { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Vector3 } from "three"

// FloatingOrbit component: Simulates an object floating in orbit
const FloatingOrbit = ({
  children,
  radius = 60, // Orbit radius
  speed = 1, // Orbit movement speed
  floatIntensity = 2, // Floating intensity
  floatSpeed = 1, // Floating animation speed
}) => {
  const orbitRef = useRef() // Orbit reference
  const airplaneRef = useRef() // Object reference
  const yOffset = useRef(0) // For smooth floating animation
  const randomFactor = useRef(Math.random() * 1000) // Random factor for variation

  // Updates position for simulating orbit
  useFrame(({ clock }) => {
    if (orbitRef.current && airplaneRef.current) {
      const time = clock.getElapsedTime() * speed // Time adjusted by speed

      // Updates orbital position (circular movement)
      orbitRef.current.position.x = Math.cos(time) * radius
      orbitRef.current.position.z = Math.sin(time) * radius

      // Makes the object "look" at the center
      const center = new Vector3(0, -8, 0)
      airplaneRef.current.lookAt(center)

      // Additional rotation (90 degrees)
      airplaneRef.current.rotateY(Math.PI / 2)

      // Floating animation with smooth randomness
      const targetY =
        Math.sin(time * floatSpeed + randomFactor.current) * floatIntensity

      // Smooth easing for floating effect
      yOffset.current += (targetY - yOffset.current) * 0.1

      airplaneRef.current.position.y = yOffset.current
    }
  })

  return (
    <group ref={orbitRef}>
      <group ref={airplaneRef}>
        {children} {/* Rendered children */}
      </group>
    </group>
  )
}

export default FloatingOrbit

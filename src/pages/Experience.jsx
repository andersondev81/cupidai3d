import React, { Suspense, useState, useRef, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { Sky, Environment } from "@react-three/drei"
import * as THREE from "three"
import { CAMERA_CONFIG } from "../components/cameraConfig"
import Castle from "../assets/models/Castle"
import CoudsD from "../assets/models/CloudsD"
import { CastleUi } from "../assets/models/CastleUi"
import { Pole } from "../assets/models/Pole"
import { Perf } from "r3f-perf"
import Modeload from "../components/helpers/Modeload"

const useCameraAnimation = section => {
  const { camera } = useThree()
  const animationRef = useRef({
    progress: 0,
    isActive: false,
    startPosition: new THREE.Vector3(),
    startFov: 50,
  })

  useEffect(() => {
    const sectionKey =
      `section${section}` in CAMERA_CONFIG.sections
        ? `section${section}`
        : "intro"

    const config = CAMERA_CONFIG.sections[sectionKey]
    const { intensity, curve } = CAMERA_CONFIG.transitions

    animationRef.current = {
      ...animationRef.current,
      isActive: true,
      startPosition: camera.position.clone(),
      startFov: camera.fov,
      config,
    }

    const animate = () => {
      if (!animationRef.current.isActive) return

      animationRef.current.progress += intensity
      const t = Math.min(animationRef.current.progress, 1)
      const { config, startPosition, startFov } = animationRef.current

      // Calculate transition values
      const curveValue = curve(t)
      const offsetZ = curveValue * config.transition.zOffset
      const targetFovOffset =
        curveValue * config.fov * config.transition.fovMultiplier

      // Interpolate position with Z offset
      const targetPosition = new THREE.Vector3()
        .lerpVectors(startPosition, config.position, t)
        .add(new THREE.Vector3(0, 0, offsetZ))

      // Interpolate FOV with dynamic offset
      const targetFov =
        THREE.MathUtils.lerp(startFov, config.fov, t) - targetFovOffset

      // Apply values
      camera.position.copy(targetPosition)
      camera.fov = targetFov
      camera.updateProjectionMatrix()

      if (t < 1) {
        requestAnimationFrame(animate)
      } else {
        animationRef.current.isActive = false
        animationRef.current.progress = 0
      }
    }

    animate()

    return () => {
      animationRef.current.isActive = false
    }
  }, [section, camera])

  return null
}

const Experience = () => {
  const [currentSection, setCurrentSection] = useState(0)
  const [activeSection, setActiveSection] = useState("intro")

  const handleSectionChange = (index, sectionName) => {
    setCurrentSection(index)
    setActiveSection(sectionName)
  }

  return (
    <div className="bg-gradient-to-b from-[#bde0fe] to-[#ffafcc] h-screen relative">
      <div className="absolute inset-0 pointer-events-none z-10">
        <CastleUi
          section={currentSection}
          onSectionChange={handleSectionChange}
          className="pointer-events-auto"
        />
      </div>

      <Canvas camera={CAMERA_CONFIG.sections.intro} className="w-full h-full">
        <SceneController section={currentSection} />

        <Suspense fallback={<Modeload />}>
          <SceneContent
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

const SceneController = ({ section }) => {
  useCameraAnimation(section)
  return (
    <>
      <fog attach="fog" args={["#ffff", 0, 40]} />
      <Environment
        files="/images/Clouds.hdr"
        background
        blur={0.6}
        envMapIntensity={0.5}
      />
      <Perf position="top-left" />
    </>
  )
}

const SceneContent = React.memo(({ activeSection, onSectionChange }) => (
  <>
    <Castle activeSection={activeSection} receiveShadow scale={[2, 2, 2]} />
    <CoudsD />
    <Pole
      position={[-0.8, 0, 5.8]}
      scale={[0.6, 0.6, 0.6]}
      onSectionChange={onSectionChange}
    />
    <Sky
      distance={450000}
      sunPosition={[0, 1, 0]}
      inclination={0}
      azimuth={0.25}
    />
  </>
))

export default Experience

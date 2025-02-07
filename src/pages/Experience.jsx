import React, { Suspense, useState } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { Sky, Environment } from "@react-three/drei"
import * as THREE from "three"
import Castle from "../assets/models/Castle"
import CoudsD from "../assets/models/CloudsD"
import { CastleUi } from "../assets/models/CastleUi"
import { Pole } from "../assets/models/Pole"
import { Perf } from "r3f-perf"
import Modeload from "../components/helpers/Modeload"

// Configurações de câmera para diferentes seções
const CAMERA_SECTIONS = {
  intro: {
    position: new THREE.Vector3(0, 0, 20),
    fov: 85,
    lerpFactor: 0.1,
  },
  section1: {
    position: new THREE.Vector3(-5, 3, 15),
    fov: 50,
    lerpFactor: 0.1,
  },
  section2: {
    position: new THREE.Vector3(5, 2, 20),
    fov: 50,
    lerpFactor: 0.1,
  },
}

// Hook customizado para animação da câmera
const useCameraAnimation = section => {
  const { camera } = useThree()
  const target = React.useRef({
    position: new THREE.Vector3(),
    fov: camera.fov,
  })
  const animation = React.useRef({ frame: null, isAnimating: false })

  React.useEffect(() => {
    const sectionKey = `section${section}` || "intro"
    const config = CAMERA_SECTIONS[sectionKey] || CAMERA_SECTIONS.intro

    target.current.position.copy(config.position)
    target.current.fov = config.fov

    const animate = () => {
      // Interpolação da posição
      camera.position.lerp(target.current.position, config.lerpFactor)

      // Interpolação do FOV
      camera.fov = THREE.MathUtils.lerp(
        camera.fov,
        target.current.fov,
        config.lerpFactor
      )

      camera.updateProjectionMatrix()

      // Verificar se precisa continuar animando
      const positionDistance = camera.position.distanceTo(
        target.current.position
      )
      const fovDifference = Math.abs(camera.fov - target.current.fov)

      if (positionDistance > 0.01 || fovDifference > 0.1) {
        animation.current.frame = requestAnimationFrame(animate)
      } else {
        animation.current.isAnimating = false
      }
    }

    if (!animation.current.isAnimating) {
      animation.current.isAnimating = true
      animation.current.frame = requestAnimationFrame(animate)
    }

    return () => {
      if (animation.current.frame) {
        cancelAnimationFrame(animation.current.frame)
        animation.current.isAnimating = false
      }
    }
  }, [section, camera])

  return null
}

// Componente principal da experiência
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

      <Canvas
        camera={{
          position: CAMERA_SECTIONS.intro.position,
          fov: CAMERA_SECTIONS.intro.fov,
        }}
        className="w-full h-full"
      >
        <SceneController section={currentSection} />

        <Suspense fallback={<Modeload />}>
          <SceneContent
            activeSection={activeSection}
            currentSection={currentSection}
            onSectionChange={handleSectionChange}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Componente de controle de cena
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

// Componente de conteúdo da cena
const SceneContent = React.memo(
  ({ activeSection, currentSection, onSectionChange }) => (
    <>
      <Castle activeSection={activeSection} receiveShadow scale={[2, 2, 2]} />
      <CoudsD />
      <Pole
        position={[-0.8, 0, 6]}
        scale={[0.6, 0.6, 0.6]}
        onSectionChange={onSectionChange}
        section={currentSection}
      />
      <Sky
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0}
        azimuth={0.25}
      />
    </>
  )
)

export default Experience

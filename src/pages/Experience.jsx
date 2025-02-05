import React, { Suspense, useState, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { Sky, Environment, OrbitControls, Stage } from "@react-three/drei"
import Castle from "../assets/models/Castle"
import { EffectsTree } from "../components/helpers/EffectsTree"
import CoudsD from "../assets/models/CloudsD"
import { CastleUi } from "../assets/models/CastleUi"
import { Pole } from "../assets/models/Pole"
import { Perf } from "r3f-perf"
import Modeload from "../components/helpers/Modeload"

function Experience() {
  const [section, setSection] = useState(0)
  const [activeSection, setActiveSection] = useState("intro")

  const handleSectionChange = (index, sectionName) => {
    setSection(index)
    setActiveSection(sectionName)
  }

  return (
    <div>
      <div className="top-0 left-0 w-full h-screen bg-gradient-to-b from-[#bde0fe] to-[#ffafcc] z-0">
        <CastleUi section={section} onSectionChange={handleSectionChange} />
      </div>
      <div className="fixed top-0 left-0 w-full h-screen z-10">
        <Canvas camera={{ position: [0, 0, 20], fov: 85 }} shadows>
          <CameraController section={section} />
          <fog attach="fog" args={["#272730", 5, 30]} />
          <Environment
            files="/images/Panorama.hdr"
            background={true}
            blur={0.1}
            envMapIntensity={0.5}
            intensity={0.5}
          />

          {/* <EffectsTree /> */}
          <Perf position="top-left" />
          <OrbitControls />
          <Suspense fallback={<Modeload />}>
            <Castle
              activeSection={activeSection}
              receiveShadow
              scale={[2, 2, 2]}
            />
            <CoudsD />
            <Pole
              position={[-0.8, 0, 6]}
              scale={[0.6, 0.6, 0.6]}
              onSectionChange={handleSectionChange}
              section={section}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

function CameraController({ section }) {
  const { camera } = useThree()

  useEffect(() => {
    if (section !== 0) {
      camera.fov = 50
    } else {
      camera.fov = 85
    }
    camera.updateProjectionMatrix()
  }, [section, camera])

  return null
}

export default Experience

import React, { Suspense, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { Sky, Environment, Stage } from "@react-three/drei"
import Castle from "../assets/models/Castle"
import { EffectsTree } from "../components/helpers/EffectsTree"
import CoudsD from "../assets/models/CloudsD"
import { CastleUi } from "../assets/models/CastleUi"
import { Pole } from "../assets/models/Pole"
import { Perf } from "r3f-perf"
import Modeload from "../components/helpers/Modeload"
import { CameraController } from "../components/helpers/CameraController"

function Experience() {
  const [section, setSection] = useState(0)
  const [activeSection, setActiveSection] = useState("nav")
  const [buttonsLocked, setButtonsLocked] = useState(false)
  const [mode, setMode] = useState('menu')

  const handleSectionChange = async (index, sectionName) => {
    if (buttonsLocked) return

    setButtonsLocked(true)
    setSection(index)
    setActiveSection(sectionName)

    // Lock buttons for 1.5 seconds during transition
    await sleep(1500)
    setButtonsLocked(false)
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  return (
    <div>
      <div className="top-0 left-0 w-full h-screen bg-gradient-to-b from-[#bde0fe] to-[#ffafcc] z-0">
        <CastleUi
          section={section}
          onSectionChange={handleSectionChange}
          buttonsLocked={buttonsLocked}
          mode={mode}
          setMode={setMode}
        />
      </div>
      <div className="fixed top-0 left-0 w-full h-screen z-10">
        <Canvas
          shadows
          camera={{
            position: [15.9, 6.8, -11.4],
            fov: 85,
            near: 0.4,
            far: 50
          }}
        >
          <fog attach="fog" args={["#272730", 5, 30]} />
          <Environment
            files="/images/Panorama.hdr"
            background={true}
            blur={0.1}
            envMapIntensity={0.5}
            intensity={0.5}
          />

          {/* Debug Performance Monitor */}
          <Perf position="top-left" />

          {/* Camera System */}
          <CameraController
            section={section}
            activeSection={activeSection}
            mode={mode}
          />

          {/* Scene Content */}
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
              buttonsLocked={buttonsLocked}
              mode={mode}
            />
          </Suspense>

          {/* Post Processing Effects */}
          <EffectsTree />
        </Canvas>
      </div>
    </div>
  )
}

export default Experience
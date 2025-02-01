import React, { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
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
    <div className="absolute top-0 left-0 w-full h-screen bg-gradient-to-b from-[#bde0fe] to-[#ffafcc] z-0">
      <Canvas camera={{ position: [0, 0, 20], fov: 45 }} shadows>
        {/* <fog attach="fog" args={["#272730", 10, 90]} /> */}
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
          <Castle activeSection={activeSection} receiveShadow />
          {/* <CoudsD /> */}
          <Pole
            position={[-1, 0, 4]}
            scale={[1, 1, 1]}
            onSectionChange={handleSectionChange}
            section={section}
          />
        </Suspense>
      </Canvas>

      {/* <CastleUi section={section} onSectionChange={handleSectionChange} /> */}
    </div>
  )
}

export default Experience

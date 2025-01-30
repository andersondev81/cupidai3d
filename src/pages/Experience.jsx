// Experience.jsx
import React, { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import Castle from "../assets/models/Castle"
import { EffectsTree } from "../components/helpers/EffectsTree"
import CoudsD from "../assets/models/CloudsD"
import { Environment, Grid, OrbitControls } from "@react-three/drei"
import { CastleUi } from "../assets/models/CastleUi"
import { Pole } from "../assets/models/Pole"

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
        <ambientLight intensity={0.2} />
        <fog attach="fog" args={["#272730", 0, 90]} />
        <Environment preset="forest" />
        <directionalLight position={[10, 10, 10]} intensity={0.1} />
        <EffectsTree />
        <OrbitControls />
        <Suspense fallback={null}>
          <Castle activeSection={activeSection} />
          <CoudsD />
          <Pole
            position={[-3, -3.44, 8]}
            scale={[5, 5, 5]}
            onSectionChange={handleSectionChange}
            section={section}
          />
        </Suspense>
      </Canvas>
      <CastleUi section={section} onSectionChange={handleSectionChange} />
    </div>
  )
}

export default Experience

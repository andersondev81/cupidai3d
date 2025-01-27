// Experience.jsx
import React, { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import Castle from "../assets/models/proj6/Castle"
import { EffectsTree } from "../components/helpers/EffectsTree"
import CoudsD from "../assets/models/proj6/CloudsD"
import { Grid } from "@react-three/drei"
import { CastleUi } from "../assets/models/proj6/CastleUi"

function Experience() {
  const [section, setSection] = useState(0)
  const [activeSection, setActiveSection] = useState("intro")

  const handleSectionChange = (index, sectionName) => {
    setSection(index)
    setActiveSection(sectionName)
  }

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#bde0fe] to-[#ffafcc] ">
      <Canvas camera={{ position: [0, 0, 20], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <EffectsTree />
        <Suspense fallback={null}>
          <Castle activeSection={activeSection} />
          <CoudsD />

          <Grid
            position={[0, -3.44, 0]} // Posição do grid
            sectionSize={3}
            sectionColor={"purple"}
            sectionThickness={1}
            cellSize={1}
            cellColor={"#6f6f6f"}
            cellThickness={0.6}
            infiniteGrid
            fadeDistance={50}
            fadeStrength={5}
          />
        </Suspense>
      </Canvas>
      <CastleUi section={section} onSectionChange={handleSectionChange} />
    </div>
  )
}

export default Experience

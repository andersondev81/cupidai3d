import React, { Suspense, useState, useCallback } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment } from "@react-three/drei"
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
  const [cameraRef, setCameraRef] = useState(null)

  const handleSectionChange = useCallback((index, sectionName) => {
    setSection(index)
    setActiveSection(sectionName)
  }, [])

  const handleHomeClick = useCallback(() => {
    if (cameraRef) {
      cameraRef.goToHome()
      setSection(0)
      setActiveSection("nav")
    }
  }, [cameraRef])

  return (
    <div>
      <div className="top-0 left-0 w-full h-screen bg-gradient-to-b from-[#bde0fe] to-[#ffafcc] z-0">
        <CastleUi 
          section={section} 
          onSectionChange={handleSectionChange}
        />
      </div>
      
      {/* Home Button */}
      <button 
        onClick={handleHomeClick}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-lg z-50 transition-colors duration-200"
      >
        Home
      </button>

      <div className="fixed top-0 left-0 w-full h-screen z-10">
        <Canvas
          shadows
          camera={{
            fov: 85,
            near: 0.4,
            far: 50,
            position: [15.9, 6.8, -11.4]
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
          <Perf position="top-left" />

          <Suspense fallback={<Modeload />}>
            <CameraController 
              section={section}
              activeSection={activeSection}
              setControlRef={setCameraRef}
            />
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

          <EffectsTree />
        </Canvas>
      </div>
    </div>
  )
}

export default Experience
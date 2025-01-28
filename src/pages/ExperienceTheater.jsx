import React, { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { getProject } from "@theatre/core"
import extension from "@theatre/r3f/dist/extension"
import studio from "@theatre/studio"
import CastleTheater from "../assets/models/CastleTheater"
import { SheetProvider } from "@theatre/r3f" // Add the SheetProvider import

// Initialize studio and extend it
studio.initialize()
studio.extend(extension)

// Get the project and sheet
const project = getProject("castleCinematic")
const mainSheet = project.sheet("Min")

function ExperienceTheater() {
  return (
    <>
      <Canvas
        camera={{ position: [5, 5, 30], fov: 30, near: 1 }}
        gl={{
          preserveDrawingBuffer: true,
        }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <Suspense fallback={null}>
          {/* Wrap with SheetProvider to provide the sheet */}
          <SheetProvider sheet={mainSheet}>
            <CastleTheater />
          </SheetProvider>
        </Suspense>
      </Canvas>
    </>
  )
}

export default ExperienceTheater

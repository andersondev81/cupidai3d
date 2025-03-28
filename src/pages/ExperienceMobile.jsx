// pages/ExperienceMobile.jsx
import React, { useState, useRef, Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, Box, OrbitControls } from "@react-three/drei"
// import Modeload from "../components/helpers/Modeload"


const SimpleTestScene = () => {
  console.log("Rendering SimpleTestScene")
  return (
    <>
      <ambientLight intensity={0.8} />
      <Box position={[0, 0, 0]} args={[1, 1, 1]}>
        <meshStandardMaterial color="hotpink" />
      </Box>
      <Environment preset="sunset" />
      <OrbitControls />
    </>
  )
}

const ExperienceMobile = () => {
  console.log("Rendering ExperienceMobile component")
  const [isLoaded, setIsLoaded] = useState(false)

  // const handleStart = () => {
  //   console.log("Start button clicked")
  //   setIsLoaded(true)
  // }
  // if (!isLoaded) {
    // console.log("Showing loading screen")
    // return (
    //   <div className="relative w-full h-screen">
    //     <Canvas>
    //       {/* <Modeload onStart={handleStart} /> */}
    //     </Canvas>
    //   </div>
    // )
  // }

  return (
    <div className="relative w-full h-screen bg-black">
      <div className="absolute inset-0">
        <Canvas
          className="w-full h-full"
          gl={{
            antialias: false,
            powerPreference: "default"
          }}
          dpr={1}
          camera={{
            fov: 60,
            position: [0, 0, 5]
          }}
        >
          <Suspense fallback={null}>
            <SimpleTestScene />
          </Suspense>
        </Canvas>
      </div>
    </div>
  )
}

export default ExperienceMobile
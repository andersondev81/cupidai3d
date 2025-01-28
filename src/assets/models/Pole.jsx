import React from "react"
import { useGLTF, Html } from "@react-three/drei"
import RotateAxis from "../../components/helpers/RotateAxis"

export function Pole({ onSectionChange, section, ...props }) {
  const { nodes, materials } = useGLTF("/models/Pole.glb")

  return (
    <group {...props} dispose={null}>
      {/* Pole Mesh */}
      <mesh
        geometry={nodes.Pole.geometry}
        material={nodes.Pole.material}
        rotation={[0, Math.PI / 3, 0]}
      />
      <Html position={[0, 0, 0]}>
        <p>Test</p>
      </Html>

      {/* Heart Mesh with Rotation */}
      <group position={[0, 0.892, 0.006]}>
        <RotateAxis axis="y" speed={1} rotationType="euler">
          <mesh
            geometry={nodes.Heart.geometry}
            material={nodes.Heart.material}
            position={[0, 0, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.01}
          />
        </RotateAxis>
        {/* Button inside HTML */}
        <Html position={[0, 0, 0]}>
          <button
            onClick={() => onSectionChange(4, "token")}
            className={`px-4 py-2 rounded-md ${
              section === 4
                ? "bg-blue-500 text-white"
                : "bg-gray-300 text-black"
            }`}
          >
            Token
          </button>
        </Html>
      </group>
    </group>
  )
}

useGLTF.preload("/models/Pole.glb")

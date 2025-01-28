import React from "react"
import { useGLTF } from "@react-three/drei"
import RotateAxis from "../../components/helpers/RotateAxis"

export function Pole(props) {
  const { nodes, materials } = useGLTF("/models/Pole.glb")
  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.Pole.geometry}
        material={nodes.Pole.material}
        rotation={[0, Math.PI / 3, 0]}
      />

      <RotateAxis axis="y" speed={1} rotationType="euler">
        <mesh
          geometry={nodes.Heart.geometry}
          material={nodes.Heart.material}
          position={[0, 0.892, 0.006]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.01}
        />
      </RotateAxis>
    </group>
  )
}

useGLTF.preload("/models/Pole.glb")

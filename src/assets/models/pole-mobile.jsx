// // assets/models/PoleMobile.jsx
// import React, { useMemo } from "react"
// import { useGLTF } from "@react-three/drei"
// import * as THREE from "three"
// import RotateAxis from "../../components/helpers/RotateAxis"

// // Simplified version of Pole for mobile devices
// export function PoleMobile({ onSectionChange, ...props }) {
//   const { nodes } = useGLTF("/models/Pole.glb")

//   // Simplified materials that don't require complex texture loading
//   const poleMaterial = useMemo(() => {
//     return new THREE.MeshStandardMaterial({
//       color: new THREE.Color(0xeeeeee),
//       roughness: 0.6,
//       metalness: 0.8,
//       side: THREE.DoubleSide,
//     })
//   }, [])

//   const heartsMaterial = useMemo(() => {
//     return new THREE.MeshStandardMaterial({
//       color: new THREE.Color(0x00bdff),
//       emissive: new THREE.Color(0x00bdff),
//       emissiveIntensity: 1,
//       roughness: 0.4,
//       metalness: 0.8,
//       side: THREE.DoubleSide,
//     })
//   }, [])

//   // Simplified click handler
//   const handleSectionClick = (sectionIndex, sectionName) => (e) => {
//     e.stopPropagation()
//     console.log(`Mobile Pole: Clicked on section ${sectionName}`)

//     if (onSectionChange && typeof onSectionChange === 'function') {
//       onSectionChange(sectionIndex, sectionName)
//     }
//   }

//   // Pointer event handlers
//   const pointerHandlers = {
//     onPointerEnter: (e) => {
//       e.stopPropagation()
//       document.body.style.cursor = "pointer"
//     },
//     onPointerLeave: (e) => {
//       e.stopPropagation()
//       document.body.style.cursor = "default"
//     }
//   }

//   // Check if nodes exist
//   if (!nodes || !nodes.pole) {
//     console.warn("PoleMobile: Pole nodes not loaded properly")
//     return null
//   }

//   return (
//     <group {...props} dispose={null}>
//       <group position={[0.2, -0.35, -0.2]} rotation={[0, Math.PI + 5, 0]}>
//         {/* Main pole */}
//         <mesh geometry={nodes.pole.geometry} material={poleMaterial} />

//         {/* Interactive sections */}
//         {nodes.aidatingcoach && (
//           <mesh
//             geometry={nodes.aidatingcoach.geometry}
//             material={heartsMaterial}
//             onClick={handleSectionClick(2, "aidatingcoach")}
//             {...pointerHandlers}
//           />
//         )}

//         {nodes.roadmap && (
//           <mesh
//             geometry={nodes.roadmap.geometry}
//             material={heartsMaterial}
//             onClick={handleSectionClick(5, "roadmap")}
//             {...pointerHandlers}
//           />
//         )}

//         {nodes.download && (
//           <mesh
//             geometry={nodes.download.geometry}
//             material={heartsMaterial}
//             onClick={handleSectionClick(3, "download")}
//             {...pointerHandlers}
//           />
//         )}

//         {nodes.about && (
//           <mesh
//             geometry={nodes.about.geometry}
//             material={heartsMaterial}
//             onClick={handleSectionClick(1, "about")}
//             {...pointerHandlers}
//           />
//         )}

//         {/* Token with rotation */}
//         <group position={[-0.014, 2.547, -0.003]}>
//           <RotateAxis axis="y" speed={1}>
//             {nodes.token && (
//               <mesh
//                 geometry={nodes.token.geometry}
//                 material={heartsMaterial}
//                 onClick={handleSectionClick(4, "token")}
//                 {...pointerHandlers}
//               />
//             )}
//           </RotateAxis>
//         </group>
//       </group>
//     </group>
//   )
// }

// // Preload to improve performance
// useGLTF.preload("/models/Pole.glb")
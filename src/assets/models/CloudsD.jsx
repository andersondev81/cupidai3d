import React, { useRef, useState, useEffect } from "react"
import { Cloud } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"

function CloudsD() {
  const [intensity, setIntensity] = useState(120)
  const lightRefRed = useRef()
  const lightRefBlue = useRef()

  // Atualiza a intensidade da luz a cada intervalo aleatório
  useEffect(() => {
    const minIntensity = 0.6
    const maxIntensity = 3
    const interval = setInterval(() => {
      const newIntensity =
        Math.random() * (maxIntensity - minIntensity) + minIntensity
      setIntensity(newIntensity)
    }, Math.random() * (500 - 200) + 200) // Intervalo entre 200ms e 500ms

    return () => clearInterval(interval) // Limpa o intervalo quando o componente for desmontado
  }, [])

  // Aplica a intensidade da luz no frame atual
  useFrame(() => {
    if (lightRefRed.current) {
      lightRefRed.current.intensity = intensity
    }
    if (lightRefBlue.current) {
      lightRefBlue.current.intensity = intensity
    }
  })

  return (
    <group>
      {/* Luz Direcional - Fixa e não muda com a intensidade aleatória */}
      {/* <directionalLight
        position={[10, 10, 10]}
        intensity={0.2}
        castShadow={true}
      /> */}

      {/* Luz Vermelha com Intensidade Variável */}
      <spotLight
        ref={lightRefRed}
        color="#fb6f92"
        position={[5, 6, 5]}
        angle={0.5}
        decay={0.85}
        distance={55}
        penumbra={-1}
        intensity={intensity}
        castShadow={true}
      />

      {/* Luz Azul com Intensidade Variável */}
      <spotLight
        ref={lightRefBlue}
        position={[0, -6, 0]}
        color="#fb6f92"
        angle={0.4}
        decay={0.55}
        distance={85}
        penumbra={4}
        intensity={intensity}
        castShadow={true}
      />

      {/* Nuvens com Efeito de Raio e Outras Configurações */}
      <Cloud
        position={[0, -2, 0]}
        speed={0.5}
        opacity={0.8}
        width={1}
        depth={1}
        segments={26}
        color={"#fff"}
        lightning={true}
        rayleigh={0.01}
        noise={4}
        bounds={[16, 1, 12]}
        fade={40}
        growth={4}
        scale={[1, 1, 1]}
        seed={8}
        concentrate="center"
        receiveShadow={true}
      />
    </group>
  )
}

export default CloudsD

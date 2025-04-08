const FogEffect = () => {
  const materialRef = useRef()

  useFrame(state => {
    if (materialRef.current) {
      materialRef.current.time = state.clock.getElapsedTime()
    }
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} scale={100}>
      <planeGeometry args={[1000, 1000]} />
      <customFogMaterial ref={materialRef} />
    </mesh>
  )
}

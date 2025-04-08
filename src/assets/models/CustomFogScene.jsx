import React, { useRef, useEffect } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useControls } from "leva"

const Fog = () => {
  const fogBoxRef = useRef()
  const noise = useRef(0)
  const { scene, camera } = useThree()

  const {
    fogColor,
    fogHeight,
    fogDensity,
    fogSpeed,
    fogNoiseIntensity,
    fogScaleX,
    fogScaleY,
    fogScaleZ,
    fogOctaves,
    fogPersistence,
    fogLacunarity,
    fogFalloff,
    fogEdgeSoftness,
    fogNear,
    fogFar,
  } = useControls("Ground Fog", {
    fogColor: "#d0dee7",
    fogHeight: { value: 0.5, min: -2, max: 5, step: 0.1 },
    fogScaleX: { value: 10, min: 1, max: 50, step: 0.1 },
    fogScaleY: { value: 1, min: 0.1, max: 10, step: 0.1 },
    fogScaleZ: { value: 10, min: 1, max: 50, step: 0.1 },
    fogDensity: { value: 0.74, min: 0.1, max: 1, step: 0.01 },
    fogSpeed: { value: 0.34, min: 0, max: 0.5, step: 0.01 },
    fogNoiseIntensity: { value: 5.16, min: 0, max: 10, step: 0.01 },
    fogOctaves: { value: 3, min: 1, max: 8, step: 1 },
    fogPersistence: { value: 0.5, min: 0.1, max: 1, step: 0.05 },
    fogLacunarity: { value: 2.0, min: 1.0, max: 4.0, step: 0.1 },
    fogFalloff: { value: 1.0, min: 0.1, max: 3.0, step: 0.1 },
    fogEdgeSoftness: { value: 0.5, min: 0.1, max: 1.0, step: 0.05 },
    fogNear: { value: 1.0, min: 0, max: 10, step: 0.1 },
    fogFar: { value: 10.0, min: 0, max: 50, step: 0.1 },
  })

  useEffect(() => {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        fogColor: { value: new THREE.Color(fogColor) },
        density: { value: fogDensity },
        noiseIntensity: { value: fogNoiseIntensity },
        octaves: { value: fogOctaves },
        persistence: { value: fogPersistence },
        lacunarity: { value: fogLacunarity },
        falloff: { value: fogFalloff },
        edgeSoftness: { value: fogEdgeSoftness },
        scaleX: { value: fogScaleX },
        scaleY: { value: fogScaleY },
        scaleZ: { value: fogScaleZ },
        cameraPos: { value: camera.position },
        fogNear: { value: fogNear },
        fogFar: { value: fogFar },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec4 vWorldPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          vWorldPosition = modelMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 fogColor;
        uniform float density;
        uniform float noiseIntensity;
        uniform float time;
        uniform int octaves;
        uniform float persistence;
        uniform float lacunarity;
        uniform float falloff;
        uniform float edgeSoftness;
        uniform float scaleX;
        uniform float scaleY;
        uniform float scaleZ;
        uniform vec3 cameraPos;
        uniform float fogNear;
        uniform float fogFar;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec4 vWorldPosition;
        
        float rand(vec2 n) { 
          return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
        }
        
        float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 u = fract(p);
          u = u*u*(3.0-2.0*u);
          
          float res = mix(
            mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
            mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), 
            u.y);
          return res*res;
        }
        
        float fbm(vec2 x) {
          float total = 0.0;
          float frequency = 1.0;
          float amplitude = 1.0;
          float maxAmplitude = 0.0;
          
          for(int i = 0; i < 8; i++) {
            if(i >= octaves) break;
            total += noise(x * frequency) * amplitude;
            maxAmplitude += amplitude;
            frequency *= lacunarity;
            amplitude *= persistence;
          }
          
          return total / maxAmplitude;
        }
        
        void main() {
          // Base noise with movement
          vec2 uv = vUv * 5.0 + vec2(time * 0.1, time * 0.05);
          float n = fbm(uv) * noiseIntensity;
          
          // Edge falloff
          vec2 center = vUv - 0.5;
          float dist = length(center) * 2.0;
          float edge = smoothstep(1.0 - edgeSoftness, 1.0, dist);
          
          // Distance from camera to fragment in world space
          float fragDistance = distance(vWorldPosition.xyz, cameraPos);
          
          // Fog depth effect (simple version)
          float depthEffect = smoothstep(fogNear, fogFar, fragDistance);
          
          // Combine effects
          float alpha = density * (0.5 + n * 0.5) * pow(1.0 - edge, falloff) * depthEffect;
          
          gl_FragColor = vec4(fogColor, alpha * alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })

    const box = new THREE.Mesh(geometry, material)
    box.position.y = fogHeight
    box.scale.set(fogScaleX, fogScaleY, fogScaleZ)
    fogBoxRef.current = box
    scene.add(box)

    return () => {
      if (fogBoxRef.current) {
        scene.remove(fogBoxRef.current)
      }
    }
  }, [
    scene,
    fogColor,
    fogHeight,
    fogDensity,
    fogNoiseIntensity,
    fogScaleX,
    fogScaleY,
    fogScaleZ,
    fogOctaves,
    fogPersistence,
    fogLacunarity,
    fogFalloff,
    fogEdgeSoftness,
    fogNear,
    fogFar,
    camera.position,
  ])

  useFrame(() => {
    if (fogBoxRef.current) {
      noise.current += fogSpeed * 0.01
      fogBoxRef.current.material.uniforms.time.value = noise.current
      fogBoxRef.current.position.y = fogHeight
      fogBoxRef.current.scale.set(fogScaleX, fogScaleY, fogScaleZ)
      fogBoxRef.current.material.uniforms.cameraPos.value = camera.position
    }
  })

  return null
}

export default Fog

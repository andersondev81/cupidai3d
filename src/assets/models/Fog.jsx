import React, { useRef, useEffect } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { useControls } from "leva"

const Fog = () => {
  const fogRef = useRef()
  const noise = useRef(0)
  const { scene, camera } = useThree()

  const {
    fogColor,
    groundColor,
    fogHeight,
    fogDensity,
    fogSpeed,
    fogNoiseScale,
    fogNoiseIntensity,
    fogNear,
    fogFar,
    fogHeightFalloff,
    fogTurbulence,
    fogWidth,
    fogDepth,
    fogThickness,
  } = useControls("Fog Settings", {
    fogColor: "#f0f5f5",
    groundColor: "#d0dee7",
    fogHeight: { value: 0.5, min: -10, max: 5, step: 0.1 },
    fogDensity: { value: 0.5, min: 0.1, max: 1, step: 0.01 },
    fogSpeed: { value: 0.2, min: 0, max: 1, step: 0.01 },
    fogNoiseScale: { value: 0.05, min: 0.001, max: 1, step: 0.001 },
    fogNoiseIntensity: { value: 1.0, min: 0.1, max: 2, step: 0.05 },
    fogNear: { value: 5.0, min: 0, max: 50, step: 0.1 },
    fogFar: { value: 50.0, min: 0, max: 200, step: 0.1 },
    fogHeightFalloff: { value: 2.0, min: 0.1, max: 5.0, step: 0.1 },
    fogTurbulence: { value: 1.5, min: 0.5, max: 3.0, step: 0.1 },
    fogWidth: { value: 50, min: 10, max: 100, step: 1 },
    fogDepth: { value: 50, min: 10, max: 100, step: 1 },
    fogThickness: { value: 20, min: 5, max: 50, step: 1 },
  })

  useEffect(() => {
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        fogColor: { value: new THREE.Color(fogColor) },
        groundColor: { value: new THREE.Color(groundColor) },
        density: { value: fogDensity },
        noiseScale: { value: fogNoiseScale },
        noiseIntensity: { value: fogNoiseIntensity },
        bounds: { value: new THREE.Vector3(fogWidth, fogThickness, fogDepth) },
        cameraPos: { value: camera.position },
        fogNear: { value: fogNear },
        fogFar: { value: fogFar },
        heightFalloff: { value: fogHeightFalloff },
        turbulence: { value: fogTurbulence },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vLocalPosition;
        void main() {
          vLocalPosition = position;
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 fogColor;
        uniform vec3 groundColor;
        uniform float density;
        uniform float time;
        uniform float noiseScale;
        uniform float noiseIntensity;
        uniform vec3 bounds;
        uniform vec3 cameraPos;
        uniform float fogNear;
        uniform float fogFar;
        uniform float heightFalloff;
        uniform float turbulence;
        
        varying vec3 vWorldPosition;
        varying vec3 vLocalPosition;
        
        // Simplex Noise 3D Implementation
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          
          i = mod289(i);
          vec4 p = permute(permute(permute(
                   i.z + vec4(0.0, i1.z, i2.z, 1.0))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3)));
        }
        
        void main() {
          // Normalized position within the volume
          vec3 pos = vWorldPosition * noiseScale;
          
          // Time-animated noise with turbulence
          float noise = snoise(vec3(
            pos.x + time * 0.1,
            pos.y * turbulence + time * 0.05,
            pos.z - time * 0.08
          ));
          
          // Height-based fog density (more fog near the ground)
          float heightFactor = 1.0 - smoothstep(0.0, heightFalloff, vWorldPosition.y / bounds.y);
          
          // Distance-based fog density
          float distance = length(vWorldPosition - cameraPos);
          float depthFactor = smoothstep(fogNear, fogFar, distance);
          
          // Combine all factors
          float fogAmount = density * 
                           (0.5 + 0.5 * noise * noiseIntensity) * 
                           heightFactor * 
                           depthFactor;
          
          // Blend between ground color (bottom) and fog color (top)
          vec3 finalColor = mix(groundColor, fogColor, smoothstep(0.0, 1.0, vWorldPosition.y / bounds.y));
          
          gl_FragColor = vec4(finalColor, fogAmount);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.SrcAlphaFactor,
      blendDst: THREE.OneMinusSrcAlphaFactor,
    })

    const fogVolume = new THREE.Mesh(geometry, material)
    fogVolume.scale.set(fogWidth, fogThickness, fogDepth)
    fogVolume.position.y = fogHeight
    fogRef.current = fogVolume
    scene.add(fogVolume)

    return () => {
      if (fogRef.current) {
        scene.remove(fogRef.current)
      }
    }
  }, [
    scene,
    fogColor,
    groundColor,
    fogHeight,
    fogDensity,
    fogSpeed,
    fogNoiseScale,
    fogNoiseIntensity,
    fogNear,
    fogFar,
    fogHeightFalloff,
    fogTurbulence,
    fogWidth,
    fogDepth,
    fogThickness,
    camera.position,
  ])

  useFrame(() => {
    if (fogRef.current) {
      noise.current += fogSpeed * 0.01
      fogRef.current.material.uniforms.time.value = noise.current
      fogRef.current.position.y = fogHeight
      fogRef.current.material.uniforms.cameraPos.value = camera.position
    }
  })

  return null
}

export default Fog

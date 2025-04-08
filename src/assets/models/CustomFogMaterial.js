// CustomFogMaterial.js
import * as THREE from "three"

class CustomFogMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        fogColor: { value: new THREE.Color(0xd0dee7) },
        fogNear: { value: 1 },
        fogFar: { value: 50 },
      },
      vertexShader: `
        varying float vFogDepth;
        void main() {
          vFogDepth = -mvPosition.z;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 fogColor;
        uniform float fogNear;
        uniform float fogFar;
        varying float vFogDepth;
        
        void main() {
          float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);
          gl_FragColor = vec4(mix(gl_FragColor.rgb, fogColor, fogFactor), 1.0);
        }
      `,
    })
  }
}

// Then extend it for R3F
extend({ CustomFogMaterial })

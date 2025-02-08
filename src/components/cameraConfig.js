import * as THREE from "three"

export const CAMERA_CONFIG = {
  sections: {
    intro: {
      position: new THREE.Vector3(0, 0, 20),
      fov: 85,
      lerpFactor: 0.1,
      transition: {
        zOffset: 0, // Valor aumentado para intro
        fovMultiplier: 0.3,
      },
    },
    section1: {
      position: new THREE.Vector3(-5, 3, 15),
      fov: 50,
      lerpFactor: 0.08, // Lerp mais rápido
      transition: {
        zOffset: -8000, // Valor negativo para efeito inverso
        fovMultiplier: 0.8,
      },
    },
    section2: {
      position: new THREE.Vector3(5, 2, 20),
      fov: 50,
      lerpFactor: 0.12, // Lerp mais lento
      transition: {
        zOffset: 150, // Maior afastamento
        fovMultiplier: 0.2,
      },
    },
    section3: {
      position: new THREE.Vector3(5, 2, 20),
      fov: 50,
      lerpFactor: 0.12, // Lerp mais lento
      transition: {
        zOffset: 150, // Maior afastamento
        fovMultiplier: 0.2,
      },
    },
    section4: {
      position: new THREE.Vector3(5, 2, 20),
      fov: 50,
      lerpFactor: 0.12, // Lerp mais lento
      transition: {
        zOffset: 150, // Maior afastamento
        fovMultiplier: 0.2,
      },
    },
    section5: {
      position: new THREE.Vector3(5, 2, 20),
      fov: 50,
      lerpFactor: 0.12, // Lerp mais lento
      transition: {
        zOffset: 150, // Maior afastamento
        fovMultiplier: 0.2,
      },
    },
  },

  transitions: {
    intensity: 0.015,
    curve: t => Math.pow(t, 1.5), // Curva personalizada
  },
}

/**
 * @typedef {keyof typeof CAMERA_CONFIG.sections} CameraSectionKey
 */

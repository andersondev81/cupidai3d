import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';

export function CameraController({ section, activeSection }) {
  const controlsRef = useRef();
  const { camera } = useThree();

  // Configurar câmera inicial
  useEffect(() => {
    if (!controlsRef.current) return;

    // Configurações iniciais da câmera
    camera.position.set(15.9, 6.8, -11.4);
    camera.updateProjectionMatrix();

    // Configurações iniciais dos controles
    controlsRef.current.setLookAt(
      15.9, 6.8, -11.4, // posição inicial da câmera
      0, 0, -1,         // target inicial
      true              // animate
    );

    // Configurações dos controles
    controlsRef.current.minDistance = 7;
    controlsRef.current.maxDistance = 16;
    controlsRef.current.minPolarAngle = Math.PI * 0.2;
    controlsRef.current.maxPolarAngle = Math.PI * 0.55;
  }, []);

  // Atualizar FOV baseado na seção
  useEffect(() => {
    if (section !== 0) {
      camera.fov = 50;
    } else {
      camera.fov = 85;
    }
    camera.updateProjectionMatrix();
  }, [section]);

  // Gerenciar transições baseadas na seção ativa
  useEffect(() => {
    if (!controlsRef.current || !activeSection) return;

    const positions = {
      nav: {
        camera: [-0.2, 1.25, 6.61],
        target: [-0.98, 0.42, 0.99]
      },
      about: {
        camera: [1.82, 1.12, -0.92],
        target: [0.17, 1.04, -0.08]
      },
      aidatingcoach: {
        camera: [-1.94, 1.11, -0.91],
        target: [-0.09, 1.10, -0.02]
      },
      download: {
        camera: [1.82, 1.12, -0.92],
        target: [0.17, 1.04, -0.08]
      },
      token: {
        camera: [2.07, 1.14, 1.06],
        target: [-1.21, 0.85, -0.59]
      },
      roadmap: {
        camera: [-2.02, 1.06, 1.02],
        target: [0.03, 0.85, -0.08]
      }
    };

    const position = positions[activeSection];
    if (position) {
      controlsRef.current.setLookAt(
        ...position.camera,
        ...position.target,
        true // animate
      );
    }
  }, [activeSection]);

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      enabled={true}
      dampingFactor={0.05}
      draggingDampingFactor={0.25}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      minPolarAngle={Math.PI * 0.2}
      maxPolarAngle={Math.PI * 0.55}
    />
  );
}

export default CameraController;

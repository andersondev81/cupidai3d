import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import gsap from 'gsap';

export function CameraController({ section, activeSection, setControlRef }) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const transitionInProgress = useRef(false);

  const defaultPosition = {
    position: [15.9, 6.8, -11.4],
    target: [0, 0, -1],
    fov: 85
  };

  const positions = {
    nav: {
      position: [-0.2103522192481445, 1.2574828480413, 6.6116302965978795],
      target: [-0.9890312015091309, 0.4268755440775639, 0.9932335568532257],
      fov: 85
    },
    about: {
      position: [1.8294030001912027, 1.1241952974854004, -0.9268222253732308],
      target: [0.1723786308639481, 1.0468291516427397, -0.08072363062511172],
      fov: 50
    },
    aidatingcoach: {
      position: [-1.9468169564117694, 1.113027069977164, -0.911424661981317],
      target: [-0.09357930670354468, 1.1076978075751573, -0.020089366705025195],
      fov: 50
    },
    download: {
      position: [1.8294030001912027, 1.1241952974854004, -0.9268222253732308],
      target: [0.1723786308639481, 1.0468291516427397, -0.08072363062511172],
      fov: 50
    },
    token: {
      position: [2.0799027767746923, 1.1492603137264552, 1.0627122850364636],
      target: [-1.2102179925739383, 0.8585880494001786, -0.5986556331928229],
      fov: 50
    },
    roadmap: {
      // Nova posição mais afastada para o roadmap
      position: [-3.5, 1.5, 3.0],
      // Ajustando o target para manter o foco no objeto
      target: [0, 0.8, 0],
      fov: 60  // FOV um pouco maior para melhor visualização
    }
  };

  const lockCamera = () => {
    if (!controlsRef.current) return;
    
    controlsRef.current.dispose();
    controlsRef.current.enabled = false;
    controlsRef.current.enableRotate = false;
    controlsRef.current.enableZoom = false;
    controlsRef.current.enablePan = false;
    controlsRef.current.enableDamping = false;
    
    controlsRef.current.removeAllEventListeners?.();
    
    controlsRef.current.minDistance = controlsRef.current.maxDistance = 1;
    controlsRef.current.minPolarAngle = controlsRef.current.maxPolarAngle = Math.PI / 2;
    controlsRef.current.minAzimuthAngle = controlsRef.current.maxAzimuthAngle = 0;
    
    controlsRef.current.mouseButtons = {
      left: null,
      middle: null,
      right: null,
      wheel: null
    };
    
    controlsRef.current.touches = {
      one: null,
      two: null,
      three: null
    };
  };

  const transitionToPosition = (sectionName) => {
    if (!controlsRef.current || transitionInProgress.current) return;

    const position = positions[sectionName] || defaultPosition;
    transitionInProgress.current = true;

    lockCamera();

    gsap.to(camera, {
      fov: position.fov,
      duration: 1,
      onUpdate: () => {
        camera.updateProjectionMatrix();
        lockCamera();
      }
    });

    gsap.to(camera.position, {
      duration: 1.5,
      x: position.position[0],
      y: position.position[1],
      z: position.position[2],
      ease: "power2.inOut",
      onUpdate: lockCamera,
      onComplete: () => {
        lockCamera();
        transitionInProgress.current = false;
      }
    });

    gsap.to(controlsRef.current.target, {
      duration: 1.5,
      x: position.target[0],
      y: position.target[1],
      z: position.target[2],
      ease: "power2.inOut",
      onUpdate: lockCamera,
      onComplete: lockCamera
    });
  };

  useEffect(() => {
    if (!controlsRef.current) return;

    controlsRef.current.setLookAt(
      defaultPosition.position[0],
      defaultPosition.position[1],
      defaultPosition.position[2],
      defaultPosition.target[0],
      defaultPosition.target[1],
      defaultPosition.target[2],
      false
    );

    lockCamera();

    const interval = setInterval(lockCamera, 16);

    setControlRef({
      goToHome: () => {
        transitionToPosition('nav');
      }
    });

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeSection) {
      transitionToPosition(activeSection);
    }
  }, [activeSection]);

  useEffect(() => {
    lockCamera();
  }, [camera.position.x, camera.position.y, camera.position.z]);

  return (
    <CameraControls
      ref={controlsRef}
      makeDefault
      enabled={false}
      minPolarAngle={Math.PI / 2}
      maxPolarAngle={Math.PI / 2}
      minAzimuthAngle={0}
      maxAzimuthAngle={0}
      minDistance={1}
      maxDistance={1}
      mouseButtons={{
        left: null,
        middle: null,
        right: null,
        wheel: null
      }}
      touches={{
        one: null,
        two: null,
        three: null
      }}
      onUpdate={lockCamera}
    />
  );
}

export default CameraController;
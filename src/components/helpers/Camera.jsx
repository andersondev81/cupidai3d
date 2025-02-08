import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import gsap from 'gsap';

const config = {
  vertical: false,
  aboutMeDistance: 2.2,
  projectsDistance: 4.2
};

export function Camera() {
  const controls = useRef();
  const { camera } = useThree();
  const debug = false;

  const setInstance = () => {
    camera.fov = 75;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.near = 0.4;
    camera.far = 50;
    camera.position.x = 15.9;
    camera.position.y = 6.8;
    camera.position.z = -11.4;
    camera.updateProjectionMatrix();
  };

  const setCamAngles = () => {
    if (!controls.current) return;

    // Default
    const setDefaultAngles = () => {
      controls.current.minDistance = 7;
      controls.current.maxDistance = 16;
      controls.current.minAzimuthAngle = 0;
      controls.current.maxAzimuthAngle = Math.PI * 1.9999;
      controls.current.minPolarAngle = Math.PI * 0.2;
      controls.current.maxPolarAngle = Math.PI * 0.55;
    };

    // Vending Machine
    const setVendingMachineAngles = () => {
      controls.current.minDistance = 2;
      controls.current.maxDistance = 3.5;
      controls.current.minAzimuthAngle = -(Math.PI * 0.1);
      controls.current.maxAzimuthAngle = Math.PI * 0.1;
      controls.current.minPolarAngle = Math.PI * 0.4;
      controls.current.maxPolarAngle = Math.PI * 0.53;
    };

    // About Me
    const setAboutMeAngles = () => {
      controls.current.minDistance = 1;
      controls.current.maxDistance = config.aboutMeDistance;
      controls.current.minAzimuthAngle = -(Math.PI * 0.2);
      controls.current.maxAzimuthAngle = Math.PI * 0.2;
      controls.current.minPolarAngle = Math.PI * 0.3;
      controls.current.maxPolarAngle = Math.PI * 0.65;
    };

    // Credits
    const setCreditsAngles = () => {
      controls.current.minDistance = 1.5;
      controls.current.maxDistance = 2.5;
      controls.current.minAzimuthAngle = -(Math.PI * 0.2);
      controls.current.maxAzimuthAngle = Math.PI * 0.2;
      controls.current.minPolarAngle = Math.PI * 0.3;
      controls.current.maxPolarAngle = Math.PI * 0.65;
    };

    return {
      default: setDefaultAngles,
      vendingMachine: setVendingMachineAngles,
      aboutMe: setAboutMeAngles,
      credits: setCreditsAngles
    };
  };

  const setTransitions = () => {
    if (!controls.current) return;

    const transitionTo = (position, target, duration = 1.5) => {
      controls.current.enabled = false;

      gsap.to(camera.position, {
        duration,
        x: position.x,
        y: position.y,
        z: position.z,
        ease: "power1.inOut",
        onUpdate: () => camera.updateProjectionMatrix()
      });

      gsap.to(controls.current.target, {
        duration,
        x: target.x,
        y: target.y,
        z: target.z,
        ease: "power1.inOut",
        onComplete: () => {
          controls.current.enabled = true;
        }
      });
    };

    return {
      vendingMachine: (duration) => transitionTo(
        { x: 1.15, y: -1.2, z: config.projectsDistance },
        { x: 1.15, y: -1.2, z: 1.7 },
        duration
      ),
      default: (duration) => transitionTo(
        { x: -11.1, y: -1, z: -7.6 },
        { x: 0, y: 0, z: -1 },
        duration
      ),
      jZhou: (duration) => transitionTo(
        { x: -10.2, y: 6.3, z: 3.8 },
        { x: 0, y: 0, z: -1 },
        duration
      ),
      aboutMe: (duration) => transitionTo(
        { x: 0.66, y: 3.8, z: config.aboutMeDistance },
        { x: 0.66, y: 3.8, z: 0.7 },
        duration
      ),
      credits: (duration) => transitionTo(
        { x: -0.6, y: -1.05, z: 3.8 },
        { x: -0.6, y: -1.05, z: 2.2 },
        duration
      )
    };
  };

  useEffect(() => {
    if (!controls.current) return;
    
    setInstance();
    const angles = setCamAngles();
    angles.default();

    // Debug controls
    if (debug) {
      console.log('Camera position:', camera.position);
      console.log('Camera target:', controls.current.target);
    }
  }, []);

  return (
    <CameraControls
      ref={controls}
      enabled={true}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={1.2}
      zoomSpeed={0.8}
      minPolarAngle={Math.PI * 0.2}
      maxPolarAngle={Math.PI * 0.55}
      enableRotate={false}
      enableZoom={false}
      enablePan={false}
    />
  );
}

export default Camera;
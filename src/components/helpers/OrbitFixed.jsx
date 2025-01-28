"use client";
import React from "react";
import { OrbitControls } from "@react-three/drei";
import { useControls } from "leva";

const OrbitFixed = () => {
  const {
    enableCameraControls,
    enablePan, // Controla o pan da câmera
    smoothTime,
    maxPolarAngle,
    minAzimuthAngle,
    maxAzimuthAngle,
    minDistance,
    maxDistance,
    enableRotate, // Habilita a rotação
    enableZoom,   // Habilita o zoom
  } = useControls("cameraControls", {
    enablePan: { value: false }, // Desabilita o pan
    enableCameraControls: { value: true },
    smoothTime: { value: 1, min: 0.1, max: 2, step: 0.1 },
    maxPolarAngle: { value: Math.PI / 2, min: 0, max: Math.PI, step: 0.1 },
    minAzimuthAngle: { value: -Math.PI / 4, min: -Math.PI, max: Math.PI, step: 0.1 },
    maxAzimuthAngle: { value: Math.PI / 4, min: -Math.PI, max: Math.PI, step: 0.1 },
    minDistance: { value: 50, min: 10, max: 200 },
    maxDistance: { value: 150, min: 100, max: 500 },
    enableRotate: { value: true }, // Habilita a rotação
    enableZoom: { value: true },   // Habilita o zoom
  });

  // Se os controles de câmera não estiverem habilitados, não renderiza nada
  if (!enableCameraControls) return null;

  return (
    <OrbitControls
      enablePan={enablePan} // O pan é desabilitado
      smoothTime={smoothTime}
      maxPolarAngle={maxPolarAngle}
      minAzimuthAngle={minAzimuthAngle}
      maxAzimuthAngle={maxAzimuthAngle}
      minDistance={minDistance}
      maxDistance={maxDistance}
      enableRotate={enableRotate} // Habilita a rotação
      enableZoom={enableZoom}     // Habilita o zoom
    />
  );
};

export default OrbitFixed;

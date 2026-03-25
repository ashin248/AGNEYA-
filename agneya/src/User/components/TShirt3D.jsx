// src/components/TShirt3D.jsx
import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Environment,
  useGLTF,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";
import "../style/TShirt3D.css";

const MODEL_PATH = "/models/tshirt.glb"; 

function TShirtModel({ fabricCanvas }) {
  const { scene } = useGLTF(MODEL_PATH);
  const modelRef = useRef();

  // Create texture from Fabric.js canvas
  const canvasTexture = useMemo(() => {
    if (!fabricCanvas) return null;
    const canvasElement = fabricCanvas.getElement();
    const texture = new THREE.CanvasTexture(canvasElement);
    texture.flipY = false; 
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, [fabricCanvas]);

  // Apply texture to any material that looks like a shirt
  useEffect(() => {
    if (!canvasTexture || !scene) return;
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const materialName = child.material.name.toLowerCase();
        if (materialName.includes("shirt") || 
            materialName.includes("fabric") ||
            materialName.includes("material")) {
          child.material.map = canvasTexture;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [canvasTexture, scene]);

  useFrame((state) => {
    if (modelRef.current) {
      modelRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
    }
  });

  return (
    <group ref={modelRef} dispose={null} scale={1.5} position={[0, -1, 0]}>
      <primitive object={scene} />
    </group>
  );
}

export function TShirt3D({ fabricCanvas, className = "" }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    useGLTF.preload(MODEL_PATH);
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`tshirt-3d-wrapper ${className}`}>
      {loading && (
        <div className="tshirt-loading">
          <div className="tshirt-loading-spinner" />
          <div className="tshirt-loading-text">Loading 3D Studio...</div>
        </div>
      )}

      <div className="tshirt-canvas-container">
        <Canvas
          shadows
          camera={{ position: [0, 0, 5], fov: 45 }}
        >
          <ambientLight intensity={0.8} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <Environment preset="city" />
          <TShirtModel fabricCanvas={fabricCanvas} />
          <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
          <OrbitControls 
            enableZoom={true} 
            minPolarAngle={Math.PI / 4} 
            maxPolarAngle={Math.PI / 1.5} 
          />
        </Canvas>
      </div>

      <div className="tshirt-hint">Drag to rotate • Scroll to zoom</div>
    </div>
  );
}
export default TShirt3D;

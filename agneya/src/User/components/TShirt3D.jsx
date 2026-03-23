import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Environment, Float } from "@react-three/drei";
import * as THREE from "three";

const TShirtModel = ({ texture }) => {
  const meshRef = useRef();
  
  // Create a simple T-shirt-like geometry (or just a stylized plane for now)
  // In a real app, you'd load a GLTF model here.
  // Update texture on each frame
  useFrame(() => {
    if (texture) texture.needsUpdate = true;
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <planeGeometry args={[3, 4]} />
        <meshStandardMaterial 
          map={texture} 
          transparent 
          side={THREE.DoubleSide}
          roughness={0.5}
        />
      </mesh>
    </Float>
  );
};

const TShirt3D = ({ fabricCanvas }) => {
  const texture = useMemo(() => {
    if (!fabricCanvas) return null;
    const tex = new THREE.CanvasTexture(fabricCanvas.getElement());
    tex.needsUpdate = true;
    return tex;
  }, [fabricCanvas]);

  // Update texture on each frame if fabricCanvas changes
  // MOVED to TShirtModel

  return (
    <div style={{ width: "100%", height: "400px", background: "#f0f0f0", borderRadius: "12px", overflow: "hidden" }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Environment preset="city" />
        <TShirtModel texture={texture} />
        <OrbitControls enableZoom={true} />
        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
      </Canvas>
    </div>
  );
};

export default TShirt3D;

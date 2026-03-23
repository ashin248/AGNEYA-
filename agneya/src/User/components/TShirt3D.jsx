// src/components/TShirt3D.jsx
import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Environment,
  useGLTF,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";
import '../style/TShirt3D.css'

const MODEL_PATH = "/models/tshirt.glb"; // ← Change this to your actual GLTF/GLB path
// Example free models: https://sketchfab.com (search "t-shirt low poly glb")
// Or create in Blender and export with UVs ready for texture

const TShirtModel = ({ fabricCanvas }) => {
  const { scene, nodes, materials } = useGLTF(MODEL_PATH);
  const modelRef = useRef();

  // Create canvas texture from Fabric.js canvas
  const canvasTexture = useMemo(() => {
    if (!fabricCanvas) return null;

    const texture = new THREE.CanvasTexture(fabricCanvas.getElement());
    texture.flipY = false;           // Important: Fabric.js canvas is flipped by default
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    return texture;
  }, [fabricCanvas]);

  // Apply texture to the t-shirt material(s) – adjust material name(s) based on your model
  useEffect(() => {
    if (!canvasTexture || !scene) return;

    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        // Replace or add map – you might have multiple materials (front, back, sleeves)
        // Example: if your model has material named 'TShirt_Front' or 'Fabric'
        if (
          child.material.name.includes("TShirt") ||
          child.material.name.includes("Fabric") ||
          child.material.name.includes("Shirt")
        ) {
          child.material.map = canvasTexture;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [canvasTexture, scene]);

  // Optional: subtle floating/breathing animation
  useFrame((state) => {
    if (!modelRef.current) return;
    const t = state.clock.getElapsedTime();
    modelRef.current.rotation.y = Math.sin(t * 0.3) * 0.15;
    modelRef.current.position.y = Math.sin(t * 1.2) * 0.08;
  });

  return (
    <group ref={modelRef} dispose={null} scale={1.2} position={[0, -0.6, 0]}>
      <primitive object={scene} />
    </group>
  );
};

// Fallback simple plane version (when no GLTF model is available yet)
const SimplePlaneFallback = ({ texture }) => {
  return (
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[3.5, 4.5]} />
      <meshStandardMaterial
        map={texture}
        transparent
        side={THREE.DoubleSide}
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
  );
};

const TShirt3D = ({ fabricCanvas, useFallback = false }) => {
  const texture = useMemo(() => {
    if (!fabricCanvas) return null;
    const tex = new THREE.CanvasTexture(fabricCanvas.getElement());
    tex.flipY = false;
    tex.needsUpdate = true;
    return tex;
  }, [fabricCanvas]);

  return (
    <div className="brutal-3d-canvas">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1, 5], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#000000"]} /> {/* brutal black bg */}

        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.8} color="#9C51B6" />

        <Environment preset="city" background={false} />

        {useFallback || !MODEL_PATH ? (
          <SimplePlaneFallback texture={texture} />
        ) : (
          <TShirtModel fabricCanvas={fabricCanvas} />
        )}

        <ContactShadows
          position={[0, -1.2, 0]}
          opacity={0.5}
          scale={12}
          blur={2.2}
          far={4}
          resolution={1024}
        />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
          dampingFactor={0.08}
        />
      </Canvas>
    </div>
  );
};

export default TShirt3D;



// import React, { useRef, useMemo } from "react";
// import { Canvas, useFrame } from "@react-three/fiber";
// import { OrbitControls, ContactShadows, Environment, Float } from "@react-three/drei";
// import * as THREE from "three";

// const TShirtModel = ({ texture }) => {
//   const meshRef = useRef();
  
//   // Create a simple T-shirt-like geometry (or just a stylized plane for now)
//   // In a real app, you'd load a GLTF model here.
//   // Update texture on each frame
//   useFrame(() => {
//     if (texture) texture.needsUpdate = true;
//   });

//   return (
//     <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
//       <mesh ref={meshRef} position={[0, 0, 0]}>
//         <planeGeometry args={[3, 4]} />
//         <meshStandardMaterial 
//           map={texture} 
//           transparent 
//           side={THREE.DoubleSide}
//           roughness={0.5}
//         />
//       </mesh>
//     </Float>
//   );
// };

// const TShirt3D = ({ fabricCanvas }) => {
//   const texture = useMemo(() => {
//     if (!fabricCanvas) return null;
//     const tex = new THREE.CanvasTexture(fabricCanvas.getElement());
//     tex.needsUpdate = true;
//     return tex;
//   }, [fabricCanvas]);

//   // Update texture on each frame if fabricCanvas changes
//   // MOVED to TShirtModel

//   return (
//     <div style={{ width: "100%", height: "400px", background: "#f0f0f0", borderRadius: "12px", overflow: "hidden" }}>
//       <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
//         <ambientLight intensity={0.5} />
//         <pointLight position={[10, 10, 10]} intensity={1} />
//         <Environment preset="city" />
//         <TShirtModel texture={texture} />
//         <OrbitControls enableZoom={true} />
//         <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
//       </Canvas>
//     </div>
//   );
// };

// export default TShirt3D;

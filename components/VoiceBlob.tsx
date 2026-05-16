'use client';

import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

export interface VoiceBlobProps {
  sitiAmpRef: React.MutableRefObject<number>;
  userAmpRef: React.MutableRefObject<number>;
  lastSitiChunk: React.MutableRefObject<number>;
  lastUserChunk: React.MutableRefObject<number>;
  isSitiSpeaking: boolean;
  isUserSpeaking: boolean;
}

// Pre-allocated — never create THREE.Color inside render loop
const C_SITI = new THREE.Color('#3b82f6');
const C_USER = new THREE.Color('#10b981');
const C_IDLE = new THREE.Color('#0c1a35');
const C_TMP  = new THREE.Color();

function BlobScene({
  sitiAmpRef, userAmpRef,
  lastSitiChunk, lastUserChunk,
  isSitiSpeaking, isUserSpeaking,
}: VoiceBlobProps) {
  const blobMat  = useRef<any>(null);
  const outerMat = useRef<any>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const env      = useRef(0); // local smoothed envelope

  useFrame(() => {
    const now = performance.now();

    // Decay only after real silence gap — keeps bars alive between chunks
    if (now - lastSitiChunk.current > 90) sitiAmpRef.current *= 0.91;
    if (now - lastUserChunk.current > 90) userAmpRef.current *= 0.91;

    // Smooth envelope — removes chunk-boundary spikes
    const raw = Math.max(sitiAmpRef.current, userAmpRef.current);
    env.current += (raw - env.current) * 0.15;
    const amp = env.current;

    C_TMP.copy(isSitiSpeaking ? C_SITI : isUserSpeaking ? C_USER : C_IDLE);

    if (blobMat.current) {
      const m = blobMat.current;
      m.distort           += (0.05 + amp * 0.58 - m.distort)           * 0.10;
      m.speed             += (0.7  + amp * 4.5  - m.speed)             * 0.09;
      m.emissiveIntensity += (0.06 + amp * 0.55 - m.emissiveIntensity) * 0.10;
      m.color.lerp(C_TMP, 0.055);
      m.emissive.lerp(C_TMP, 0.055);
    }

    if (outerMat.current) {
      outerMat.current.opacity += (0.03 + amp * 0.22 - outerMat.current.opacity) * 0.09;
      outerMat.current.color.lerp(C_TMP, 0.055);
    }

    if (lightRef.current) {
      lightRef.current.color.lerp(C_TMP, 0.07);
      lightRef.current.intensity += (1.2 + amp * 3.5 - lightRef.current.intensity) * 0.10;
    }
  });

  return (
    <>
      <ambientLight intensity={0.12} />
      <pointLight ref={lightRef} position={[2, 2, 2]}   intensity={1.2} color="#3b82f6" />
      <pointLight                  position={[-2,-1, 1]} intensity={0.5} color="#7c3aed" />

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.18}>
        {/* Outer glow halo */}
        <Sphere args={[1.22, 32, 32]}>
          <meshBasicMaterial
            ref={outerMat}
            color="#0c1a35"
            transparent
            opacity={0.03}
            side={THREE.BackSide}
            depthWrite={false}
          />
        </Sphere>

        {/* Main morphing blob */}
        <Sphere args={[1, 80, 80]}>
          <MeshDistortMaterial
            ref={blobMat}
            distort={0.05}
            speed={0.7}
            color="#0c1a35"
            emissive="#0c1a35"
            emissiveIntensity={0.06}
            roughness={0.10}
            metalness={0.78}
            envMapIntensity={2.8}
          />
        </Sphere>
      </Float>
    </>
  );
}

export default function VoiceBlob(props: VoiceBlobProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.2], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>
      <BlobScene {...props} />
    </Canvas>
  );
}

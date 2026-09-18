'use client';

import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Environment, Float } from '@react-three/drei';

export interface VoiceBlobProps {
  sitiAmpRef: React.MutableRefObject<number>;
  userAmpRef: React.MutableRefObject<number>;
  lastSitiChunk: React.MutableRefObject<number>;
  lastUserChunk: React.MutableRefObject<number>;
  isSitiSpeaking: boolean;
  isUserSpeaking: boolean;
  aiPlaybackActiveRef?: React.MutableRefObject<boolean>;
}

const SILENCE_MS = 1200;
const DECAY = 0.985;

function BlobScene({
  sitiAmpRef, userAmpRef,
  lastSitiChunk, lastUserChunk,
  isSitiSpeaking, isUserSpeaking,
  aiPlaybackActiveRef,
}: VoiceBlobProps) {
  const blobMat = useRef<any>(null);
  const env = useRef(0);

  useFrame((state) => {
    const now = performance.now();
    const t = state.clock.elapsedTime;

    const aiPlaying = aiPlaybackActiveRef?.current ?? false;

    if (!isSitiSpeaking && !aiPlaying && now - lastSitiChunk.current > SILENCE_MS) {
      sitiAmpRef.current *= DECAY;
    }
    if (!isUserSpeaking && now - lastUserChunk.current > SILENCE_MS) {
      userAmpRef.current *= DECAY;
    }

    const sitiRecent = now - lastSitiChunk.current < SILENCE_MS + 300;
    const userRecent = now - lastUserChunk.current < SILENCE_MS + 300;

    let sitiLevel = sitiRecent ? sitiAmpRef.current : 0;
    let userLevel = userRecent ? userAmpRef.current : 0;

    if (aiPlaying || isSitiSpeaking) sitiLevel = Math.max(sitiLevel, 0.3);
    if (isUserSpeaking) userLevel = Math.max(userLevel, 0.26);

    const raw = Math.max(sitiLevel, userLevel);
    const attack = raw > env.current ? 0.2 : 0.035;
    env.current += (raw - env.current) * attack;
    const amp = env.current;

    const breathe = Math.sin(t * 2.4) * 0.014 * (0.2 + amp);
    const distortTarget = 0.08 + amp * 0.72 + breathe;
    const speedTarget = 0.85 + amp * 5.5 + Math.sin(t * 1.6) * 0.12 * (0.15 + amp);

    if (blobMat.current) {
      const m = blobMat.current;
      m.distort += (distortTarget - m.distort) * 0.08;
      m.speed += (speedTarget - m.speed) * 0.07;
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={0.9} color="#e8eef8" />
      <directionalLight position={[-3, -2, 2]} intensity={0.25} color="#8899bb" />

      <Float speed={1.1} rotationIntensity={0.14} floatIntensity={0.08}>
        <Sphere args={[1, 80, 80]} scale={0.9}>
          <MeshDistortMaterial
            ref={blobMat}
            distort={0.08}
            speed={0.85}
            color="#2a3548"
            emissive="#141c2b"
            emissiveIntensity={0.04}
            roughness={0.35}
            metalness={0.55}
            envMapIntensity={1.2}
          />
        </Sphere>
      </Float>
    </>
  );
}

export default function VoiceBlob(props: VoiceBlobProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.1], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%', background: 'transparent', overflow: 'visible' }}
    >
      <Suspense fallback={null}>
        <Environment preset="city" />
      </Suspense>
      <BlobScene {...props} />
    </Canvas>
  );
}

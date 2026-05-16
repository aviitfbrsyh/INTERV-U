'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface VideoBackgroundProps {
  src: string;
  crossfade?: number; // seconds for crossfade overlap
}

export function VideoBackground({ src, crossfade = 2 }: VideoBackgroundProps) {
  const v1 = useRef<HTMLVideoElement>(null);
  const v2 = useRef<HTMLVideoElement>(null);

  const [op1, setOp1] = useState(1);
  const [op2, setOp2] = useState(0);
  const [z1, setZ1] = useState(1);
  const [z2, setZ2] = useState(0);

  const active = useRef<1 | 2>(1);
  const transitioning = useRef(false);

  useEffect(() => {
    const vid1 = v1.current;
    const vid2 = v2.current;
    if (!vid1 || !vid2) return;

    vid1.src = src;
    vid2.src = src;
    vid1.play().catch(() => {});

    const crossfadeToV2 = () => {
      if (transitioning.current || active.current !== 1) return;
      transitioning.current = true;
      active.current = 2;
      setZ2(2); setZ1(1);
      vid2.currentTime = 0;
      vid2.play().catch(() => {});
      setOp2(1);
      setTimeout(() => { setOp1(0); setZ1(0); transitioning.current = false; }, crossfade * 1000);
    };

    const crossfadeToV1 = () => {
      if (transitioning.current || active.current !== 2) return;
      transitioning.current = true;
      active.current = 1;
      setZ1(2); setZ2(1);
      vid1.currentTime = 0;
      vid1.play().catch(() => {});
      setOp1(1);
      setTimeout(() => { setOp2(0); setZ2(0); transitioning.current = false; }, crossfade * 1000);
    };

    const onUpdate1 = () => {
      if (!vid1.duration || active.current !== 1 || transitioning.current) return;
      if (vid1.duration - vid1.currentTime <= crossfade) crossfadeToV2();
    };

    const onUpdate2 = () => {
      if (!vid2.duration || active.current !== 2 || transitioning.current) return;
      if (vid2.duration - vid2.currentTime <= crossfade) crossfadeToV1();
    };

    vid1.addEventListener('timeupdate', onUpdate1);
    vid2.addEventListener('timeupdate', onUpdate2);

    return () => {
      vid1.removeEventListener('timeupdate', onUpdate1);
      vid2.removeEventListener('timeupdate', onUpdate2);
      vid1.pause();
      vid2.pause();
    };
  }, [src, crossfade]);

  const base: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    pointerEvents: 'none',
  };

  return (
    <>
      <motion.video
        ref={v1}
        muted
        playsInline
        animate={{ opacity: op1 }}
        transition={{ duration: crossfade, ease: 'easeInOut' }}
        style={{ ...base, zIndex: z1 }}
      />
      <motion.video
        ref={v2}
        muted
        playsInline
        animate={{ opacity: op2 }}
        transition={{ duration: crossfade, ease: 'easeInOut' }}
        style={{ ...base, zIndex: z2 }}
      />
    </>
  );
}

'use client';

import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  // tint opacity — 0.20 to 0.45 recommended
  tint?: number;
  // blur strength
  blur?: number;
  // border radius
  radius?: number | string;
  interactive?: boolean;
  // use stronger distortion filter
  strong?: boolean;
}

export function GlassCard({
  children,
  className,
  tint = 0.28,
  blur = 3,
  radius = 28,
  interactive = false,
  strong = false,
  style,
  ...props
}: GlassCardProps) {
  const r = typeof radius === 'number' ? `${radius}px` : radius;
  const filterId = strong ? 'glass-distortion' : 'glass-distortion-sm';

  return (
    <motion.div
      className={cn('relative overflow-hidden font-semibold cursor-default', className)}
      style={{
        borderRadius: r,
        boxShadow: '0 6px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.10)',
        transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 2.2)',
        ...style,
      }}
      whileHover={interactive ? { scale: 1.015, y: -2 } : undefined}
      whileTap={interactive ? { scale: 0.982 } : undefined}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      {...props}
    >
      {/* Layer 1 — distortion + blur (the authentic liquid glass lensing) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          borderRadius: 'inherit',
          overflow: 'hidden',
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          filter: `url(#${filterId})`,
          isolation: 'isolate',
        }}
      />

      {/* Layer 2 — white tint */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          borderRadius: 'inherit',
          background: `rgba(255,255,255,${tint})`,
        }}
      />

      {/* Layer 3 — inner rim specular (top-left light) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          borderRadius: 'inherit',
          overflow: 'hidden',
          boxShadow: [
            'inset 2px 2px 1px 0 rgba(255,255,255,0.55)',
            'inset -1px -1px 1px 1px rgba(255,255,255,0.40)',
          ].join(', '),
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3 }}>
        {children}
      </div>
    </motion.div>
  );
}

'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface GlassBadgeProps {
  children: React.ReactNode;
  dot?: string;
  pulse?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
  style?: React.CSSProperties;
}

export function GlassBadge({ children, dot, pulse = false, theme = 'light', className, style }: GlassBadgeProps) {
  const color = theme === 'light' ? 'rgba(20,20,36,0.60)' : 'rgba(255,255,255,0.70)';

  return (
    <span
      className={cn('relative inline-flex items-center gap-1.5 overflow-hidden', className)}
      style={{
        padding: '5px 14px',
        borderRadius: 9999,
        boxShadow: '0 3px 12px rgba(0,0,0,0.10), inset 2px 2px 1px rgba(255,255,255,0.50), inset -1px -1px 1px rgba(255,255,255,0.35)',
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.05em',
        color,
        ...style,
      }}
    >
      {/* Distortion layer */}
      <span aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)', filter: 'url(#glass-distortion-sm)', isolation: 'isolate', zIndex: 0 }} />
      {/* Tint */}
      <span aria-hidden style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', background: 'rgba(255,255,255,0.28)', zIndex: 1 }} />

      {dot && (
        <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center' }}>
          {pulse ? (
            <span style={{ position: 'relative', display: 'inline-flex' }}>
              <motion.span
                animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                style={{ position: 'absolute', inset: -1, borderRadius: '50%', background: dot }}
              />
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'block' }} />
            </span>
          ) : (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, display: 'block' }} />
          )}
        </span>
      )}
      <span style={{ position: 'relative', zIndex: 2 }}>{children}</span>
    </span>
  );
}

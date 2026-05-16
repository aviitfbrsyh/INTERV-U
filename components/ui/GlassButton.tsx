'use client';

import { motion, HTMLMotionProps } from 'motion/react';
import { cn } from '@/lib/utils';

interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  // dark = for dark backgrounds, light = for light/colorful backgrounds
  theme?: 'light' | 'dark';
  className?: string;
}

export function GlassButton({
  children,
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  theme = 'light',
  className,
  disabled,
  style,
  ...props
}: GlassButtonProps) {
  const sizes = {
    sm: { padding: '8px 18px',  fontSize: 13, radius: 14, minHeight: 36 },
    md: { padding: '13px 24px', fontSize: 15, radius: 16, minHeight: 48 },
    lg: { padding: '15px 28px', fontSize: 15, radius: 18, minHeight: 52 },
  };
  const s = sizes[size];
  const isDisabled = disabled || loading;

  const tint  = theme === 'light' ? 0.32 : 0.14;
  const color = theme === 'light' ? 'rgba(20,20,36,0.85)' : 'rgba(255,255,255,0.90)';

  return (
    <motion.button
      className={cn(
        'relative overflow-hidden font-semibold select-none cursor-pointer',
        'flex items-center justify-center gap-2.5',
        fullWidth && 'w-full',
        isDisabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      style={{
        borderRadius: s.radius,
        minHeight: s.minHeight,
        padding: s.padding,
        fontSize: s.fontSize,
        color,
        letterSpacing: '-0.01em',
        boxShadow: '0 4px 16px rgba(0,0,0,0.14), 0 1px 3px rgba(0,0,0,0.10)',
        transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 2.2)',
        ...style,
      }}
      whileHover={!isDisabled ? { scale: 1.025, y: -1 } : undefined}
      whileTap={!isDisabled ? { scale: 0.968 } : undefined}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      disabled={isDisabled}
      {...props}
    >
      {/* Layer 1 — distortion + blur */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          borderRadius: 'inherit',
          overflow: 'hidden',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          filter: 'url(#glass-distortion-sm)',
          isolation: 'isolate',
        }}
      />
      {/* Layer 2 — white tint */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          borderRadius: 'inherit',
          background: `rgba(255,255,255,${tint})`,
        }}
      />
      {/* Layer 3 — inner rim */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          borderRadius: 'inherit',
          boxShadow: [
            'inset 2px 2px 1px 0 rgba(255,255,255,0.55)',
            'inset -1px -1px 1px 1px rgba(255,255,255,0.40)',
          ].join(', '),
        }}
      />

      {/* Content */}
      <span style={{ position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', gap: 10 }}>
        {loading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.75, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 16, height: 16, borderRadius: '50%',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              display: 'inline-block',
            }}
          />
        ) : icon}
        {children}
      </span>
    </motion.button>
  );
}

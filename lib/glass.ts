// Liquid Glass Design System — inspired by Apple iOS 26 / VisionOS
// Three-layer composition: specular highlight + glass body + depth shadow

export const glass = {
  // ── Background (glass body tint) ──────────────────────────────────────────
  bg: {
    primary:   'rgba(14, 18, 28, 0.70)',   // main panels
    elevated:  'rgba(20, 26, 40, 0.80)',   // cards above panels
    subtle:    'rgba(255, 255, 255, 0.04)',// secondary elements
    overlay:   'rgba(4, 6, 12, 0.88)',     // modal overlays / scrims
    pure:      'rgba(255, 255, 255, 0.06)',// light-tinted glass
  },

  // ── Backdrop blur (frosted glass base) ────────────────────────────────────
  blur: {
    xs:  'blur(8px)  saturate(150%)',
    sm:  'blur(16px) saturate(170%)',
    md:  'blur(28px) saturate(190%)',
    lg:  'blur(44px) saturate(210%)',
    xl:  'blur(64px) saturate(230%)',
  },

  // ── Specular highlight gradient (light source: top-left) ─────────────────
  specular: {
    default: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 35%, transparent 65%, rgba(255,255,255,0.03) 100%)',
    strong:  'linear-gradient(135deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.08) 30%, transparent 60%)',
    subtle:  'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)',
    edge:    'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 40%)',
  },

  // ── Border (specular rim on glass edge) ───────────────────────────────────
  border: {
    default:  'rgba(255, 255, 255, 0.11)',
    bright:   'rgba(255, 255, 255, 0.20)',
    subtle:   'rgba(255, 255, 255, 0.06)',
    blue:     'rgba(96, 165, 250, 0.22)',
    green:    'rgba(52, 211, 153, 0.22)',
    red:      'rgba(248, 113, 113, 0.22)',
    purple:   'rgba(167, 139, 250, 0.22)',
  },

  // ── Box shadow (depth + inner edge light) ────────────────────────────────
  shadow: {
    sm: [
      '0 2px 8px rgba(0,0,0,0.30)',
      '0 1px 2px rgba(0,0,0,0.25)',
      'inset 0 1px 0 rgba(255,255,255,0.09)',
    ].join(', '),

    md: [
      '0 4px 24px rgba(0,0,0,0.38)',
      '0 1px 4px rgba(0,0,0,0.28)',
      'inset 0 1px 0 rgba(255,255,255,0.11)',
      'inset 0 -1px 0 rgba(0,0,0,0.18)',
    ].join(', '),

    lg: [
      '0 8px 40px rgba(0,0,0,0.48)',
      '0 2px 8px rgba(0,0,0,0.32)',
      'inset 0 1px 0 rgba(255,255,255,0.13)',
      'inset 0 -1px 0 rgba(0,0,0,0.22)',
      'inset 1px 0 0 rgba(255,255,255,0.07)',
    ].join(', '),

    xl: [
      '0 16px 64px rgba(0,0,0,0.55)',
      '0 4px 16px rgba(0,0,0,0.38)',
      'inset 0 1px 0 rgba(255,255,255,0.15)',
      'inset 0 -1px 0 rgba(0,0,0,0.25)',
      'inset 1px 0 0 rgba(255,255,255,0.08)',
      'inset -1px 0 0 rgba(0,0,0,0.12)',
    ].join(', '),
  },

  // ── Border radius (continuous corners — Apple style) ──────────────────────
  radius: {
    sm:   '12px',
    md:   '18px',
    lg:   '24px',
    xl:   '32px',
    '2xl':'40px',
    pill: '9999px',
  },

  // ── Glow (ambient light — tinted per accent color) ────────────────────────
  glow: {
    blue:   '0 0 48px rgba(59, 130, 246, 0.18)',
    green:  '0 0 48px rgba(16, 185, 129, 0.18)',
    red:    '0 0 48px rgba(239, 68, 68, 0.18)',
    purple: '0 0 48px rgba(139, 92, 246, 0.18)',
    white:  '0 0 48px rgba(255, 255, 255, 0.08)',
  },

  // ── Typography (SF Pro style metrics) ─────────────────────────────────────
  text: {
    primary:   'rgba(255, 255, 255, 0.92)',
    secondary: 'rgba(255, 255, 255, 0.55)',
    tertiary:  'rgba(255, 255, 255, 0.32)',
    accent:    'rgba(147, 197, 253, 0.90)',
  },
} as const;

// Helper: build complete glass style object for inline use
export function glassStyle(opts?: {
  blur?: keyof typeof glass.blur;
  bg?: keyof typeof glass.bg;
  shadow?: keyof typeof glass.shadow;
  borderColor?: string;
  specular?: keyof typeof glass.specular;
  glow?: keyof typeof glass.glow;
  radius?: keyof typeof glass.radius;
}) {
  const o = opts ?? {};
  return {
    background: glass.bg[o.bg ?? 'primary'],
    backdropFilter: glass.blur[o.blur ?? 'md'],
    WebkitBackdropFilter: glass.blur[o.blur ?? 'md'],
    border: `1px solid ${o.borderColor ?? glass.border.default}`,
    borderRadius: glass.radius[o.radius ?? 'lg'],
    boxShadow: [
      glass.shadow[o.shadow ?? 'md'],
      o.glow ? glass.glow[o.glow] : '',
    ].filter(Boolean).join(', '),
  } as React.CSSProperties;
}

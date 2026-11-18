import { motion, useReducedMotion } from 'motion/react';

interface FloatingParticle {
  id: number;
  kind: 'heart' | 'star' | 'sparkle';
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  color: string;
}

const PARTICLES: FloatingParticle[] = [
  { id: 1, kind: 'heart', left: '8%', top: '18%', size: 16, delay: 0, duration: 7.5, opacity: 0.28, color: '#d44d7a' },
  { id: 2, kind: 'star', left: '86%', top: '14%', size: 14, delay: 0.8, duration: 6.4, opacity: 0.34, color: '#8264bf' },
  { id: 3, kind: 'sparkle', left: '16%', top: '72%', size: 14, delay: 1.4, duration: 8.2, opacity: 0.26, color: '#d44d7a' },
  { id: 4, kind: 'heart', left: '82%', top: '66%', size: 15, delay: 0.4, duration: 7.8, opacity: 0.24, color: '#e2769b' },
  { id: 5, kind: 'star', left: '48%', top: '12%', size: 11, delay: 1.9, duration: 6.8, opacity: 0.26, color: '#c48d48' },
  { id: 6, kind: 'sparkle', left: '91%', top: '42%', size: 13, delay: 1.1, duration: 7.1, opacity: 0.28, color: '#8264bf' },
  { id: 7, kind: 'heart', left: '6%', top: '46%', size: 12, delay: 2.2, duration: 8.5, opacity: 0.22, color: '#a584d8' },
  { id: 8, kind: 'star', left: '72%', top: '84%', size: 13, delay: 0.6, duration: 7.4, opacity: 0.28, color: '#d44d7a' },
];

function ParticleGlyph({ kind, size, color }: { kind: FloatingParticle['kind']; size: number; color: string }) {
  if (kind === 'heart') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
        <path d="M12 20.5C12 20.5 4 14.8 4 8.9C4 6.1 6.2 4 8.8 4C10.4 4 11.4 4.8 12 5.9C12.6 4.8 13.6 4 15.2 4C17.8 4 20 6.1 20 8.9C20 14.8 12 20.5 12 20.5Z" />
      </svg>
    );
  }
  if (kind === 'star') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true">
        <path d="M12 2L14.4 9.2L22 12L14.4 14.8L12 22L9.6 14.8L2 12L9.6 9.2L12 2Z" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" aria-hidden="true">
      <path d="M12 3V21M3 12H21M5.6 5.6L18.4 18.4M18.4 5.6L5.6 18.4" strokeLinecap="round" />
    </svg>
  );
}

export function AmbientBackdrop({ intensity = 'soft' }: { intensity?: 'soft' | 'celebrate' }) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute will-change-transform"
          style={{
            left: p.left,
            top: p.top,
            opacity: intensity === 'celebrate' ? Math.min(p.opacity + 0.14, 0.48) : p.opacity,
          }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  y: [-8, 10, -8],
                  x: [-4, 5, -4],
                  rotate: [-6, 6, -6],
                  scale: [0.96, 1.06, 0.96],
                }
          }
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <ParticleGlyph kind={p.kind} size={p.size} color={p.color} />
        </motion.div>
      ))}
    </div>
  );
}

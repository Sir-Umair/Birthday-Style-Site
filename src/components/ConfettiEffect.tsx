import { useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';

const CELEBRATION_COLORS = ['#d44d7a', '#f39bb8', '#b598e6', '#fcebf1', '#f3c669'];

export function useConfettiLauncher() {
  const fireCelebration = useCallback((mode: 'burst' | 'grand' = 'burst') => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    if (mode === 'burst') {
      confetti({
        particleCount: 75,
        spread: 68,
        origin: { y: 0.62 },
        colors: CELEBRATION_COLORS,
        disableForReducedMotion: true,
      });
      return;
    }

    confetti({
      particleCount: 70,
      angle: 60,
      spread: 58,
      origin: { x: 0.08, y: 0.68 },
      colors: CELEBRATION_COLORS,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 70,
      angle: 120,
      spread: 58,
      origin: { x: 0.92, y: 0.68 },
      colors: CELEBRATION_COLORS,
      disableForReducedMotion: true,
    });

    window.setTimeout(() => {
      confetti({
        particleCount: 55,
        spread: 82,
        origin: { x: 0.5, y: 0.45 },
        colors: CELEBRATION_COLORS,
        disableForReducedMotion: true,
      });
    }, 280);
  }, []);

  return { fireCelebration };
}

export function ConfettiEffect({
  trigger,
  mode = 'burst',
}: {
  trigger: number | boolean;
  mode?: 'burst' | 'grand';
}) {
  const { fireCelebration } = useConfettiLauncher();

  useEffect(() => {
    if (trigger) {
      fireCelebration(mode);
    }
  }, [trigger, mode, fireCelebration]);

  return null;
}

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Heart, Sparkles } from 'lucide-react';
import { birthdayConfig } from '../config/birthday';
import { useConfettiLauncher } from './ConfettiEffect';

interface FinalSurpriseProps {
  onContinue: () => void;
}

export function FinalSurprise({ onContinue }: FinalSurpriseProps) {
  const prefersReducedMotion = useReducedMotion();
  const { fireCelebration } = useConfettiLauncher();
  const { finalSurprise } = birthdayConfig;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fireCelebration('grand');
    }, 240);
    return () => window.clearTimeout(timer);
  }, [fireCelebration]);

  return (
    <section
      aria-labelledby="final-surprise-heading"
      className="relative flex min-h-[calc(100dvh-3.5rem)] w-full items-center justify-center px-4 py-10 sm:px-8"
    >
      <div className="mx-auto w-full max-w-3xl text-center">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="soft-card relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/95 via-[#fff4f8]/95 to-[#f3ecfc]/95 px-6 py-12 sm:px-12 sm:py-16"
        >
          <div
            className="pointer-events-none absolute -top-20 right-10 h-44 w-44 rounded-full bg-[var(--theme-lavender)] opacity-70 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 left-10 h-44 w-44 rounded-full bg-[var(--theme-blush)] opacity-80 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center">
            <motion.span
              animate={
                prefersReducedMotion
                  ? undefined
                  : { scale: [1, 1.08, 1] }
              }
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--theme-blush)] text-[var(--theme-accent)] shadow-sm"
            >
              <Heart className="h-7 w-7 fill-current" aria-hidden="true" />
            </motion.span>

            <p className="mt-5 text-xs font-medium tracking-wide text-[var(--theme-muted)]">
              {finalSurprise.kicker}
            </p>

            <h1
              id="final-surprise-heading"
              className="mt-3 font-display text-3xl font-semibold leading-tight text-[var(--theme-ink)] sm:text-5xl lg:text-6xl"
            >
              {finalSurprise.headline}
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--theme-muted)] sm:text-lg">
              {finalSurprise.message}
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row w-full sm:w-auto justify-center">
              <motion.button
                type="button"
                onClick={onContinue}
                whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                className="inline-flex w-full sm:w-auto min-h-[52px] items-center justify-center gap-2 rounded-full bg-[var(--theme-accent)] px-8 py-3.5 text-base font-semibold text-white shadow-[0_14px_30px_-10px_rgba(212,77,122,0.55)] transition-colors hover:bg-[var(--theme-accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>{finalSurprise.buttonLabel}</span>
              </motion.button>

              <button
                type="button"
                onClick={() => fireCelebration('grand')}
                className="inline-flex w-full sm:w-auto min-h-[48px] items-center justify-center gap-1.5 rounded-full border border-[var(--theme-border)] bg-white/85 px-5 py-2.5 text-sm font-medium text-[var(--theme-ink)] transition-colors hover:bg-[var(--theme-blush)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-[var(--theme-accent)]" aria-hidden="true" />
                <span>Celebrate again</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

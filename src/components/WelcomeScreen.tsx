import { motion, useReducedMotion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { birthdayConfig } from '../config/birthday';

interface WelcomeScreenProps {
  onOpen: () => void;
}

export function WelcomeScreen({ onOpen }: WelcomeScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const { welcome } = birthdayConfig;

  return (
    <section
      aria-labelledby="welcome-heading"
      className="relative flex min-h-[calc(100dvh-3.5rem)] w-full items-center justify-center px-5 py-10 sm:px-8"
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="soft-card relative w-full overflow-hidden rounded-3xl px-6 py-12 sm:px-12 sm:py-16"
        >
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-[var(--theme-blush)] opacity-80 blur-3xl"
            aria-hidden="true"
          />

          <p className="relative text-xs sm:text-sm font-medium tracking-wide text-[var(--theme-muted)]">
            {welcome.kicker}
          </p>

          <h1
            id="welcome-heading"
            className="relative mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-[var(--theme-ink)] sm:text-5xl lg:text-6xl"
          >
            {welcome.headline}
          </h1>

          <p className="relative mx-auto mt-5 max-w-md text-base leading-relaxed text-[var(--theme-muted)] sm:text-lg">
            {welcome.subheadline}
          </p>

          <div className="relative mt-9 flex flex-col items-center gap-4">
            <motion.button
              type="button"
              onClick={onOpen}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
              className="group relative inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-full bg-[var(--theme-accent)] px-8 py-3.5 text-base font-semibold text-white shadow-[0_14px_30px_-10px_rgba(212,77,122,0.55)] transition-colors hover:bg-[var(--theme-accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--theme-accent)] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>{welcome.buttonLabel}</span>
              <Sparkles className="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" aria-hidden="true" />
            </motion.button>

            <p className="text-xs text-[var(--theme-muted)]">
              {welcome.hint}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

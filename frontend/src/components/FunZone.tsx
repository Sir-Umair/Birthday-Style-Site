import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Crown, Gift, Heart, Sparkles } from 'lucide-react';
import { birthdayConfig } from '../config/birthday';
import { useConfettiLauncher } from './ConfettiEffect';

interface FunZoneProps {
  onContinue: () => void;
}

export function FunZone({ onContinue }: FunZoneProps) {
  const prefersReducedMotion = useReducedMotion();
  const { fireCelebration } = useConfettiLauncher();
  const { funZone } = birthdayConfig;

  const [queenRevealed, setQueenRevealed] = useState(false);
  const [complimentIndex, setComplimentIndex] = useState<number | null>(null);
  const [secretUnlocked, setSecretUnlocked] = useState(false);

  const handleRevealQueen = () => {
    if (!queenRevealed) {
      setQueenRevealed(true);
      fireCelebration('burst');
    }
  };

  const handleNextCompliment = () => {
    const total = funZone.compliments.length;
    if (total === 0) return;
    if (total === 1) {
      setComplimentIndex(0);
      return;
    }
    let next = Math.floor(Math.random() * total);
    if (complimentIndex !== null && next === complimentIndex) {
      next = (complimentIndex + 1) % total;
    }
    setComplimentIndex(next);
  };

  const handleToggleSecret = () => {
    setSecretUnlocked((prev) => {
      const next = !prev;
      if (next) fireCelebration('burst');
      return next;
    });
  };

  return (
    <section
      aria-labelledby="funzone-heading"
      className="relative w-full px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-xs font-medium tracking-wide text-[var(--theme-muted)]">
            {funZone.kicker}
          </p>
          <h1
            id="funzone-heading"
            className="mt-2 font-display text-3xl font-semibold text-[var(--theme-ink)] sm:text-4xl"
          >
            {funZone.title}
          </h1>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {/* Card 1: Birthday Queen Question */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="soft-card flex flex-col justify-between rounded-3xl p-6 sm:p-8"
          >
            <div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--theme-blush)] text-[var(--theme-accent)]">
                <Crown className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold text-[var(--theme-ink)] sm:text-2xl">
                {funZone.queenQuestion}
              </h2>
            </div>

            <div className="mt-6">
              <AnimatePresence mode="wait">
                {!queenRevealed ? (
                  <motion.button
                    key="reveal-queen-btn"
                    type="button"
                    onClick={handleRevealQueen}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                    className="w-full min-h-[48px] rounded-2xl bg-[var(--theme-blush)] px-5 py-3 text-sm font-semibold text-[var(--theme-accent)] transition-colors hover:bg-[#fadbe6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] cursor-pointer"
                  >
                    {funZone.queenPromptLabel}
                  </motion.button>
                ) : (
                  <motion.div
                    key="queen-answer"
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-2xl bg-gradient-to-br from-[var(--theme-blush)] to-[var(--theme-lavender)] px-5 py-4"
                  >
                    <p className="font-display text-2xl font-semibold text-[var(--theme-accent)]">
                      {funZone.queenAnswer}
                    </p>
                    <p className="mt-1 text-xs text-[var(--theme-muted)]">
                      {funZone.queenNote}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Card 2: Interactive Compliment Generator */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="soft-card flex flex-col justify-between rounded-3xl p-6 sm:p-8"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--theme-lavender)] text-[var(--theme-lavender-accent)]">
                  <Heart className="h-5 w-5" aria-hidden="true" />
                </span>
                {complimentIndex !== null && (
                  <span className="text-xs font-medium tabular-nums text-[var(--theme-muted)]">
                    {complimentIndex + 1} / {funZone.compliments.length}
                  </span>
                )}
              </div>

              <div className="mt-4 min-h-[76px] flex items-center">
                <AnimatePresence mode="wait">
                  {complimentIndex === null ? (
                    <motion.p
                      key="compliment-prompt"
                      initial={prefersReducedMotion ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                      className="text-sm leading-relaxed text-[var(--theme-muted)]"
                    >
                      A little reminder whenever you need one, {birthdayConfig.nickname}.
                    </motion.p>
                  ) : (
                    <motion.p
                      key={`compliment-${complimentIndex}`}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                      className="font-display text-xl font-semibold leading-snug text-[var(--theme-ink)]"
                    >
                      “{funZone.compliments[complimentIndex]}”
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleNextCompliment}
                className="inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-[var(--theme-lavender)] px-5 py-3 text-sm font-semibold text-[var(--theme-lavender-accent)] transition-colors hover:bg-[#e5dbf7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-lavender-accent)] cursor-pointer"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>{funZone.complimentButtonLabel}</span>
              </button>
            </div>
          </motion.div>

          {/* Card 3: Hidden Secret Surprise (Full Width) */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="soft-card rounded-3xl p-6 sm:p-8 md:col-span-2"
          >
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3.5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--theme-cream)] text-[var(--theme-accent)]">
                  <Gift className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold text-[var(--theme-ink)]">
                    A Secret Note
                  </h2>
                  <p className="text-xs text-[var(--theme-muted)]">
                    Tucked away right here for you
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleSecret}
                aria-expanded={secretUnlocked}
                className="inline-flex w-full sm:w-auto min-h-[48px] items-center justify-center gap-2 rounded-full border border-[var(--theme-border)] bg-white px-6 py-2.5 text-sm font-semibold text-[var(--theme-accent)] shadow-sm transition-colors hover:bg-[var(--theme-blush)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                <span>{secretUnlocked ? 'Hide secret note' : funZone.secretButtonLabel}</span>
              </button>
            </div>

            <AnimatePresence>
              {secretUnlocked && (
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-6 border-t border-[var(--theme-border)] pt-6"
                >
                  <p className="text-xs font-semibold tracking-wide text-[var(--theme-accent)]">
                    {funZone.secretTitle}
                  </p>
                  <p className="mt-2 max-w-2xl text-base leading-relaxed text-[var(--theme-ink)]">
                    {funZone.secretMessage}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="mt-9 flex justify-center pb-4">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex w-full sm:w-auto min-h-[48px] items-center justify-center gap-2 rounded-full bg-[var(--theme-accent)] px-8 py-3 text-sm sm:text-base font-semibold text-white shadow-[0_12px_24px_-8px_rgba(212,77,122,0.5)] transition-colors hover:bg-[var(--theme-accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{funZone.continueLabel}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

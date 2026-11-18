import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Heart, MailOpen } from 'lucide-react';
import { birthdayConfig } from '../config/birthday';

interface BirthdayLetterProps {
  onContinue: () => void;
}

export function BirthdayLetter({ onContinue }: BirthdayLetterProps) {
  const prefersReducedMotion = useReducedMotion();
  const { letter } = birthdayConfig;

  const fullText = useMemo(() => letter.paragraphs.join('\n\n'), [letter.paragraphs]);
  const [isOpened, setIsOpened] = useState(false);
  const [typedCount, setTypedCount] = useState(0);

  const isTypingDone = typedCount >= fullText.length;

  useEffect(() => {
    if (!isOpened) return;
    if (prefersReducedMotion) {
      setTypedCount(fullText.length);
      return;
    }
    if (typedCount >= fullText.length) return;

    const timer = window.setTimeout(() => {
      setTypedCount((prev) => Math.min(prev + 1, fullText.length));
    }, 22);

    return () => window.clearTimeout(timer);
  }, [isOpened, typedCount, fullText, prefersReducedMotion]);

  const displayedParagraphs = useMemo(() => {
    const slice = fullText.slice(0, typedCount);
    return slice.split('\n\n');
  }, [fullText, typedCount]);

  return (
    <section
      aria-labelledby="letter-heading"
      className="relative flex min-h-[calc(100dvh-3.5rem)] w-full items-center justify-center px-4 py-8 sm:px-8"
    >
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 text-center">
          <p className="text-xs font-medium tracking-wide text-[var(--theme-muted)]">
            {letter.kicker}
          </p>
          <h1
            id="letter-heading"
            className="mt-2 font-display text-3xl font-semibold text-[var(--theme-ink)] sm:text-4xl"
          >
            {letter.title}
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {!isOpened ? (
            <motion.div
              key="envelope-closed"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <button
                type="button"
                onClick={() => setIsOpened(true)}
                aria-label={`Open letter: ${letter.envelopeLabel}`}
                className="group relative w-full max-w-md cursor-pointer rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--theme-accent)]"
              >
                <div className="soft-card relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#fff9fb] via-[#fdf3f7] to-[#f4eefb] px-6 py-14 sm:px-10 sm:py-16 shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                  {/* Envelope Top Flap Decorative Lines */}
                  <svg
                    viewBox="0 0 400 180"
                    className="pointer-events-none absolute inset-x-0 top-0 w-full opacity-80"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M0 0 L200 115 L400 0"
                      fill="rgba(255, 255, 255, 0.65)"
                      stroke="rgba(181, 120, 146, 0.22)"
                      strokeWidth="1.5"
                    />
                  </svg>

                  <div className="relative z-10 flex flex-col items-center text-center pt-6">
                    {/* Wax Seal */}
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#e2638d] to-[#c43f6b] text-white shadow-[0_10px_24px_-6px_rgba(212,77,122,0.55)] transition-transform duration-300 group-hover:scale-105">
                      <Heart className="h-7 w-7 fill-current" aria-hidden="true" />
                    </span>

                    <p className="mt-6 font-display text-xl font-semibold text-[var(--theme-ink)] sm:text-2xl">
                      {letter.envelopeLabel}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--theme-accent)]">
                      <MailOpen className="h-4 w-4" aria-hidden="true" />
                      <span>{letter.envelopeHint}</span>
                    </p>
                  </div>
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.article
              key="letter-open"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="soft-card relative rounded-3xl bg-[#fffdfd]/95 px-6 py-8 sm:px-11 sm:py-11"
            >
              <div className="flex items-center justify-between border-b border-[var(--theme-border)] pb-4">
                <span className="text-xs font-medium text-[var(--theme-muted)]">
                  To: {birthdayConfig.nickname}
                </span>
                {!isTypingDone && (
                  <button
                    type="button"
                    onClick={() => setTypedCount(fullText.length)}
                    className="min-h-[36px] rounded-full px-3 text-xs font-medium text-[var(--theme-accent)] hover:bg-[var(--theme-blush)] transition-colors cursor-pointer"
                  >
                    Read full letter
                  </button>
                )}
              </div>

              <div
                aria-live="polite"
                className="mt-6 min-h-[240px] space-y-4 text-left text-base leading-relaxed text-[var(--theme-ink)] sm:text-[17px]"
              >
                {displayedParagraphs.map((paragraph, idx) => (
                  <p
                    key={idx}
                    className={
                      idx === 0
                        ? 'font-display text-xl font-semibold text-[var(--theme-ink)]'
                        : 'text-[var(--theme-ink)]/90'
                    }
                  >
                    {paragraph}
                    {idx === displayedParagraphs.length - 1 && !isTypingDone && (
                      <span
                        className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-[var(--theme-accent)] align-middle"
                        aria-hidden="true"
                      />
                    )}
                  </p>
                ))}
              </div>

              {isTypingDone && (
                <motion.div
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35 }}
                  className="mt-8 border-t border-[var(--theme-border)] pt-6 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="font-display italic text-base text-[var(--theme-muted)]">
                    — {letter.signature}
                  </p>

                  <button
                    type="button"
                    onClick={onContinue}
                    className="inline-flex w-full sm:w-auto min-h-[48px] items-center justify-center gap-2 rounded-full bg-[var(--theme-accent)] px-7 py-3 text-sm sm:text-base font-semibold text-white shadow-[0_12px_24px_-8px_rgba(212,77,122,0.5)] transition-colors hover:bg-[var(--theme-accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>{letter.continueLabel}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </motion.div>
              )}
            </motion.article>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

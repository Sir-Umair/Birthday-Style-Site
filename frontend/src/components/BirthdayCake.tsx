import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { birthdayConfig } from '../config/birthday';
import { useConfettiLauncher } from './ConfettiEffect';

interface BirthdayCakeProps {
  onContinue: () => void;
}

export function BirthdayCake({ onContinue }: BirthdayCakeProps) {
  const prefersReducedMotion = useReducedMotion();
  const { fireCelebration } = useConfettiLauncher();
  const totalCandles = birthdayConfig.cake.candleCount;

  const [litCandles, setLitCandles] = useState<boolean[]>(() =>
    Array.from({ length: totalCandles }, () => true)
  );
  const [hasCelebrated, setHasCelebrated] = useState(false);

  const remainingCount = litCandles.filter(Boolean).length;
  const allOut = remainingCount === 0;

  useEffect(() => {
    if (allOut && !hasCelebrated) {
      setHasCelebrated(true);
      fireCelebration('grand');
    }
  }, [allOut, hasCelebrated, fireCelebration]);

  const blowOutCandle = (index: number) => {
    setLitCandles((prev) => {
      if (!prev[index]) return prev;
      const next = [...prev];
      next[index] = false;
      return next;
    });
  };

  const relightCandles = () => {
    setLitCandles(Array.from({ length: totalCandles }, () => true));
    setHasCelebrated(false);
  };

  const candlePositions = ['16%', '33%', '50%', '67%', '84%'].slice(0, totalCandles);

  return (
    <section
      aria-labelledby="cake-heading"
      className="relative flex min-h-[calc(100dvh-3.5rem)] w-full items-center justify-center px-4 py-8 sm:px-8"
    >
      <div className="mx-auto w-full max-w-3xl">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="soft-card rounded-3xl px-5 py-9 sm:px-10 sm:py-12 text-center"
        >
          <p className="text-xs font-medium tracking-wide text-[var(--theme-muted)]">
            {birthdayConfig.cake.kicker}
          </p>

          <AnimatePresence mode="wait">
            {!allOut ? (
              <motion.div
                key="instruction"
                initial={prefersReducedMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                className="mt-3"
              >
                <h1
                  id="cake-heading"
                  className="font-display text-2xl font-semibold text-[var(--theme-ink)] sm:text-4xl"
                >
                  Make a Birthday Wish, {birthdayConfig.nickname}
                </h1>
                <p className="mt-2 text-sm text-[var(--theme-muted)] sm:text-base">
                  {birthdayConfig.cake.instruction}{' '}
                  <span className="font-semibold tabular-nums text-[var(--theme-accent)]">
                    ({remainingCount} left)
                  </span>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="celebration"
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="mt-3"
              >
                <h1
                  id="cake-heading"
                  className="font-display text-3xl font-semibold text-[var(--theme-ink)] sm:text-4xl lg:text-5xl"
                >
                  {birthdayConfig.cake.headline}
                </h1>
                <p className="mx-auto mt-3 max-w-md text-base text-[var(--theme-muted)] sm:text-lg">
                  {birthdayConfig.cake.subheadline}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Cake Stage */}
          <div className="relative mx-auto mt-10 mb-6 flex w-full max-w-[320px] sm:max-w-[360px] flex-col items-center select-none pt-14">
            {/* Candles Row */}
            <div className="relative z-20 h-20 w-[210px] sm:w-[240px]">
              {litCandles.map((isLit, index) => (
                <div
                  key={index}
                  style={{ left: candlePositions[index] }}
                  className="absolute bottom-0 -translate-x-1/2 flex flex-col items-center"
                >
                  <button
                    type="button"
                    onClick={() => blowOutCandle(index)}
                    aria-label={
                      isLit
                        ? `Blow out candle ${index + 1}`
                        : `Candle ${index + 1} blown out`
                    }
                    className="group relative flex min-h-[56px] min-w-[44px] flex-col items-center justify-end pb-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] rounded-xl cursor-pointer"
                  >
                    {/* Flame or Smoke Wisp */}
                    <div className="relative flex h-8 w-8 items-end justify-center">
                      <AnimatePresence>
                        {isLit ? (
                          <motion.div
                            key="flame"
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={
                              prefersReducedMotion
                                ? { opacity: 1, scale: 1 }
                                : {
                                    opacity: 1,
                                    scaleY: [1, 1.14, 0.94, 1.08, 1],
                                    scaleX: [1, 0.92, 1.05, 0.96, 1],
                                    rotate: [-2, 3, -3, 2, 0],
                                  }
                            }
                            exit={
                              prefersReducedMotion
                                ? { opacity: 0 }
                                : { opacity: 0, scale: 0.3, y: -10, transition: { duration: 0.2 } }
                            }
                            transition={{
                              duration: 1.4,
                              repeat: Infinity,
                              delay: index * 0.16,
                              ease: 'easeInOut',
                            }}
                            className="relative flex items-center justify-center origin-bottom"
                          >
                            <span
                              className="absolute -inset-2 rounded-full bg-amber-300/45 blur-md"
                              aria-hidden="true"
                            />
                            <svg width="20" height="28" viewBox="0 0 20 28" aria-hidden="true">
                              <path
                                d="M10 1C10 1 18 11 18 18.2C18 22.9 14.4 26.5 10 26.5C5.6 26.5 2 22.9 2 18.2C2 11 10 1 10 1Z"
                                fill="#F59E0B"
                              />
                              <path
                                d="M10 9C10 9 14.5 14.5 14.5 18.8C14.5 21.5 12.5 23.8 10 23.8C7.5 23.8 5.5 21.5 5.5 18.8C5.5 14.5 10 9 10 9Z"
                                fill="#FEF08A"
                              />
                            </svg>
                          </motion.div>
                        ) : (
                          <motion.span
                            key="smoke"
                            initial={{ opacity: 0.65, y: 0, scale: 0.7 }}
                            animate={{ opacity: 0, y: -22, scale: 1.5 }}
                            transition={{ duration: 0.9, ease: 'easeOut' }}
                            className="mb-1 h-3 w-3 rounded-full bg-[var(--theme-muted)]/30 blur-[2px]"
                            aria-hidden="true"
                          />
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Wick */}
                    <span className="h-2 w-0.5 rounded-full bg-[#4a3548]" aria-hidden="true" />

                    {/* Candle Body */}
                    <span
                      className={`h-11 w-3.5 rounded-t-md rounded-b-sm shadow-sm transition-transform duration-150 group-hover:scale-105 ${
                        index % 2 === 0
                          ? 'bg-gradient-to-b from-[#f9b4cb] to-[#e9799f]'
                          : 'bg-gradient-to-b from-[#d8c7f5] to-[#b197e3]'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Top Cake Tier */}
            <div className="relative z-10 -mt-1 h-16 w-[216px] sm:w-[244px] rounded-t-2xl bg-gradient-to-b from-[#fff5f8] to-[#fde1eb] border border-[#f2c6d6] shadow-sm overflow-hidden">
              {/* Frosting Drips */}
              <div className="flex justify-around px-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-6 rounded-b-full bg-white/95 shadow-[0_2px_4px_rgba(212,77,122,0.08)] ${
                      i % 2 === 0 ? 'h-5' : 'h-7'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center justify-center gap-4 opacity-80">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--theme-accent)]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--theme-lavender-accent)]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--theme-accent)]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--theme-lavender-accent)]" />
              </div>
            </div>

            {/* Bottom Cake Tier */}
            <div className="relative -mt-1 h-22 w-[276px] sm:w-[310px] rounded-t-2xl rounded-b-xl bg-gradient-to-b from-[#f7effc] to-[#eadcf8] border border-[#dcc8f0] shadow-md overflow-hidden">
              <div className="flex justify-around px-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-6 rounded-b-full bg-[#fffbfc] shadow-[0_2px_4px_rgba(130,100,191,0.1)] ${
                      i % 2 === 0 ? 'h-6' : 'h-4'
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
              {/* Ribbon band */}
              <div className="absolute bottom-3 left-0 right-0 h-3 bg-gradient-to-r from-[#f2a6bf]/60 via-[#d44d7a]/45 to-[#f2a6bf]/60" />
            </div>

            {/* Cake Pedestal Stand */}
            <div className="h-3.5 w-[304px] sm:w-[344px] rounded-full bg-gradient-to-b from-white to-[#f2e8ed] border border-[var(--theme-border)] shadow-md" />
            <div className="h-5 w-20 bg-gradient-to-b from-[#ece0e7] to-[#dfd0d9] rounded-b-lg" />
            <div className="h-2.5 w-36 rounded-full bg-[#e5d6df] shadow-sm" />
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {allOut ? (
              <>
                <motion.button
                  type="button"
                  onClick={onContinue}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[var(--theme-accent)] px-7 py-3 text-sm sm:text-base font-semibold text-white shadow-[0_12px_24px_-8px_rgba(212,77,122,0.5)] transition-colors hover:bg-[var(--theme-accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{birthdayConfig.cake.continueLabel}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </motion.button>

                <button
                  type="button"
                  onClick={relightCandles}
                  className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-[var(--theme-muted)] transition-colors hover:bg-[var(--theme-blush)] hover:text-[var(--theme-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Relight candles</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLitCandles(Array.from({ length: totalCandles }, () => false));
                  }}
                  className="inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-full bg-[var(--theme-blush)] px-5 py-2 text-xs font-semibold text-[var(--theme-accent)] transition-colors hover:bg-[#fadbe6] cursor-pointer"
                >
                  <span>Blow Out All Candles 🌬️✨</span>
                </button>
                <p className="text-[11px] text-[var(--theme-muted)]">
                  Or tap each glowing flame one by one
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

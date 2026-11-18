import { useState, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { AlertCircle, CheckCircle2, Loader2, RotateCcw, Star } from 'lucide-react';
import { birthdayConfig } from '../config/birthday';
import {
  hasAlreadySubmittedFeedback,
  submitFeedback,
  validateFeedbackInput,
} from '../lib/feedback';
import { useConfettiLauncher } from './ConfettiEffect';

interface FeedbackFormProps {
  onReplayStory: () => void;
}

const STAR_LABELS = ['Sweet', 'Cute', 'Lovely', 'Special', 'Unforgettable'] as const;

export function FeedbackForm({ onReplayStory }: FeedbackFormProps) {
  const prefersReducedMotion = useReducedMotion();
  const { fireCelebration } = useConfettiLauncher();
  const { feedback } = birthdayConfig;

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState('');
  const [madeMeSmile, setMadeMeSmile] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [canRetrySend, setCanRetrySend] = useState(false);
  const [submitted, setSubmitted] = useState<boolean>(() => hasAlreadySubmittedFeedback());

  const activeStar = hoverRating || rating;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting || submitted) return;

    const clientError = validateFeedbackInput({
      starCount: rating,
      feedback: message,
      madeMeSmile,
    });

    if (clientError) {
      setCanRetrySend(false);
      setErrorMsg(clientError);
      return;
    }

    setErrorMsg(null);
    setCanRetrySend(false);
    setIsSubmitting(true);

    const result = await submitFeedback({
      starCount: rating,
      feedback: message,
      madeMeSmile,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      console.warn('[FeedbackForm] Submission rejected:', result.cause, result.error);
      setCanRetrySend(true);
      setErrorMsg(result.error || 'Could not send feedback. Please try again.');
      return;
    }

    setSubmitted(true);
    fireCelebration('burst');
  };

  return (
    <section
      aria-labelledby="feedback-heading"
      className="relative flex min-h-[calc(100dvh-3.5rem)] w-full items-center justify-center px-4 py-8 sm:px-8"
    >
      <div className="mx-auto w-full max-w-xl">
        {submitted ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="soft-card rounded-3xl px-6 py-12 sm:px-10 sm:py-14 text-center"
          >
            <span className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--theme-blush)] text-[var(--theme-accent)]">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </span>

            <h1
              id="feedback-heading"
              className="mt-5 font-display text-3xl font-semibold text-[var(--theme-ink)] sm:text-4xl"
            >
              {feedback.successTitle}
            </h1>

            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-[var(--theme-muted)]">
              {feedback.successMessage}
            </p>

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={onReplayStory}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[var(--theme-border)] bg-white px-6 py-2.5 text-sm font-semibold text-[var(--theme-ink)] transition-colors hover:bg-[var(--theme-blush)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] cursor-pointer"
              >
                <RotateCcw className="h-4 w-4 text-[var(--theme-accent)]" aria-hidden="true" />
                <span>Replay your surprise</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            noValidate
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="soft-card rounded-3xl px-5 py-8 sm:px-10 sm:py-10"
          >
            <div className="text-center">
              <p className="text-xs font-medium tracking-wide text-[var(--theme-muted)]">
                {feedback.kicker}
              </p>
              <h1
                id="feedback-heading"
                className="mt-2 font-display text-3xl font-semibold text-[var(--theme-ink)] sm:text-4xl"
              >
                {feedback.title}
              </h1>
              <p className="mt-2 text-sm text-[var(--theme-muted)]">
                {feedback.subtitle}
              </p>
            </div>

            {/* 1. Star Rating */}
            <fieldset className="mt-8">
              <div className="flex items-center justify-between">
                <legend className="text-sm font-semibold text-[var(--theme-ink)]">
                  How did you like it?
                </legend>
                <span className="text-xs font-medium text-[var(--theme-accent)] tabular-nums">
                  {activeStar > 0 ? `${activeStar}/5 · ${STAR_LABELS[activeStar - 1]}` : 'Tap a star'}
                </span>
              </div>

              <div
                className="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-[var(--theme-border)] bg-white/80 px-3 py-2"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isFilled = starValue <= activeStar;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onClick={() => {
                        setRating(starValue);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      onMouseEnter={() => setHoverRating(starValue)}
                      aria-label={`Rate ${starValue} out of 5 stars`}
                      aria-pressed={rating === starValue}
                      className="flex min-h-[48px] min-w-[48px] flex-1 items-center justify-center rounded-xl transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] cursor-pointer"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors duration-150 ${
                          isFilled
                            ? 'fill-[#f2b749] text-[#e49d24]'
                            : 'text-[var(--theme-muted)]/35 hover:text-[#e49d24]/70'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* 2. Feedback Textarea */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="baybo-feedback-text"
                  className="text-sm font-semibold text-[var(--theme-ink)]"
                >
                  Your message
                </label>
                <span className="text-xs tabular-nums text-[var(--theme-muted)]">
                  {message.length} / 1500
                </span>
              </div>
              <textarea
                id="baybo-feedback-text"
                rows={4}
                maxLength={1500}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={feedback.placeholder}
                className="mt-2 w-full rounded-2xl border border-[var(--theme-border)] bg-white/90 px-4 py-3 text-base text-[var(--theme-ink)] placeholder:text-[var(--theme-muted)]/65 focus:border-[var(--theme-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent)]/20"
              />
            </div>

            {/* 3. Optional Smile Question */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-[var(--theme-ink)]">
                {feedback.smileQuestion}{' '}
                <span className="text-xs font-normal text-[var(--theme-muted)]">(optional)</span>
              </p>

              <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {feedback.smileOptions.map((option) => {
                  const selected = madeMeSmile === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setMadeMeSmile((prev) => (prev === option ? '' : option))}
                      aria-pressed={selected}
                      className={`min-h-[44px] rounded-xl border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] whitespace-nowrap cursor-pointer ${
                        selected
                          ? 'border-[var(--theme-accent)] bg-[var(--theme-blush)] text-[var(--theme-accent)]'
                          : 'border-[var(--theme-border)] bg-white/85 text-[var(--theme-ink)] hover:bg-[var(--theme-blush)]/50'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error State */}
            {errorMsg && (
              <div
                role="alert"
                aria-live="assertive"
                className="mt-5 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
                <p className="min-w-0 flex-1 break-words text-left leading-relaxed">{errorMsg}</p>
              </div>
            )}

            {/* Submit CTA */}
            <div className="mt-7">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full min-h-[52px] items-center justify-center gap-2 rounded-full bg-[var(--theme-accent)] px-8 py-3.5 text-base font-semibold text-white shadow-[0_12px_24px_-8px_rgba(212,77,122,0.5)] transition-colors hover:bg-[var(--theme-accent-hover)] disabled:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    <span>Sending to your keepsake sheet...</span>
                  </>
                ) : (
                  <span>{canRetrySend ? 'Retry Sending 💌' : feedback.submitLabel}</span>
                )}
              </button>
            </div>
          </motion.form>
        )}
      </div>
    </section>
  );
}

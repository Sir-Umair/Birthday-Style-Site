import { ArrowLeft } from 'lucide-react';
import { MusicPlayer } from './MusicPlayer';
import { birthdayConfig } from '../config/birthday';

export interface StoryStepMeta {
  id: string;
  shortLabel: string;
}

interface NavigationBarProps {
  steps: readonly StoryStepMeta[];
  currentStep: number;
  highestUnlocked: number;
  onSelectStep: (index: number) => void;
  onBack: () => void;
}

export function NavigationBar({
  steps,
  currentStep,
  highestUnlocked,
  onSelectStep,
  onBack,
}: NavigationBarProps) {
  const showBack = currentStep > 0;

  return (
    <header className="sticky top-0 z-30 h-14 w-full border-b border-[var(--theme-border)] bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2 shrink-0">
          {showBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go to previous screen"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[var(--theme-muted)] transition-colors hover:bg-[var(--theme-blush)] hover:text-[var(--theme-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onSelectStep(0)}
            className="font-display text-base sm:text-lg font-semibold tracking-tight text-[var(--theme-ink)] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] rounded-md px-1"
          >
            For {birthdayConfig.nickname}
          </button>
        </div>

        <nav aria-label="Birthday story chapters" className="hidden md:flex items-center gap-5 text-xs font-medium">
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isUnlocked = index <= highestUnlocked;
            return (
              <button
                key={step.id}
                type="button"
                disabled={!isUnlocked}
                onClick={() => isUnlocked && onSelectStep(index)}
                className={`relative py-2 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] rounded ${
                  isActive
                    ? 'text-[var(--theme-accent)] font-semibold cursor-pointer'
                    : isUnlocked
                      ? 'text-[var(--theme-muted)] hover:text-[var(--theme-ink)] cursor-pointer'
                      : 'text-[var(--theme-muted)]/40 cursor-not-allowed'
                }`}
              >
                {step.shortLabel}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[var(--theme-accent)]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs font-medium tabular-nums text-[var(--theme-muted)] md:hidden">
            {currentStep + 1} / {steps.length}
          </span>
          <MusicPlayer />
        </div>
      </div>
    </header>
  );
}

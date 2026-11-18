import { useState, type CSSProperties } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { birthdayConfig } from './config/birthday';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { NavigationBar, type StoryStepMeta } from './components/NavigationBar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { BirthdayCake } from './components/BirthdayCake';
import { BirthdayLetter } from './components/BirthdayLetter';
import { MemoriesGallery } from './components/MemoriesGallery';
import { FunZone } from './components/FunZone';
import { FinalSurprise } from './components/FinalSurprise';
import { FeedbackForm } from './components/FeedbackForm';

const STORY_STEPS: readonly StoryStepMeta[] = [
  { id: 'welcome', shortLabel: 'Welcome' },
  { id: 'cake', shortLabel: 'Cake' },
  { id: 'letter', shortLabel: 'Letter' },
  { id: 'memories', shortLabel: 'Memories' },
  { id: 'fun', shortLabel: 'Fun Zone' },
  { id: 'finale', shortLabel: 'Surprise' },
  { id: 'feedback', shortLabel: 'Feedback' },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [highestUnlocked, setHighestUnlocked] = useState(0);

  const goToStep = (index: number) => {
    const bounded = Math.max(0, Math.min(index, STORY_STEPS.length - 1));
    setCurrentStep(bounded);
    setHighestUnlocked((prev) => Math.max(prev, bounded));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    goToStep(currentStep + 1);
  };

  const handleBack = () => {
    goToStep(currentStep - 1);
  };

  const handleReplay = () => {
    goToStep(0);
  };

  const themeVars = {
    '--theme-canvas': birthdayConfig.theme.canvas,
    '--theme-surface': birthdayConfig.theme.surface,
    '--theme-blush': birthdayConfig.theme.blush,
    '--theme-lavender': birthdayConfig.theme.lavender,
    '--theme-cream': birthdayConfig.theme.cream,
    '--theme-ink': birthdayConfig.theme.ink,
    '--theme-muted': birthdayConfig.theme.muted,
    '--theme-accent': birthdayConfig.theme.accent,
    '--theme-accent-hover': birthdayConfig.theme.accentHover,
    '--theme-lavender-accent': birthdayConfig.theme.lavenderAccent,
  } as CSSProperties;

  return (
    <MotionConfig reducedMotion="user">
      <div
        style={themeVars}
        className="birthday-atmosphere relative min-h-dvh w-full overflow-x-hidden flex flex-col"
      >
        <AmbientBackdrop intensity={currentStep === 5 ? 'celebrate' : 'soft'} />

        <NavigationBar
          steps={STORY_STEPS}
          currentStep={currentStep}
          highestUnlocked={highestUnlocked}
          onSelectStep={goToStep}
          onBack={handleBack}
        />

        <main className="relative z-10 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={STORY_STEPS[currentStep].id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {currentStep === 0 && <WelcomeScreen onOpen={handleNext} />}
              {currentStep === 1 && <BirthdayCake onContinue={handleNext} />}
              {currentStep === 2 && <BirthdayLetter onContinue={handleNext} />}
              {currentStep === 3 && <MemoriesGallery onContinue={handleNext} />}
              {currentStep === 4 && <FunZone onContinue={handleNext} />}
              {currentStep === 5 && <FinalSurprise onContinue={handleNext} />}
              {currentStep === 6 && <FeedbackForm onReplayStory={handleReplay} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </MotionConfig>
  );
}

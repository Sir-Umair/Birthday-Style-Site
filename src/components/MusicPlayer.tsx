import { useCallback, useEffect, useRef, useState } from 'react';
import { Music, Pause, Volume2 } from 'lucide-react';
import { birthdayConfig } from '../config/birthday';

// Soft pentatonic music-box notes (Hz) used gently if no custom MP3 file is supplied yet.
const MUSIC_BOX_NOTES = [523.25, 659.25, 783.99, 987.77, 783.99, 659.25, 587.33, 659.25];

export function MusicPlayer() {
  const { enabled, trackTitle, audioSrc } = birthdayConfig.music;
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const chimeTimerRef = useRef<number | null>(null);
  const noteIdxRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [useSynthesizedChime, setUseSynthesizedChime] = useState(false);

  const stopChimeLoop = useCallback(() => {
    if (chimeTimerRef.current !== null) {
      window.clearInterval(chimeTimerRef.current);
      chimeTimerRef.current = null;
    }
  }, []);

  const playSoftNote = useCallback((ctx: AudioContext, freq: number) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.4);
  }, []);

  const startChimeLoop = useCallback(() => {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioCtx();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    stopChimeLoop();
    playSoftNote(ctx, MUSIC_BOX_NOTES[noteIdxRef.current % MUSIC_BOX_NOTES.length]);
    noteIdxRef.current += 1;

    chimeTimerRef.current = window.setInterval(() => {
      if (!audioCtxRef.current) return;
      playSoftNote(audioCtxRef.current, MUSIC_BOX_NOTES[noteIdxRef.current % MUSIC_BOX_NOTES.length]);
      noteIdxRef.current += 1;
    }, 900);
  }, [playSoftNote, stopChimeLoop]);

  useEffect(() => {
    return () => {
      stopChimeLoop();
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        void audioCtxRef.current.close();
      }
    };
  }, [stopChimeLoop]);

  if (!enabled) return null;

  const handleToggle = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopChimeLoop();
      setIsPlaying(false);
      return;
    }

    if (audioSrc && !useSynthesizedChime) {
      try {
        if (!audioRef.current) {
          const el = new Audio(audioSrc);
          el.loop = true;
          el.volume = 0.45;
          audioRef.current = el;
        }
        await audioRef.current.play();
        setIsPlaying(true);
        return;
      } catch {
        // Fallback smoothly to gentle music-box chimes if no local MP3 file was added yet
        setUseSynthesizedChime(true);
      }
    }

    startChimeLoop();
    setIsPlaying(true);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isPlaying ? `Pause ${trackTitle}` : `Play ${trackTitle}`}
      aria-pressed={isPlaying}
      title={isPlaying ? `Pause ${trackTitle}` : `Play ${trackTitle}`}
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border border-[var(--theme-border)] bg-white/85 px-3 text-xs font-medium text-[var(--theme-ink)] shadow-sm transition-colors hover:bg-[var(--theme-blush)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] whitespace-nowrap shrink-0 cursor-pointer"
    >
      {isPlaying ? (
        <>
          <Pause className="h-4 w-4 text-[var(--theme-accent)]" aria-hidden="true" />
          <span className="hidden sm:inline">Pause music</span>
          <Volume2 className="h-3.5 w-3.5 text-[var(--theme-accent)] sm:hidden" aria-hidden="true" />
        </>
      ) : (
        <>
          <Music className="h-4 w-4 text-[var(--theme-accent)]" aria-hidden="true" />
          <span className="hidden sm:inline">Play music</span>
        </>
      )}
    </button>
  );
}

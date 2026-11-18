import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Camera, ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { birthdayConfig, type MemoryPhoto } from '../config/birthday';

interface MemoriesGalleryProps {
  onContinue: () => void;
}

function MemoryImage({
  photo,
  className = '',
}: {
  photo: MemoryPhoto;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[var(--theme-blush)] via-[var(--theme-cream)] to-[var(--theme-lavender)] p-6 text-center ${className}`}
      >
        <Camera className="h-8 w-8 text-[var(--theme-accent)] opacity-75" aria-hidden="true" />
        <p className="mt-3 text-xs font-medium text-[var(--theme-muted)]">{photo.momentLabel}</p>
      </div>
    );
  }

  return (
    <img
      src={photo.src}
      alt={photo.alt}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}

export function MemoriesGallery({ onContinue }: MemoriesGalleryProps) {
  const prefersReducedMotion = useReducedMotion();
  const { memories } = birthdayConfig;
  const photos = memories.photos;

  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const cardWidth = el.clientWidth * 0.84;
    if (cardWidth <= 0) return;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActiveSlide(Math.max(0, Math.min(idx, photos.length - 1)));
  };

  const scrollToSlide = (index: number) => {
    const el = carouselRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(index, photos.length - 1));
    const child = el.children[clamped] as HTMLElement | undefined;
    if (child) {
      child.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
    }
    setActiveSlide(clamped);
  };

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % photos.length));
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + photos.length) % photos.length));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, photos.length]);

  const activePhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <section
      aria-labelledby="memories-heading"
      className="relative w-full px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-xs font-medium tracking-wide text-[var(--theme-muted)]">
            {memories.kicker}
          </p>
          <h1
            id="memories-heading"
            className="mt-2 font-display text-3xl font-semibold text-[var(--theme-ink)] sm:text-4xl"
          >
            {memories.title}
          </h1>
          <p className="mt-2.5 text-sm leading-relaxed text-[var(--theme-muted)] sm:text-base">
            {memories.subtitle}
          </p>
        </motion.div>

        {/* Mobile / Tablet Swipeable Carousel */}
        <div className="mt-7 lg:hidden">
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 pb-3"
          >
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="w-[82vw] max-w-[330px] shrink-0 snap-center"
              >
                <button
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`Open photo ${index + 1}: ${photo.momentLabel}`}
                  className="soft-card group block w-full overflow-hidden rounded-3xl p-3 text-left transition-transform active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] cursor-pointer"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[var(--theme-blush)]">
                    <MemoryImage
                      photo={photo}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                    <span
                      className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[var(--theme-ink)] shadow-sm backdrop-blur-sm"
                      aria-hidden="true"
                    >
                      <Expand className="h-4 w-4" />
                    </span>
                  </div>
                  <div className="px-1.5 pt-3.5 pb-1">
                    <p className="text-xs font-medium text-[var(--theme-accent)]">
                      {photo.momentLabel}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--theme-ink)]">
                      {photo.caption}
                    </p>
                  </div>
                </button>
              </div>
            ))}
          </div>

          {/* Mobile Carousel Controls */}
          <div className="mt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => scrollToSlide(activeSlide - 1)}
              disabled={activeSlide === 0}
              aria-label="Previous memory photo"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[var(--theme-border)] bg-white/85 text-[var(--theme-ink)] disabled:opacity-35 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-1.5" role="tablist" aria-label="Memory slides">
              {photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeSlide}
                  aria-label={`View slide ${idx + 1}`}
                  onClick={() => scrollToSlide(idx)}
                  className="flex min-h-[44px] min-w-[24px] items-center justify-center cursor-pointer"
                >
                  <span
                    className={`h-2 rounded-full transition-all ${
                      idx === activeSlide
                        ? 'w-6 bg-[var(--theme-accent)]'
                        : 'w-2 bg-[var(--theme-muted)]/30'
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scrollToSlide(activeSlide + 1)}
              disabled={activeSlide === photos.length - 1}
              aria-label="Next memory photo"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[var(--theme-border)] bg-white/85 text-[var(--theme-ink)] disabled:opacity-35 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Desktop Curated 3-Column Gallery */}
        <div className="mt-9 hidden lg:grid lg:grid-cols-3 lg:gap-6">
          {photos.map((photo, index) => (
            <motion.button
              key={photo.id}
              type="button"
              onClick={() => setLightboxIndex(index)}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="soft-card group flex flex-col overflow-hidden rounded-3xl p-3.5 text-left transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] cursor-pointer"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[var(--theme-blush)]">
                <MemoryImage
                  photo={photo}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <span
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[var(--theme-ink)] opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
                  aria-hidden="true"
                >
                  <Expand className="h-4 w-4" />
                </span>
              </div>
              <div className="px-1.5 pt-4 pb-1">
                <p className="text-xs font-medium text-[var(--theme-accent)]">
                  {photo.momentLabel}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--theme-ink)]">
                  {photo.caption}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Continue Button */}
        <div className="mt-9 flex justify-center pb-4">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-[var(--theme-accent)] px-8 py-3 text-sm sm:text-base font-semibold text-white shadow-[0_12px_24px_-8px_rgba(212,77,122,0.5)] transition-colors hover:bg-[var(--theme-accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--theme-accent)] whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{memories.continueLabel}</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activePhoto && lightboxIndex !== null && (
          <motion.div
            key="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={activePhoto.momentLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setLightboxIndex(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e1321]/85 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white p-3 sm:p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between px-1 pb-2.5">
                <span className="text-xs font-medium text-[var(--theme-accent)]">
                  {activePhoto.momentLabel} · {lightboxIndex + 1} / {photos.length}
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  aria-label="Close photo view"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-[var(--theme-ink)] hover:bg-[var(--theme-blush)] transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <div className="relative aspect-[3/4] max-h-[65dvh] w-full overflow-hidden rounded-2xl bg-[var(--theme-blush)]">
                <MemoryImage photo={activePhoto} className="h-full w-full object-cover" />
              </div>

              <p className="px-2 pt-4 pb-2 text-sm leading-relaxed text-[var(--theme-ink)] sm:text-base">
                {activePhoto.caption}
              </p>

              <div className="mt-1 flex items-center justify-between border-t border-[var(--theme-border)] pt-3 px-1">
                <button
                  type="button"
                  onClick={() => setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-xs font-medium text-[var(--theme-ink)] hover:bg-[var(--theme-blush)] cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxIndex((lightboxIndex + 1) % photos.length)}
                  className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-4 text-xs font-medium text-[var(--theme-ink)] hover:bg-[var(--theme-blush)] cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

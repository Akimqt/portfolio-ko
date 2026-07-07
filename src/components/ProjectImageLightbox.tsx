import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { DURATION, EASE_SMOOTH, EASE_EXIT } from "@/lib/motion-tokens";

/**
 * Fullscreen project-screenshot lightbox. Split out of ProjectsPanel (in
 * Portfolio.tsx) and lazy-loaded via React.lazy — it's only needed once a
 * visitor actually clicks into the gallery view, not on initial page load,
 * so there's no reason for its code to sit in the main bundle.
 */
export default function ProjectImageLightbox({
  gallery,
  activeImage,
  setActiveImage,
  projectTitle,
  lightboxOpen,
  onClose,
  prevImage,
  nextImage,
}: {
  gallery: string[];
  activeImage: number;
  setActiveImage: (idx: number) => void;
  projectTitle?: string;
  lightboxOpen: boolean;
  onClose: () => void;
  prevImage: () => void;
  nextImage: () => void;
}) {
  return (
    <AnimatePresence>
      {lightboxOpen && gallery[activeImage] && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 [backdrop-filter:blur(20px)_saturate(140%)] p-4"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close fullscreen"
            className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 [backdrop-filter:blur(14px)_saturate(160%)] text-white hover:bg-white/20 transition z-10"
          >
            <X size={20} />
          </button>

          {/* Image counter */}
          {gallery.length > 1 && (
            <span className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-white/60 font-mono z-10">
              {activeImage + 1} / {gallery.length}
            </span>
          )}

          {/* Prev arrow */}
          {gallery.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 [backdrop-filter:blur(14px)_saturate(160%)] text-white hover:bg-white/20 transition z-10"
            >
              <ArrowRight size={20} className="rotate-180" />
            </button>
          )}

          {/* Main fullscreen image */}
          <motion.img
            key={activeImage}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { duration: DURATION.base, ease: EASE_SMOOTH },
            }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.3, ease: EASE_EXIT } }}
            src={gallery[activeImage]}
            alt={projectTitle}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[82vh] max-w-[88vw] rounded-xl object-contain shadow-2xl"
          />

          {/* Next arrow */}
          {gallery.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/10 [backdrop-filter:blur(14px)_saturate(160%)] text-white hover:bg-white/20 transition z-10"
            >
              <ArrowRight size={20} />
            </button>
          )}

          {/* Thumbnail strip at the bottom */}
          {gallery.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10"
            >
              {gallery.map((src, idx) => (
                <button
                  key={src + idx}
                  onClick={() => setActiveImage(idx)}
                  className={`h-14 w-20 overflow-hidden rounded-lg border-2 transition ${
                    idx === activeImage
                      ? "border-[color:var(--turquoise)]"
                      : "border-white/20 hover:border-white/50 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={src}
                    alt={`${projectTitle} screenshot ${idx + 1} of ${gallery.length}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

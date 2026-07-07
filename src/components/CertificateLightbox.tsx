import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { DURATION, EASE_SMOOTH, EASE_EXIT } from "@/lib/motion-tokens";

/**
 * Fullscreen certificate-image preview. Split out of CertificatesPanel (in
 * Portfolio.tsx) and lazy-loaded via React.lazy — only needed once a visitor
 * clicks a certificate card, not on initial page load.
 */
export default function CertificateLightbox({
  lightbox,
  onClose,
}: {
  lightbox: { title: string; image: string } | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: DURATION.base, ease: EASE_SMOOTH } }}
          exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE_EXIT } }}
          onClick={onClose}
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 [backdrop-filter:blur(18px)_saturate(140%)] p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: { duration: DURATION.base, ease: EASE_SMOOTH },
            }}
            exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.3, ease: EASE_EXIT } }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full"
          >
            <img
              src={lightbox.image}
              alt={lightbox.title}
              className="w-full rounded-xl border border-white/10"
            />
            <button
              onClick={onClose}
              aria-label="Close certificate preview"
              className="absolute -top-3 -right-3 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/10 [backdrop-filter:blur(14px)_saturate(160%)] text-[color:var(--ice)] hover:text-[color:var(--turquoise)] hover:bg-white/20 transition"
            >
              <X size={18} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

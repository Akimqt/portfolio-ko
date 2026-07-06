import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
} from "framer-motion";
import { AlertTriangle, ImagePlus, Plus, Search, Star, Trash2, Upload, X } from "lucide-react";
import {
  EASE_SMOOTH,
  EASE_EXIT,
  DURATION,
  TAP_SCALE,
  usePrefersReducedMotion,
} from "@/lib/motion-tokens";
import { fileToDataUrl } from "@/lib/admin-store";
import { TECH_ICON_LIBRARY } from "@/lib/tech-icons";

/* Shared field styling — lifted verbatim from the contact form in
   Portfolio.tsx so every input in the app, admin panel included, looks and
   behaves the same way. */
export const fieldLabelClass =
  "text-[10px] font-mono uppercase tracking-wider text-[color:var(--slate-blue)]";
export const fieldInputClass =
  "mt-1.5 w-full rounded-lg border border-white/10 bg-[color:var(--background)]/50 px-4 py-3 text-sm text-[color:var(--ice)] outline-none transition focus:border-[color:var(--turquoise)] focus:shadow-[0_0_0_3px_rgba(68,127,152,0.2)] placeholder:text-[color:var(--slate-blue)]/50";

/* ---------------------------------------------------------------------------
 * TiltCard — cursor-following 3D perspective tilt + glare highlight.
 * Same interaction used for the project / value / cert cards on the public
 * site (see Portfolio.tsx), lifted here so the admin panel's cards get the
 * same "premium hardware" feel as the rest of the portfolio.
 * ------------------------------------------------------------------------- */
export function TiltCard({
  children,
  className = "",
  maxTilt = 6,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 260, damping: 22, mass: 0.6 });
  const springRotateY = useSpring(rotateY, { stiffness: 260, damping: 22, mass: 0.6 });
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);
  const glareOpacity = useSpring(0, { stiffness: 300, damping: 30 });
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, white, transparent 60%)`;

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * maxTilt * 2);
    rotateX.set((0.5 - py) * maxTilt * 2);
    glareX.set(px * 100);
    glareY.set(py * 100);
    glareOpacity.set(0.1);
  };

  const onMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glareOpacity.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        rotateX: reduced ? 0 : springRotateX,
        rotateY: reduced ? 0 : springRotateY,
        transformPerspective: 900,
      }}
      className={`relative ${className}`}
    >
      {children}
      {glare && !reduced && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ opacity: glareOpacity, background: glareBackground }}
        />
      )}
    </motion.div>
  );
}

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={fieldLabelClass}>
        {label}
        {required && <span className="text-[color:var(--turquoise)]"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-[color:var(--slate-blue)]/70">{hint}</p>}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Modal — used for every "Add / Edit" form in the admin panel.
 * ------------------------------------------------------------------------- */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: DURATION.base, ease: EASE_SMOOTH } }}
          exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE_EXIT } }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { duration: DURATION.base, ease: EASE_SMOOTH },
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 10,
              transition: { duration: 0.3, ease: EASE_EXIT },
            }}
            className="card-surface flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden !bg-[color:var(--background)]/95"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <h3
                id="admin-modal-title"
                className="font-display text-xl font-semibold text-[color:var(--ice)]"
              >
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full text-[color:var(--slate-blue)] transition hover:bg-white/5 hover:text-[color:var(--ice)]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">{children}</div>
            <div className="flex justify-end gap-3 border-t border-white/10 px-6 py-4">
              {footer}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : TAP_SCALE}
      className="flex items-center justify-center gap-2 rounded-full bg-[color:var(--turquoise)] px-5 py-2.5 text-sm font-medium text-[color:var(--background)] transition-shadow hover:shadow-[0_0_30px_-8px_rgba(68,127,152,0.9)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </motion.button>
  );
}

export function GhostButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={TAP_SCALE}
      className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-medium text-[color:var(--platinum)] transition hover:border-[color:var(--slate-blue)]/50 hover:text-[color:var(--ice)]"
    >
      {children}
    </motion.button>
  );
}

/* ---------------------------------------------------------------------------
 * ConfirmDialog — delete confirmations across every manager.
 * ------------------------------------------------------------------------- */
export function ConfirmDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: DURATION.base, ease: EASE_SMOOTH } }}
          exit={{ opacity: 0, transition: { duration: 0.3, ease: EASE_EXIT } }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="admin-confirm-title"
          aria-describedby="admin-confirm-description"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { duration: DURATION.base, ease: EASE_SMOOTH },
            }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.3, ease: EASE_EXIT } }}
            className="card-surface w-full max-w-sm !bg-[color:var(--background)]/95 p-6 text-center"
          >
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[color:var(--destructive)]/15 text-[color:var(--destructive)]">
              <AlertTriangle size={22} />
            </div>
            <h3
              id="admin-confirm-title"
              className="mt-4 font-display text-lg font-semibold text-[color:var(--ice)]"
            >
              {title}
            </h3>
            <p id="admin-confirm-description" className="mt-2 text-sm text-[color:var(--platinum)]/75">
              {description}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <GhostButton onClick={onCancel}>Cancel</GhostButton>
              <motion.button
                type="button"
                onClick={onConfirm}
                whileTap={TAP_SCALE}
                className="rounded-full bg-[color:var(--destructive)] px-5 py-2.5 text-sm font-medium text-[color:var(--destructive-foreground)] transition-shadow hover:shadow-[0_0_30px_-8px_rgba(220,38,38,0.6)]"
              >
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------------------------
 * TagInput — the "Enter a feature / Enter a technology"-style pill input.
 * ------------------------------------------------------------------------- */
export function TagInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const v = draft.trim();
    if (!v || values.includes(v)) {
      setDraft("");
      return;
    }
    onChange([...values, v]);
    setDraft("");
  };

  return (
    <div>
      <div className="mt-1.5 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          placeholder={placeholder}
          className={fieldInputClass + " mt-0"}
        />
        <motion.button
          type="button"
          onClick={commit}
          whileTap={TAP_SCALE}
          aria-label="Add"
          className="grid h-[46px] w-12 shrink-0 place-items-center rounded-lg bg-[color:var(--turquoise)]/20 text-[color:var(--turquoise)] transition hover:bg-[color:var(--turquoise)]/30"
        >
          <Plus size={18} />
        </motion.button>
      </div>
      {values.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {values.map((v) => (
            <span
              key={v}
              className="flex items-center gap-1.5 rounded-full border border-[color:var(--turquoise)]/30 bg-[color:var(--turquoise)]/15 px-3 py-1 text-xs text-[color:var(--ice)]"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                aria-label={`Remove ${v}`}
                className="text-[color:var(--turquoise)] hover:text-[color:var(--ice)]"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * IconPicker — searchable grid for choosing a tech-stack logo.
 * ------------------------------------------------------------------------- */
export function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (iconKey: string, defaultColor: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = TECH_ICON_LIBRARY.filter((i) =>
    i.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div>
      <div className="relative mt-1.5">
        <Search
          size={14}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[color:var(--slate-blue)]"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search icons…"
          className={fieldInputClass + " mt-0 pl-9"}
        />
      </div>
      <div className="mt-3 grid max-h-40 grid-cols-6 gap-2 overflow-y-auto rounded-lg border border-white/10 bg-[color:var(--background)]/40 p-2 sm:grid-cols-8">
        {filtered.map((i) => {
          const Icon = i.icon;
          const active = value === i.key;
          return (
            <button
              key={i.key}
              type="button"
              title={i.label}
              onClick={() => onChange(i.key, i.defaultColor)}
              className={`grid aspect-square place-items-center rounded-lg text-lg transition ${
                active
                  ? "bg-[color:var(--turquoise)]/25 text-[color:var(--turquoise)] ring-1 ring-[color:var(--turquoise)]/50"
                  : "text-[color:var(--platinum)]/70 hover:bg-white/5 hover:text-[color:var(--ice)]"
              }`}
            >
              <Icon />
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-4 text-center text-xs text-[color:var(--slate-blue)]">
            No icons match “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * ImageField — paste a URL or upload a file (stored as a data URL).
 * ------------------------------------------------------------------------- */
export function ImageField({
  value,
  onChange,
  aspect = "aspect-video",
}: {
  value: string | undefined;
  onChange: (next: string) => void;
  aspect?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      onChange(dataUrl);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-1.5 space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={value?.startsWith("data:") ? "" : (value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className={fieldInputClass + " mt-0"}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <motion.button
          type="button"
          onClick={() => fileRef.current?.click()}
          whileTap={TAP_SCALE}
          disabled={busy}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-medium text-[color:var(--platinum)] transition hover:border-[color:var(--turquoise)]/50 hover:text-[color:var(--ice)] disabled:opacity-60"
        >
          <Upload size={14} />
          {busy ? "Reading…" : "Upload"}
        </motion.button>
      </div>
      <p className="text-xs text-[color:var(--slate-blue)]/70">
        Paste an image URL, or upload a file from your device (stored in your browser).
      </p>
      {value && (
        <div
          className={`relative ${aspect} w-full max-w-[220px] overflow-hidden rounded-lg border border-white/10 bg-[color:var(--surface-2)]/60`}
        >
          <img src={value} alt="Preview" className="h-full w-full object-cover" />
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * GalleryField — the full set of screenshots shown in the project's lightbox
 * on the public site (Portfolio.tsx reads this as `project.gallery`). Add as
 * many images as you like via URL or upload, reorder with the arrows, star
 * one as the cover image, or remove it from the set.
 * ------------------------------------------------------------------------- */
export function GalleryField({
  values,
  onChange,
  coverImage,
  onSetCover,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  /** Current cover image value, so we can highlight/star the matching thumbnail. */
  coverImage?: string;
  /** Optional — lets a thumbnail be promoted to the cover-image field in one click. */
  onSetCover?: (src: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlDraft, setUrlDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const addImage = (src: string) => {
    if (!src.trim()) return;
    onChange([...values, src.trim()]);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const dataUrls = await Promise.all(Array.from(files).map(fileToDataUrl));
      onChange([...values, ...dataUrls]);
    } finally {
      setBusy(false);
    }
  };

  const removeAt = (idx: number) => onChange(values.filter((_, i) => i !== idx));

  const moveBy = (idx: number, dir: -1 | 1) => {
    const next = [...values];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="mt-1.5 space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={urlDraft}
          onChange={(e) => setUrlDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addImage(urlDraft);
              setUrlDraft("");
            }
          }}
          placeholder="https://example.com/screenshot.png"
          className={fieldInputClass + " mt-0"}
        />
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <motion.button
          type="button"
          onClick={() => fileRef.current?.click()}
          whileTap={TAP_SCALE}
          disabled={busy}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-medium text-[color:var(--platinum)] transition hover:border-[color:var(--turquoise)]/50 hover:text-[color:var(--ice)] disabled:opacity-60"
        >
          <ImagePlus size={14} />
          {busy ? "Reading…" : "Upload"}
        </motion.button>
      </div>
      <p className="text-xs text-[color:var(--slate-blue)]/70">
        These are the screenshots shown in the project's lightbox on your portfolio. Add a few for
        the full walkthrough — if left empty, only the cover image will be shown.
      </p>

      {values.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {values.map((src, idx) => {
            const isCover = !!coverImage && src === coverImage;
            return (
              <div
                key={`${src.slice(0, 24)}-${idx}`}
                className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-[color:var(--surface-2)]/60"
              >
                <img src={src} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" />
                <div className="absolute inset-0 flex flex-col justify-between bg-black/0 p-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:bg-black/50 sm:group-hover:opacity-100">
                  <div className="flex justify-end gap-1">
                    {onSetCover && (
                      <button
                        type="button"
                        onClick={() => onSetCover(src)}
                        title="Use as cover image"
                        aria-label="Use as cover image"
                        className={`grid h-6 w-6 place-items-center rounded-full transition ${
                          isCover
                            ? "bg-[color:var(--turquoise)] text-[color:var(--background)]"
                            : "bg-black/60 text-white hover:bg-[color:var(--turquoise)] hover:text-[color:var(--background)]"
                        }`}
                      >
                        <Star size={12} fill={isCover ? "currentColor" : "none"} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAt(idx)}
                      title="Remove"
                      aria-label="Remove image"
                      className="grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white transition hover:bg-[color:var(--destructive)]"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => moveBy(idx, -1)}
                      disabled={idx === 0}
                      aria-label="Move earlier"
                      className="grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white transition hover:bg-white/20 disabled:pointer-events-none disabled:opacity-30"
                    >
                      ‹
                    </button>
                    <span className="text-[10px] font-mono text-white/80">{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => moveBy(idx, 1)}
                      disabled={idx === values.length - 1}
                      aria-label="Move later"
                      className="grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white transition hover:bg-white/20 disabled:pointer-events-none disabled:opacity-30"
                    >
                      ›
                    </button>
                  </div>
                </div>
                {isCover && (
                  <span className="pointer-events-none absolute left-1.5 top-1.5 rounded-full bg-[color:var(--turquoise)] p-1 text-[color:var(--background)]">
                    <Star size={10} fill="currentColor" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useSpring,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import {
  Menu,
  X,
  ArrowRight,
  ArrowUp,
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Github,
  Download,
  ChevronDown,
  Cpu,
  Users,
  Sparkles,
  Rocket,
  Award,
  ExternalLink,
  CircleCheckBig,
  Wrench,
  MessageSquare,
  Send,
  FolderGit2,
  BadgeCheck,
  Layers,
  Loader2,
  Code2,
  Pin,
} from "lucide-react";
import { SiFacebook } from "react-icons/si";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import portrait from "@/assets/portrait.png";
import { useProjects, type Project } from "@/lib/projects";
import { useTechStack, type TechStackItem } from "@/lib/tech-stack";
import { getTechIcon } from "@/lib/tech-icons";
import { useCertificates } from "@/lib/certificates";
import { useExperience } from "@/lib/experience";
import { getExperienceIcon } from "@/lib/experience-icons";
import { useComments, formatRelativeTime, type Comment } from "@/lib/comments";
import { useSiteSettings } from "@/lib/settings";

/* ---------- Accessibility: reduced-motion hook ---------- */

/**
 * Returns true when the user has requested reduced motion via their OS/browser
 * settings (prefers-reduced-motion: reduce). Used site-wide to skip or simplify
 * animations without requiring any per-callsite opt-in.
 */
function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return prefersReducedMotion;
}

/* ---------- Dynamic stats: program start date ---------- */

/**
 * The year Karl started the BS Computer Engineering program.
 * The "Years in CompEng" / "Years Studying" stats are calculated from this
 * constant so they stay correct automatically each year — no manual updates needed.
 */
const PROGRAM_START_YEAR = 2024;

/** Returns the number of full years since PROGRAM_START_YEAR. */
function yearsStudying(): number {
  return new Date().getFullYear() - PROGRAM_START_YEAR;
}

/* ---------- Shared ---------- */

/**
 * Site-wide motion tokens. Every hand-rolled transition on the page draws
 * from this small set instead of improvising its own duration/curve, so
 * hover, reveal, and exit motion all share one "rhythm" no matter which
 * section you're in.
 *
 * EASE_SMOOTH: the signature exponential ease-out — fast start, long soft
 * settle. Used for anything entering the screen.
 * EASE_CRISP: a shorter ease-out for exits/quick state flips — exits read
 * best at roughly 60-70% of the matching enter duration.
 * SPRING_LIFT: the physical spring behind hover/press feedback on cards and
 * icons — slightly under-damped so it has a touch of life without ever
 * overshooting into cartoon territory.
 * SPRING_SNAPPY: a stiffer spring for small, precise UI (tab pills, nav
 * indicator) that needs to feel immediate rather than floaty.
 */
const EASE_SMOOTH = [0.16, 1, 0.3, 1] as const;
const EASE_CRISP = [0.4, 0, 0.2, 1] as const;
const SPRING_LIFT = { type: "spring", stiffness: 340, damping: 24, mass: 0.7 } as const;
const SPRING_SNAPPY = { type: "spring", stiffness: 420, damping: 32, mass: 0.5 } as const;
const TAP_SCALE = { scale: 0.96 };

const NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "works", label: "Portfolio" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

const scrollTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
};

function Reveal({
  children,
  delay = 0,
  y = 24,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}) {
  const reduced = usePrefersReducedMotion();

  // When reduced motion is preferred, skip the animation entirely and just
  // render content at full opacity with no transform.
  if (reduced) {
    return <div>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, delay, ease: EASE_SMOOTH }}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  accent,
  sub,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  sub?: string;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <div className="mx-auto max-w-2xl text-center">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[color:var(--turquoise)]">
          {eyebrow}
        </p>
        {reduced ? (
          <div className="mx-auto mt-2 h-px w-12 bg-gradient-to-r from-[color:var(--turquoise)] to-transparent" />
        ) : (
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE_SMOOTH }}
            className="mx-auto mt-2 h-px w-12 origin-left bg-gradient-to-r from-[color:var(--turquoise)] to-transparent"
          />
        )}
      </Reveal>
      {/* Headline gets its own entrance rather than the generic fade-up every
          other element uses — a short blur-to-focus pull, like the words are
          resolving into view rather than just sliding in. It's the one line
          per section worth making feel distinct. */}
      {reduced ? (
        <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
          {title} {accent && <span className="gradient-text">{accent}</span>}
        </h2>
      ) : (
        <motion.h2
          initial={{ opacity: 0, y: 14, scale: 0.97, filter: "blur(8px)" }}
          whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.08, ease: EASE_SMOOTH }}
          className="mt-4 text-4xl font-bold sm:text-5xl"
        >
          {title} {accent && <span className="gradient-text">{accent}</span>}
        </motion.h2>
      )}
      {sub && (
        <Reveal delay={0.16}>
          <p className="mt-4 text-[color:var(--slate-blue)]">{sub}</p>
        </Reveal>
      )}
    </div>
  );
}

/* ---------- Magnetic button: cursor-attraction micro-interaction ---------- */

/**
 * Wraps any interactive element so it "pulls" gently toward the cursor when
 * hovered, and snaps back on leave. Disabled entirely on touch devices (no
 * mouse to attract toward) and under prefers-reduced-motion.
 */
function MagneticButton({
  children,
  className = "",
  strength = 0.35,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  // Raw motion values updated imperatively on mousemove, each wrapped in its
  // own spring — same pattern as TiltCard, so the magnetic pull never routes
  // through React state and can't get out of step with a fast cursor.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 14, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 14, mass: 0.4 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const onMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ x: reduced ? 0 : springX, y: reduced ? 0 : springY }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Tilt card: cursor-following 3D perspective tilt ---------- */

/**
 * Gives any card a subtle 3D tilt that follows the cursor, plus a glossy
 * highlight that tracks the pointer. Used for project / value / cert cards
 * so the "premium hardware" feel extends to interaction, not just visuals.
 */
function TiltCard({
  children,
  className = "",
  maxTilt = 8,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glare?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  // Motion values instead of React state: mousemove writes straight to these
  // and Framer pushes the result to the compositor thread every frame, so a
  // fast-moving cursor never triggers a React re-render or fights an
  // in-flight CSS transition. useSpring gives the tilt its physical
  // "settle" — a light, slightly under-damped drift toward the target
  // rather than a linear chase — and relaxes cleanly back to flat on leave.
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
    glareOpacity.set(0.12);
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

/* ---------- Cursor glow: ambient signature element ---------- */

/**
 * A soft turquoise glow that follows the cursor across the entire page,
 * sitting behind all content. This is the site's signature ambient effect —
 * ties the "circuit board" motif into something that reacts to the visitor,
 * rather than just looping on its own. Desktop-only and respects
 * prefers-reduced-motion (skipped entirely in both cases).
 */
function CursorGlow() {
  const reduced = usePrefersReducedMotion();
  const x = useRef(0);
  const y = useRef(0);
  const glowRef = useRef<HTMLDivElement>(null);
  const innerGlowRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (reduced) return;
    // Only enable on devices with a real pointer (skip touch-only devices).
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    setEnabled(hasFinePointer);
    if (!hasFinePointer) return;

    const onMove = (e: MouseEvent) => {
      x.current = e.clientX;
      y.current = e.clientY;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${x.current - 175}px, ${y.current - 175}px, 0)`;
      }
      if (innerGlowRef.current) {
        innerGlowRef.current.style.transform = `translate3d(${x.current - 60}px, ${y.current - 60}px, 0)`;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced]);

  if (reduced || !enabled) return null;

  return (
    <>
      {/* Outer spotlight — tighter radius than before for a more focused feel */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed left-0 top-0 z-[1] h-[350px] w-[350px] rounded-full opacity-[0.12] blur-3xl will-change-transform"
        style={{ background: "radial-gradient(circle, var(--turquoise), transparent 70%)" }}
        aria-hidden="true"
      />
      {/* Inner glow — smaller, brighter core at the same cursor position */}
      <div
        ref={innerGlowRef}
        className="pointer-events-none fixed left-0 top-0 z-[1] h-[120px] w-[120px] rounded-full opacity-[0.18] blur-2xl will-change-transform"
        style={{ background: "radial-gradient(circle, var(--ice), transparent 70%)" }}
        aria-hidden="true"
      />
    </>
  );
}

/* ---------- Navbar ---------- */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const { scrollYProgress } = useScroll();
  const progressWidth = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      // Active section detection
      const offsets = NAV.map((n) => {
        const el = document.getElementById(n.id);
        if (!el) return { id: n.id, top: Infinity };
        return { id: n.id, top: Math.abs(el.getBoundingClientRect().top - 120) };
      });
      offsets.sort((a, b) => a.top - b.top);
      setActive(offsets[0].id);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Scroll progress bar — tracks how far down the page the visitor is */}
      <div className="fixed inset-x-0 top-0 z-50 h-px bg-white/5">
        <motion.div
          style={{ scaleX: progressWidth }}
          className="h-full w-full origin-left bg-gradient-to-r from-[color:var(--turquoise)] via-[color:var(--ice)] to-[color:var(--turquoise)]"
        />
      </div>
      <header
        className={`fixed inset-x-0 top-0 z-40 backdrop-blur-md transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-2xl [backdrop-filter:blur(28px)_saturate(160%)] bg-[color:var(--background)]/75 border-b border-[color:var(--turquoise)]/10 shadow-[0_1px_0_0_rgba(68,127,152,0.15),inset_0_-1px_0_rgba(68,127,152,0.15)]"
            : "bg-[color:var(--background)]/10"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            onClick={() => scrollTo("home")}
            className="font-mono text-sm text-[color:var(--platinum)] hover:text-[color:var(--ice)] transition"
          >
            <span className="text-[color:var(--slate-blue)]">&lt;</span>
            karl<span className="text-[color:var(--turquoise)]">.</span>dev
            <span className="text-[color:var(--slate-blue)]">/&gt;</span>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map((n) => (
              <motion.button
                key={n.id}
                whileTap={TAP_SCALE}
                onClick={() => scrollTo(n.id)}
                className="relative px-3 py-2 text-sm text-[color:var(--platinum)]/80 hover:text-[color:var(--ice)] transition-colors"
              >
                {n.label}
                {active === n.id && (
                  <motion.span
                    layoutId="nav-active"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gradient-to-r from-[color:var(--turquoise)] to-[color:var(--ice)]"
                  />
                )}
              </motion.button>
            ))}
          </nav>

          <div className="hidden lg:block">
            <MagneticButton strength={0.4}>
              <motion.button
                whileTap={TAP_SCALE}
                onClick={() => scrollTo("contact")}
                className="rounded-full bg-[color:var(--turquoise)] px-5 py-2 text-sm font-medium text-[color:var(--background)] transition-shadow hover:shadow-[0_0_30px_-5px_rgba(68,127,152,0.8)]"
              >
                Let's Connect
              </motion.button>
            </MagneticButton>
          </div>

          <motion.button
            whileTap={TAP_SCALE}
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden p-2 text-[color:var(--platinum)]"
          >
            <AnimatePresence mode="wait">
              {open ? (
                <motion.div
                  key="x"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <X size={22} />
                </motion.div>
              ) : (
                <motion.div
                  key="m"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                >
                  <Menu size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden overflow-hidden border-t border-white/5 border-b border-[color:var(--turquoise)]/15 bg-[color:var(--background)]/85 [backdrop-filter:blur(28px)_saturate(160%)]"
            >
              <div className="flex flex-col px-6 py-4 gap-1">
                {NAV.map((n, i) => (
                  <motion.button
                    key={n.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, ease: EASE_SMOOTH }}
                    whileTap={TAP_SCALE}
                    onClick={() => {
                      scrollTo(n.id);
                      setOpen(false);
                    }}
                    className="text-left py-2.5 text-[color:var(--platinum)]/90"
                  >
                    {n.label}
                  </motion.button>
                ))}
                <motion.button
                  whileTap={TAP_SCALE}
                  onClick={() => {
                    scrollTo("contact");
                    setOpen(false);
                  }}
                  className="mt-2 rounded-full bg-[color:var(--turquoise)] px-5 py-2.5 text-sm font-medium text-[color:var(--background)]"
                >
                  Let's Connect
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

/* ---------- Hero ---------- */

const HERO_LEAD = "Building";
// The second hero word cycles through these — "Practical" is the resting/first
// value so the base headline always reads "Building Practical Tech & IoT
// Solutions" on first paint (and under prefers-reduced-motion, permanently).
const HERO_CYCLE_WORDS = ["Practical", "Scalable", "Embedded", "Real-World"];
const HERO_ACCENT = ["Tech", "&", "IoT"];
const HERO_TAIL = ["Solutions"];

/**
 * Cycles through `words` with a clip-path reveal (bottom-to-top wipe), pausing
 * permanently on the first word when prefers-reduced-motion is set.
 */
function CyclingWord({ words, className = "" }: { words: string[]; className?: string }) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), 2500);
    return () => clearInterval(id);
  }, [reduced, words.length]);

  if (reduced) {
    return <span className={`inline-block ${className}`}>{words[0]}</span>;
  }

  return (
    <span className="inline-grid align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ clipPath: "inset(100% 0 0 0)", opacity: 0 }}
          animate={{ clipPath: "inset(0% 0 0 0)", opacity: 1 }}
          exit={{ clipPath: "inset(0 0 100% 0)", opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
          className={`col-start-1 row-start-1 inline-block ${className}`}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Hero() {
  const reduced = usePrefersReducedMotion();
  const { settings } = useSiteSettings();

  return (
    <section id="home" className="relative min-h-screen pt-32 pb-20 px-6 overflow-hidden">
      {/* Glow blobs — disabled when prefers-reduced-motion is set */}
      <div
        className={`pointer-events-none absolute -top-20 -left-20 h-[480px] w-[480px] rounded-full bg-[color:var(--turquoise)]/20 blur-3xl ${reduced ? "" : "animate-float-blob"}`}
      />
      <div
        className={`pointer-events-none absolute top-40 -right-32 h-[520px] w-[520px] rounded-full bg-[color:var(--slate-blue)]/15 blur-3xl ${reduced ? "" : "animate-float-blob"}`}
        style={reduced ? undefined : { animationDelay: "-6s" }}
      />
      <div className="pointer-events-none absolute inset-0 starfield opacity-60" />
      <div className="pointer-events-none absolute inset-0 circuit-trace opacity-70" />

      <div className="relative mx-auto max-w-5xl text-center">
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 0.1, ease: EASE_SMOOTH }}
          className="font-mono text-xs uppercase tracking-[0.4em] text-[color:var(--turquoise)]"
        >
          Portfolio — 2026
        </motion.p>

        <h1 className="mt-6 text-5xl font-bold leading-[1.05] sm:text-7xl md:text-8xl">
          <span className="block">
            <motion.span
              initial={reduced ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? {} : { delay: 0.2, duration: 0.7, ease: EASE_SMOOTH }}
              className="inline-block mr-4"
            >
              {HERO_LEAD}
            </motion.span>
            <motion.span
              initial={reduced ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduced ? {} : { delay: 0.3, duration: 0.7, ease: EASE_SMOOTH }}
              className="inline-block"
            >
              <CyclingWord words={HERO_CYCLE_WORDS} />
            </motion.span>
          </span>
          <span className="block mt-2">
            {HERO_ACCENT.map((w, i) => (
              <motion.span
                key={w}
                initial={reduced ? false : { opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduced ? {} : { delay: 0.5 + i * 0.1, duration: 0.7, ease: EASE_SMOOTH }
                }
                className="inline-block mr-4 gradient-text"
              >
                {w}
              </motion.span>
            ))}
            {HERO_TAIL.map((w, i) => (
              <motion.span
                key={w}
                initial={reduced ? false : { opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  reduced ? {} : { delay: 0.85 + i * 0.1, duration: 0.7, ease: EASE_SMOOTH }
                }
                className="inline-block"
              >
                {w}
              </motion.span>
            ))}
          </span>
        </h1>

        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 1.1, ease: EASE_SMOOTH }}
          className="mt-8 space-y-2"
        >
          <p className="text-xl font-medium text-[color:var(--platinum)]">{settings.fullName}</p>
          <p className="text-[color:var(--slate-blue)]">{settings.role}</p>
          <p className="flex items-center justify-center gap-1.5 text-sm text-[color:var(--slate-blue)]/80">
            <MapPin size={14} /> {settings.location}
          </p>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 1.2, ease: EASE_SMOOTH }}
          className="mt-5 flex justify-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 [backdrop-filter:blur(12px)_saturate(160%)] px-3.5 py-1.5 font-mono text-xs text-green-400">
            <span className="relative flex h-2 w-2">
              {!reduced && (
                <span className="absolute inline-flex h-full w-full animate-availability rounded-full bg-green-400" />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            {settings.availabilityText}
          </span>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : 1.3, ease: EASE_SMOOTH }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <MagneticButton strength={0.3}>
            <button
              onClick={() => scrollTo("works")}
              className="group rounded-full bg-[color:var(--turquoise)] px-6 py-3 text-sm font-medium text-[color:var(--background)] transition hover:shadow-[0_0_40px_-5px_rgba(68,127,152,0.9)] flex items-center gap-2"
            >
              View My Work <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </button>
          </MagneticButton>
          {/*
            RESUME DOWNLOAD — "Let's Connect" style outlined button.
            Drop your resume PDF into the public/ folder as "resume.pdf" and
            this link will work automatically. If you host the PDF elsewhere,
            update the href below to the full URL.
          */}
          <MagneticButton strength={0.3}>
            <a
              href={settings.resumeUrl}
              download
              className="rounded-full border border-[color:var(--slate-blue)]/50 px-6 py-3 text-sm font-medium text-[color:var(--platinum)] transition hover:border-[color:var(--turquoise)] hover:text-[color:var(--ice)] flex items-center gap-2"
            >
              <Download size={15} /> Download Resume
            </a>
          </MagneticButton>
          <MagneticButton strength={0.3}>
            <button
              onClick={() => scrollTo("contact")}
              className="rounded-full border border-[color:var(--slate-blue)]/50 px-6 py-3 text-sm font-medium text-[color:var(--platinum)] transition hover:border-[color:var(--turquoise)] hover:text-[color:var(--ice)]"
            >
              Let's Connect
            </button>
          </MagneticButton>
        </motion.div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          {[
            { n: "3+", l: "Projects Built" },
            // Calculated dynamically from PROGRAM_START_YEAR so it stays correct each year.
            { n: `${yearsStudying()}`, l: "Years in CompEng" },
            { n: "5", l: "Member Team Led" },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              initial={reduced ? false : { opacity: 0, y: 14, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={reduced ? undefined : { y: -3, borderColor: "#447f98" }}
              transition={reduced ? {} : { delay: 1.5 + i * 0.1, duration: 0.5, ease: EASE_SMOOTH }}
              className="card-surface px-5 py-3"
            >
              <div className="text-lg font-bold gradient-text">{s.n}</div>
              <div className="text-xs text-[color:var(--slate-blue)]">{s.l}</div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 1.8, ease: EASE_SMOOTH }}
          className="mt-20 flex flex-col items-center gap-2 text-[color:var(--slate-blue)]"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">
            Scroll to Explore
          </span>
          {/* Bounce animation disabled when prefers-reduced-motion is set */}
          <ChevronDown size={18} className={reduced ? "" : "animate-bounce-down"} />
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- About: animated skill bars ---------- */

const SKILLS: { name: string; level: number }[] = [
  { name: "React / Next.js", level: 85 },
  { name: "Go (Gin)", level: 70 },
  { name: "Flutter / Dart", level: 65 },
  { name: "IoT / Embedded", level: 75 },
  { name: "PCB Design", level: 55 },
];

function SkillBars() {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="mt-8 space-y-4">
      {SKILLS.map((s, i) => (
        <div key={s.name}>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-[color:var(--platinum)]/90">{s.name}</span>
            <span className="font-mono text-xs text-[color:var(--slate-blue)]">
              {inView || reduced ? <CountUp to={s.level} suffix="%" /> : "0%"}
            </span>
          </div>
          <div className="relative mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[color:var(--turquoise)]/20">
            <motion.div
              initial={reduced ? false : { width: 0 }}
              animate={{ width: inView || reduced ? `${s.level}%` : 0 }}
              transition={
                reduced ? { duration: 0 } : { duration: 1.1, delay: i * 0.1, ease: EASE_SMOOTH }
              }
              className="h-full rounded-full bg-gradient-to-r from-[color:var(--turquoise)] to-[color:var(--ice)]"
            />
            {/* Traveling highlight riding the leading edge of the fill — a small
                bright core that arrives exactly as the bar finishes, giving the
                fill a sense of momentum rather than a flat mechanical wipe. */}
            {!reduced && (
              <motion.div
                initial={{ left: "0%", opacity: 0 }}
                animate={
                  inView ? { left: `${s.level}%`, opacity: [0, 1, 0] } : { left: "0%", opacity: 0 }
                }
                transition={{ duration: 1.1, delay: i * 0.1, ease: EASE_SMOOTH }}
                className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color:var(--ice)] blur-[3px]"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- About ---------- */

function About() {
  const reduced = usePrefersReducedMotion();
  const { settings } = useSiteSettings();
  const badges = [
    "Full-Stack Developer",
    "Computer Engineering Student",
    "Team Lead",
    "IoT & Embedded Enthusiast",
  ];
  const values = [
    {
      i: <CircleCheckBig size={20} />,
      t: "Quality-First",
      d: "Care for the details that make products feel solid.",
    },
    {
      i: <Wrench size={20} />,
      t: "Hands-On Builder",
      d: "Comfortable from soldering iron to React component.",
    },
    {
      i: <Rocket size={20} />,
      t: "Reliable Delivery",
      d: "Plans the work, ships on schedule, communicates blockers.",
    },
    {
      i: <MessageSquare size={20} />,
      t: "Clear Communication",
      d: "Translates technical decisions into plain language.",
    },
  ];
  return (
    <section id="about" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow="About" title="Who" accent="I Am" />

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="relative mx-auto w-fit">
              <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-[color:var(--turquoise)]/30 to-[color:var(--slate-blue)]/20 blur-2xl" />
              <TiltCard
                maxTilt={6}
                className="relative overflow-hidden rounded-3xl border border-white/10"
              >
                {/* Hero portrait is above the fold — load eagerly for best LCP */}
                <img
                  src={portrait}
                  alt={settings.fullName}
                  width={384}
                  height={512}
                  loading="eager"
                  className="h-[480px] w-[360px] object-cover"
                />
              </TiltCard>
              {badges.map((b, i) => {
                const positions = [
                  "top-4 -left-6 sm:-left-16",
                  "top-1/3 -right-4 sm:-right-20",
                  "bottom-1/3 -left-4 sm:-left-24",
                  "-bottom-2 -right-2 sm:-right-12",
                ];
                // When reduced motion is preferred, show badges statically (no float animation).
                if (reduced) {
                  return (
                    <div
                      key={b}
                      className={`absolute ${positions[i]} card-surface px-3 py-1.5 text-xs font-medium text-[color:var(--platinum)] hidden md:block`}
                    >
                      {b}
                    </div>
                  );
                }
                return (
                  <motion.div
                    key={b}
                    initial={{ opacity: 0, scale: 0.7, y: 0 }}
                    whileInView={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
                    viewport={{ once: true }}
                    transition={{
                      opacity: { delay: 0.4 + i * 0.15, duration: 0.5 },
                      scale: { delay: 0.4 + i * 0.15, duration: 0.5 },
                      y: { delay: 1 + i * 0.3, duration: 4, repeat: Infinity, ease: "easeInOut" },
                    }}
                    className={`absolute ${positions[i]} card-surface px-3 py-1.5 text-xs font-medium text-[color:var(--platinum)] hidden md:block`}
                  >
                    {b}
                  </motion.div>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div>
              <h3 className="text-2xl font-bold text-[color:var(--ice)]">
                Engineer, builder, learner.
              </h3>
              {/* Sourced from settings.aboutParagraphs (Profile Settings admin
                  page), which stores plain text — so the inline bold
                  highlight this paragraph used to have on the school name is
                  intentionally dropped here in exchange for it being
                  editable without touching code. */}
              {settings.aboutParagraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className={`${i === 0 ? "mt-5" : "mt-4"} leading-relaxed text-[color:var(--platinum)]/85`}
                >
                  {paragraph}
                </p>
              ))}

              <div className="mt-8 flex flex-wrap gap-2 md:hidden">
                {badges.map((b) => (
                  <span
                    key={b}
                    className="card-surface px-3 py-1.5 text-xs text-[color:var(--platinum)]"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.t} delay={i * 0.08}>
              <TiltCard maxTilt={5} className="h-full">
                <motion.div
                  whileHover={{
                    y: -5,
                    boxShadow: "0 24px 50px -24px rgba(68,127,152,0.55)",
                  }}
                  transition={SPRING_LIFT}
                  className="card-surface p-6 h-full transition-colors hover:border-[color:var(--turquoise)]/40"
                >
                  <motion.div
                    whileHover={{ scale: 1.12, rotate: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="grid h-10 w-10 place-items-center rounded-lg bg-[color:var(--turquoise)]/15 text-[color:var(--turquoise)]"
                  >
                    {v.i}
                  </motion.div>
                  <h4 className="mt-4 font-semibold text-[color:var(--ice)]">{v.t}</h4>
                  <p className="mt-1 text-sm text-[color:var(--slate-blue)]">{v.d}</p>
                </motion.div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-16 max-w-2xl">
            <p className="text-center font-mono text-xs uppercase tracking-[0.25em] text-[color:var(--slate-blue)]">
              Core Skills
            </p>
            <SkillBars />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- Why Work With Me ---------- */

function WhyMe() {
  const items = [
    {
      i: <Cpu size={22} />,
      t: "Full-Stack Across Web & Mobile",
      // Evidence: IoT Water Monitor capstone (see Portfolio Showcase → Projects tab).
      d: "On the IoT Water Monitor capstone, I built the React + TypeScript dashboard, contributed to the Node.js/MQTT backend, and shipped the companion Flutter app. Comfortable moving between frontend, backend, and mobile on the same project.",
    },
    {
      i: <Users size={22} />,
      t: "Technical Committee Lead",
      // Evidence: Computer Engineering Student Society (see Experience section).
      d: "I lead the 5-member Technical Committee of the Computer Engineering Student Society: organizing workshops, managing the org's infrastructure, and making sure the team's deliverables actually ship.",
    },
    {
      i: <Rocket size={22} />,
      t: "Software That Understands Hardware",
      // Evidence: IoT capstone (ESP32 + sensors) and 12V PCB project (Proteus/EasyEDA/fabrication).
      d: "Most of my work is software, but I also understand the hardware it runs on: ESP32 sensor integration on the IoT capstone, and hands-on PCB design and fabrication on a course project. That context makes my code more realistic about what the hardware can actually do.",
    },
    {
      i: <Award size={22} />,
      t: "Learns Outside the Classroom",
      // Evidence: Certifications section — Agile/PRINCE2, VMware NSX, Python AI automation.
      d: "Outside the curriculum, I took seminars on Agile/PRINCE2 project management, VMware network virtualization, and Python-driven AI automation, on my own initiative.",
    },
  ];
  return (
    <section className="relative px-6 py-32 bg-gradient-to-b from-transparent via-[color:var(--surface)]/30 to-transparent">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          eyebrow="Why Me"
          title="What I"
          accent="Bring"
          sub="What I've worked on so far, and how I work."
        />
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {items.map((it, i) => (
            <Reveal key={it.t} delay={i * 0.08}>
              <TiltCard maxTilt={6} className="h-full">
                <motion.div
                  whileHover={{ y: -6, scale: 1.012 }}
                  transition={SPRING_LIFT}
                  className="group relative card-surface p-8 h-full overflow-hidden transition-colors hover:border-[color:var(--turquoise)]/40 hover:shadow-[0_20px_60px_-20px_rgba(68,127,152,0.5)]"
                >
                  {/* Animated gradient sweep across the top and bottom edges on hover, opposite directions */}
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden">
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[color:var(--turquoise)] to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                  </span>
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden">
                    <span className="absolute inset-0 translate-x-full bg-gradient-to-r from-transparent via-[color:var(--turquoise)] to-transparent transition-transform duration-500 group-hover:-translate-x-full" />
                  </span>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: -8 }}
                    transition={{ type: "spring", stiffness: 280, damping: 14 }}
                    className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[color:var(--turquoise)]/30 to-[color:var(--slate-blue)]/15 text-[color:var(--ice)]"
                  >
                    {it.i}
                  </motion.div>
                  <h3 className="mt-5 text-xl font-semibold text-[color:var(--ice)]">{it.t}</h3>
                  <p className="mt-2 text-[color:var(--platinum)]/80 leading-relaxed">{it.d}</p>
                </motion.div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Tech Marquee ---------- */

/**
 * Infinite-scroll strip of every STACK item, two rows moving in opposite
 * directions. Pauses on hover and freezes entirely under
 * prefers-reduced-motion (each row just renders once, unduplicated).
 */
function TechMarquee() {
  const reduced = usePrefersReducedMotion();
  const { techStack } = useTechStack();
  const rowA = techStack;
  const rowB = [...techStack].reverse();

  const pill = (item: TechStackItem, key: string) => {
    const Icon = getTechIcon(item.iconKey).icon;
    return (
      <span key={key} className="card-surface mx-2 flex shrink-0 items-center gap-2.5 px-4 py-2.5">
        <span className="text-lg leading-none" style={{ color: item.color }}>
          <Icon />
        </span>
        <span className="whitespace-nowrap text-sm font-medium text-[color:var(--platinum)]">
          {item.name}
        </span>
      </span>
    );
  };

  return (
    <section
      aria-label="Technology stack ticker"
      className={`relative py-14 ${reduced ? "overflow-x-auto" : "overflow-x-hidden"}`}
      style={
        reduced
          ? undefined
          : {
              maskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            }
      }
    >
      <div className="marquee-pause space-y-4">
        <div className={`flex w-max ${reduced ? "" : "animate-marquee-left"}`}>
          {(reduced ? rowA : [...rowA, ...rowA]).map((it, i) => pill(it, `a-${i}`))}
        </div>
        <div className={`flex w-max ${reduced ? "" : "animate-marquee-right"}`}>
          {(reduced ? rowB : [...rowB, ...rowB]).map((it, i) => pill(it, `b-${i}`))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Works ---------- */

type ShowcaseTab = "projects" | "certificates" | "stack";

const SHOWCASE_TABS: { id: ShowcaseTab; label: string; icon: React.ReactNode }[] = [
  { id: "projects", label: "Projects", icon: <FolderGit2 size={15} /> },
  { id: "certificates", label: "Certificates", icon: <BadgeCheck size={15} /> },
  { id: "stack", label: "Tech Stack", icon: <Layers size={15} /> },
];

function PortfolioShowcase() {
  const [tab, setTab] = useState<ShowcaseTab>("projects");

  return (
    <section id="works" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          eyebrow="Portfolio Showcase"
          title="Selected"
          accent="Work"
          sub="Explore my journey through projects, certificates, and technical expertise."
        />

        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-wrap justify-center gap-2 rounded-full border border-white/10 bg-[color:var(--surface)]/50 p-1.5 [backdrop-filter:blur(16px)_saturate(160%)] max-w-fit mx-auto">
            {SHOWCASE_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                  tab === t.id
                    ? "text-[color:var(--background)]"
                    : "text-[color:var(--slate-blue)] hover:text-[color:var(--ice)]"
                }`}
              >
                {tab === t.id && (
                  <motion.span
                    layoutId="showcase-tab-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-[color:var(--turquoise)] shadow-[0_0_24px_-6px_rgba(68,127,152,0.8)]"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {t.icon}
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: EASE_SMOOTH }}
            >
              {tab === "projects" && <ProjectsPanel />}
              {tab === "certificates" && <CertificatesPanel />}
              {tab === "stack" && <TechStackPanel />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

const PROJECT_FILTERS: { id: "All" | "Software" | "Hardware"; icon: React.ReactNode }[] = [
  { id: "All", icon: <Layers size={13} /> },
  { id: "Software", icon: <Code2 size={13} /> },
  { id: "Hardware", icon: <Cpu size={13} /> },
];

function ProjectsPanel() {
  const { projects: allProjects } = useProjects();
  const [filter, setFilter] = useState<"All" | "Software" | "Hardware">("All");
  const projects =
    filter === "All" ? allProjects : allProjects.filter((p) => p.category === filter);
  const reduced = usePrefersReducedMotion();
  const [open, setOpen] = useState<Project | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Staggered fade/rise for the modal's info-column content, once the modal
  // is open. No-ops under prefers-reduced-motion (content just appears).
  const reveal = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
        };

  // Shared, slower "smooth" easing for the card → modal image morph. Using a
  // fixed-duration tween (rather than a spring) keeps both ends of the
  // layoutId transition perfectly in sync and easy to reason about the pace of.
  const MORPH_TRANSITION = { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const };

  const openModal = (project: Project, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setActiveImage(0);
    setOpen(project);
  };

  const closeModal = () => {
    setLightboxOpen(false);
    setOpen(null);
    triggerRef.current?.focus();
    triggerRef.current = null;
  };

  const openLightbox = () => setLightboxOpen(true);
  const closeLightbox = () => setLightboxOpen(false);

  const gallery = open
    ? open.gallery && open.gallery.length > 0
      ? open.gallery
      : open.image
        ? [open.image]
        : []
    : [];

  const prevImage = () => setActiveImage((i) => (i - 1 + gallery.length) % gallery.length);
  const nextImage = () => setActiveImage((i) => (i + 1) % gallery.length);

  // Escape key to close and focus trap inside modal.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxOpen) {
          closeLightbox();
          return;
        }
        closeModal();
        return;
      }
      if (lightboxOpen) {
        if (e.key === "ArrowLeft") prevImage();
        if (e.key === "ArrowRight") nextImage();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!focusable.length) return;

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    firstFocusable?.focus();

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, lightboxOpen, activeImage, gallery.length]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div>
      <Reveal>
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {PROJECT_FILTERS.map((f) => (
            <motion.button
              key={f.id}
              whileTap={TAP_SCALE}
              onClick={() => setFilter(f.id)}
              className={`relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition-colors ${
                filter === f.id
                  ? "text-[color:var(--background)]"
                  : "border border-white/10 text-[color:var(--slate-blue)] hover:text-[color:var(--ice)] hover:border-[color:var(--turquoise)]/40"
              }`}
            >
              {filter === f.id && (
                <motion.span
                  layoutId="project-filter-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-[color:var(--turquoise)] shadow-[0_0_24px_-6px_rgba(68,127,152,0.8)]"
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {f.icon}
                {f.id}
              </span>
            </motion.button>
          ))}
        </div>
      </Reveal>

      <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06}>
              <TiltCard maxTilt={p.placeholder ? 0 : 7} className="h-full">
                <motion.button
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  whileHover={{ y: -6 }}
                  whileTap={p.placeholder ? undefined : TAP_SCALE}
                  transition={SPRING_LIFT}
                  onClick={(e) => !p.placeholder && openModal(p, e.currentTarget)}
                  className={`group relative flex h-full w-full flex-col text-left card-surface overflow-hidden transition ${
                    p.placeholder
                      ? "border-dashed border-[color:var(--slate-blue)]/30"
                      : "hover:border-[color:var(--turquoise)]/50 hover:shadow-[0_20px_60px_-20px_rgba(68,127,152,0.5)]"
                  }`}
                >
                  {p.image ? (
                    <div className="p-3 pb-0">
                      <motion.div
                        layoutId={reduced ? undefined : `project-media-${p.slug}`}
                        transition={MORPH_TRANSITION}
                        style={{ opacity: open?.slug === p.slug ? 0 : 1 }}
                        className="relative aspect-[16/9] overflow-hidden rounded-lg bg-[color:var(--surface-2)] ring-1 ring-white/10"
                      >
                        <img
                          src={p.image}
                          alt={p.title}
                          width={640}
                          height={360}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        {/* Hover overlay CTA — slides up from the bottom */}
                        <div className="absolute inset-0 flex translate-y-full items-center justify-center bg-[color:var(--background)]/55 [backdrop-filter:blur(10px)_saturate(160%)] transition-transform duration-300 group-hover:translate-y-0">
                          <span className="flex items-center gap-1.5 text-sm font-medium text-[color:var(--ice)]">
                            View Details <ArrowRight size={14} />
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="p-3 pb-0">
                      <div className="grid aspect-[16/9] place-items-center rounded-lg bg-[color:var(--surface-2)]/40 ring-1 ring-white/10">
                        <Sparkles size={24} className="text-[color:var(--slate-blue)]/50" />
                      </div>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <span className="inline-block w-fit rounded-full bg-[color:var(--turquoise)]/15 px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider text-[color:var(--turquoise)]">
                      {p.category}
                    </span>
                    <h3 className="mt-2 text-sm font-semibold text-[color:var(--ice)]">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-xs text-[color:var(--platinum)]/75 line-clamp-2">
                      {p.short}
                    </p>

                    <div className="mt-3 flex-1" />

                    <span
                      className={`inline-flex w-fit items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-medium transition ${
                        p.placeholder
                          ? "bg-white/5 text-[color:var(--slate-blue)]/75"
                          : "bg-[color:var(--surface-2)] text-[color:var(--ice)] group-hover:bg-[color:var(--turquoise)] group-hover:text-[color:var(--background)]"
                      }`}
                    >
                      Details
                      <ArrowRight size={11} className="transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </motion.button>
              </TiltCard>
            </Reveal>
          ))}
        </AnimatePresence>
      </motion.div>

      {projects.length === 0 && (
        <p className="mt-6 text-center text-sm text-[color:var(--slate-blue)]/70">
          No {filter.toLowerCase()} projects yet — check back soon.
        </p>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            onClick={closeModal}
            className="fixed inset-0 z-50 grid place-items-center bg-black/60 [backdrop-filter:blur(16px)_saturate(140%)] p-4"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 10 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              ref={modalRef}
              onClick={(e) => e.stopPropagation()}
              className="card-surface w-full max-w-4xl max-h-[80vh] overflow-y-auto"
            >
              <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
                {/* Gallery column */}
                <div className="p-4 lg:p-6">
                  <motion.div
                    layoutId={reduced ? undefined : `project-media-${open.slug}`}
                    transition={MORPH_TRANSITION}
                    className="relative aspect-[16/9] overflow-hidden rounded-xl bg-[color:var(--surface-2)] ring-1 ring-white/10 group/img"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {gallery[activeImage] && (
                        <motion.img
                          key={activeImage}
                          src={gallery[activeImage]}
                          alt={open.title}
                          initial={reduced ? undefined : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={reduced ? undefined : { opacity: 0 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </AnimatePresence>
                    {/* Click to fullscreen */}
                    <button
                      onClick={openLightbox}
                      aria-label="View fullscreen"
                      className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors duration-200 group/lb"
                    >
                      <span className="opacity-0 group-hover/lb:opacity-100 transition-opacity duration-200 rounded-full border border-white/15 bg-white/10 [backdrop-filter:blur(12px)_saturate(160%)] px-3 py-1.5 text-xs font-medium text-white flex items-center gap-1.5">
                        <ExternalLink size={12} /> View Fullscreen
                      </span>
                    </button>
                    {/* Prev / Next arrows (only when multiple images) */}
                    {gallery.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          aria-label="Previous image"
                          className="absolute left-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/10 [backdrop-filter:blur(12px)_saturate(160%)] text-white opacity-0 group-hover/img:opacity-100 transition hover:bg-white/20"
                        >
                          <ArrowRight size={14} className="rotate-180" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          aria-label="Next image"
                          className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-white/10 [backdrop-filter:blur(12px)_saturate(160%)] text-white opacity-0 group-hover/img:opacity-100 transition hover:bg-white/20"
                        >
                          <ArrowRight size={14} />
                        </button>
                      </>
                    )}
                  </motion.div>
                  {gallery.length > 1 && (
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {gallery.map((src, idx) => (
                        <button
                          key={src + idx}
                          onClick={() => {
                            setActiveImage(idx);
                            setLightboxOpen(true);
                          }}
                          className={`aspect-[3/2] w-full overflow-hidden rounded-lg ring-1 transition hover:opacity-90 ${
                            idx === activeImage
                              ? "ring-2 ring-[color:var(--turquoise)]"
                              : "ring-white/10 hover:ring-[color:var(--slate-blue)]/50"
                          }`}
                        >
                          <img
                            src={src}
                            alt={`${open.title} screenshot ${idx + 1} of ${gallery.length}`}
                            className="h-full w-full object-cover object-top"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info column */}
                <div className="flex flex-col p-6 pt-0 lg:border-l lg:border-white/10 lg:p-8 overflow-y-auto">
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-block rounded-full bg-[color:var(--turquoise)]/15 px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider text-[color:var(--turquoise)]">
                      {open.category}
                    </span>
                    <button
                      onClick={closeModal}
                      aria-label="Close project"
                      className="p-1 text-[color:var(--slate-blue)] transition hover:text-[color:var(--ice)]"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <motion.h3
                    {...reveal(0.15)}
                    className="mt-3 text-2xl font-bold text-[color:var(--ice)]"
                  >
                    {open.title}
                  </motion.h3>
                  {open.meta && (
                    <motion.p
                      {...reveal(0.25)}
                      className="mt-1 text-sm text-[color:var(--slate-blue)]"
                    >
                      {open.meta}
                    </motion.p>
                  )}
                  <motion.p
                    {...reveal(0.35)}
                    className="mt-4 text-sm leading-relaxed text-[color:var(--platinum)]/85"
                  >
                    {open.long}
                  </motion.p>

                  {open.tags.length > 0 && (
                    <motion.div {...reveal(0.45)} className="mt-6">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-[color:var(--slate-blue)]">
                        Technologies
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-2">
                        {open.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-md border border-[color:var(--turquoise)]/30 bg-[color:var(--turquoise)]/10 px-2.5 py-1 text-xs text-[color:var(--ice)]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <motion.div {...reveal(0.55)} className="mt-auto pt-8">
                    <div className="flex flex-wrap gap-3">
                      {open.link && (
                        <a
                          href={open.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[color:var(--turquoise)] px-5 py-2.5 text-sm font-medium text-[color:var(--background)] transition hover:shadow-[0_0_30px_-5px_rgba(68,127,152,0.8)]"
                        >
                          Visit Live Site <ExternalLink size={14} />
                        </a>
                      )}
                      {open.github && (
                        <a
                          href={open.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[color:var(--slate-blue)]/40 px-5 py-2.5 text-sm text-[color:var(--platinum)] transition hover:border-[color:var(--turquoise)] hover:text-[color:var(--ice)]"
                        >
                          View Source <Github size={14} />
                        </a>
                      )}
                    </div>
                    <button
                      onClick={closeModal}
                      className="mt-3 w-full rounded-full py-2 text-center text-sm text-[color:var(--slate-blue)] transition hover:text-[color:var(--ice)]"
                    >
                      Close Project
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen image lightbox */}
      <AnimatePresence>
        {lightboxOpen && gallery[activeImage] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 [backdrop-filter:blur(20px)_saturate(140%)] p-4"
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
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
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              src={gallery[activeImage]}
              alt={open?.title}
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
                      alt={`${open?.title} screenshot ${idx + 1} of ${gallery.length}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Experience ---------- */

function Experience() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start 0.7", "end 0.3"] });
  const lineScale = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const { experience } = useExperience();
  const timeline = [...experience].sort((a, b) => a.order - b.order);

  return (
    <section
      id="experience"
      className="relative px-6 py-32 bg-gradient-to-b from-transparent via-[color:var(--surface)]/30 to-transparent"
    >
      <div className="mx-auto max-w-5xl">
        <SectionTitle eyebrow="Journey" title="Experience &" accent="Education" />

        <div ref={sectionRef} className="relative mt-20">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-white/10" />
          <motion.div
            style={{
              scaleY: lineScale,
              transformOrigin: "top",
              boxShadow: "0 0 8px 2px var(--turquoise)",
            }}
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-gradient-to-b from-[color:var(--turquoise)] via-[color:var(--glacier)] to-[color:var(--turquoise)]"
          />

          <div className="space-y-12">
            {timeline.map((it, i) => {
              // "Present" / ongoing items get a pulsing ring to draw the eye —
              // the rest get a plain static node.
              const isOngoing = it.tag.toLowerCase().includes("present") || it.placeholder;
              const Icon = getExperienceIcon(it.iconKey).icon;
              return (
                <Reveal key={it.id} delay={0.05}>
                  <div
                    className={`relative grid md:grid-cols-2 gap-6 items-center ${i % 2 === 1 ? "md:[direction:rtl]" : ""}`}
                  >
                    <div
                      className={`pl-12 md:pl-0 ${i % 2 === 1 ? "md:pr-12 [direction:ltr]" : "md:pr-12"}`}
                    >
                      <TiltCard maxTilt={4}>
                        <div
                          className={`card-surface p-6 ${it.placeholder ? "border-dashed border-[color:var(--slate-blue)]/30" : ""}`}
                        >
                          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[color:var(--turquoise)]">
                            {it.tag}
                          </span>
                          <h3 className="mt-2 text-lg font-semibold text-[color:var(--ice)]">
                            {it.title}
                          </h3>
                          <p className="text-sm text-[color:var(--slate-blue)]">{it.sub}</p>
                          <p className="mt-3 text-sm leading-relaxed text-[color:var(--platinum)]/80">
                            {it.body}
                          </p>
                        </div>
                      </TiltCard>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
                      className="absolute left-4 md:left-1/2 top-6 -translate-x-1/2 grid h-8 w-8 place-items-center rounded-full bg-[color:var(--background)] border border-[color:var(--turquoise)] text-[color:var(--turquoise)]"
                    >
                      {isOngoing && (
                        <span className="absolute inset-0 rounded-full border border-[color:var(--turquoise)] animate-ping-slow" />
                      )}
                      <Icon size={18} />
                    </motion.div>
                  </div>
                </Reveal>
              );
            })}

            {timeline.length === 0 && (
              <p className="text-center text-sm text-[color:var(--slate-blue)]">
                No experience entries yet — add some from the admin panel.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Tech Stack ---------- */

function TechStackPanel() {
  const { techStack } = useTechStack();
  const [filter, setFilter] = useState<string>("All");
  const categories = Array.from(new Set(techStack.map((s) => s.category)));
  const filters = ["All", ...categories];
  const visible = filter === "All" ? techStack : techStack.filter((s) => s.category === filter);

  return (
    <div>
      <Reveal>
        <div className="flex flex-wrap justify-center gap-2">
          {filters.map((f) => (
            <motion.button
              key={f}
              whileTap={TAP_SCALE}
              onClick={() => setFilter(f)}
              className={`relative rounded-full px-4 py-1.5 text-sm transition-colors ${
                filter === f
                  ? "text-[color:var(--background)]"
                  : "border border-white/10 text-[color:var(--slate-blue)] hover:text-[color:var(--ice)] hover:border-[color:var(--turquoise)]/40"
              }`}
            >
              {filter === f && (
                <motion.span
                  layoutId="stack-filter-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-[color:var(--turquoise)] shadow-[0_0_24px_-6px_rgba(68,127,152,0.8)]"
                />
              )}
              <span className="relative z-10">{f}</span>
            </motion.button>
          ))}
        </div>
      </Reveal>

      <motion.div
        layout
        className="mt-10 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      >
        <AnimatePresence mode="popLayout">
          {visible.map((v, i) => {
            const Icon = getTechIcon(v.iconKey).icon;
            return (
              <motion.div
                key={v.id}
                layout
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.02, ease: EASE_SMOOTH }}
                whileHover={{
                  y: -5,
                  scale: 1.035,
                  borderColor: `${v.color}99`,
                  boxShadow: `0 18px 40px -20px ${v.color}80`,
                  transition: SPRING_LIFT,
                }}
                className="card-surface p-5 flex flex-col items-center gap-3 text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: [0, -6, 6, 0] }}
                  transition={{ duration: 0.4 }}
                  className="grid h-12 w-12 place-items-center rounded-xl text-2xl"
                  style={{
                    backgroundColor: `${v.color}26`, // ~15% opacity tint of the brand color
                    color: v.color,
                  }}
                >
                  <Icon />
                </motion.div>
                <div>
                  <p className="text-sm font-medium text-[color:var(--ice)]">{v.name}</p>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-[color:var(--slate-blue)]/70">
                    {v.category}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ---------- Certifications ---------- */

function CertificatesPanel() {
  const { certificates } = useCertificates();
  const [lightbox, setLightbox] = useState<{ title: string; image: string } | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  return (
    <div>
      <div className="grid gap-6 md:grid-cols-3">
        {certificates.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.08}>
            <TiltCard maxTilt={6} className="h-full">
              <motion.div
                whileHover={{ y: -5, boxShadow: "0 22px 48px -22px rgba(68,127,152,0.5)" }}
                transition={SPRING_LIFT}
                className="group card-surface h-full overflow-hidden hover:border-[color:var(--turquoise)]/40"
              >
                {c.image ? (
                  <button
                    type="button"
                    onClick={() => setLightbox({ title: c.title, image: c.image! })}
                    className="relative block w-full aspect-[4/3] overflow-hidden bg-[color:var(--surface-2)]"
                    aria-label={`View full certificate: ${c.title}`}
                  >
                    <img
                      src={c.image}
                      alt={c.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    {/* Diagonal shine sweeping across the certificate on hover — a
                        small "glass reflection" cue that reads as premium rather
                        than another generic zoom-and-lift. */}
                    <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                  </button>
                ) : null}
                <div className="p-6">
                  <div className="flex items-center gap-2">
                    <motion.span
                      whileHover={{ rotate: 12, scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 14 }}
                      className="grid h-8 w-8 place-items-center rounded-md bg-[color:var(--turquoise)]/15 text-[color:var(--turquoise)]"
                    >
                      <Award size={16} />
                    </motion.span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--slate-blue)]">
                      Webinar
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold leading-snug text-[color:var(--ice)]">
                    {c.title}
                  </h3>
                  <p className="mt-3 text-xs text-[color:var(--slate-blue)]">{c.platform}</p>
                  <p className="text-xs text-[color:var(--slate-blue)]/70">{c.date}</p>
                </div>
              </motion.div>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 [backdrop-filter:blur(18px)_saturate(140%)] p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-3xl w-full"
            >
              <img
                src={lightbox.image}
                alt={lightbox.title}
                className="w-full rounded-xl border border-white/10"
              />
              <button
                onClick={() => setLightbox(null)}
                aria-label="Close certificate preview"
                className="absolute -top-3 -right-3 grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/10 [backdrop-filter:blur(14px)_saturate(160%)] text-[color:var(--ice)] hover:text-[color:var(--turquoise)] hover:bg-white/20 transition"
              >
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Contact ---------- */

/** Ease-out-quint: fast opening burst, long soft settle into the final digit. */
const easeOutQuint = (p: number) => 1 - Math.pow(1 - p, 5);

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setN(to);
      return;
    }
    const start = Date.now();
    const dur = 1400;
    let raf: number;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setN(Math.round(easeOutQuint(p) * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, reduced]);
  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

// Formspree endpoint — submissions go to your Formspree dashboard / linked email.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mzdlelwz";

/* ---------- Comments (public guestbook) ---------- */

function CommentForm({ addComment }: { addComment: ReturnType<typeof useComments>["addComment"] }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);
    try {
      await addComment({ name: name.trim(), message: message.trim() });
      toast.success("Thanks for your comment!");
      setName("");
      setMessage("");
    } catch {
      // useSupabaseCollection already toasted the specific error.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-surface p-8 space-y-5">
      <div>
        <label
          htmlFor="comment-name"
          className="text-[10px] font-mono uppercase tracking-wider text-[color:var(--slate-blue)]"
        >
          Name
        </label>
        <input
          id="comment-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-[color:var(--background)]/50 px-4 py-3 text-sm text-[color:var(--ice)] outline-none transition focus:border-[color:var(--turquoise)] focus:shadow-[0_0_0_3px_rgba(68,127,152,0.2)]"
        />
      </div>
      <div>
        <label
          htmlFor="comment-message"
          className="text-[10px] font-mono uppercase tracking-wider text-[color:var(--slate-blue)]"
        >
          Message
        </label>
        <textarea
          id="comment-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          required
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-[color:var(--background)]/50 px-4 py-3 text-sm text-[color:var(--ice)] outline-none transition focus:border-[color:var(--turquoise)] focus:shadow-[0_0_0_3px_rgba(68,127,152,0.2)] resize-none"
        />
      </div>
      <MagneticButton strength={0.15} className="block w-full">
        <motion.button
          type="submit"
          disabled={submitting}
          whileTap={submitting ? undefined : TAP_SCALE}
          className="w-full rounded-full bg-[color:var(--turquoise)] px-6 py-3 text-sm font-medium text-[color:var(--background)] flex items-center justify-center gap-2 hover:shadow-[0_0_40px_-5px_rgba(68,127,152,0.9)] transition-shadow disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Posting…" : "Post Comment"} <Send size={14} />
        </motion.button>
      </MagneticButton>
    </form>
  );
}

function CommentCard({ comment }: { comment: Comment }) {
  return (
    <div className="card-surface p-5">
      <div className="flex flex-wrap items-center gap-2">
        {comment.pinned && (
          <span className="flex items-center gap-1 rounded-full bg-[color:var(--turquoise)]/15 px-2 py-0.5 text-[10px] font-medium text-[color:var(--turquoise)]">
            <Pin size={10} /> Pinned
          </span>
        )}
        <p className="text-sm font-medium text-[color:var(--ice)]">{comment.name}</p>
        <span className="text-xs text-[color:var(--slate-blue)]">
          · {formatRelativeTime(comment.createdAt)}
        </span>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-[color:var(--platinum)]/80">
        {comment.message}
      </p>
    </div>
  );
}

function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return (
      <div className="card-surface flex h-full min-h-[200px] flex-col items-center justify-center gap-3 p-8 text-center text-sm text-[color:var(--slate-blue)]">
        <MessageSquare size={24} className="text-[color:var(--slate-blue)]/60" />
        No comments yet — be the first to say hi!
      </div>
    );
  }

  return (
    <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
      {comments.map((c) => (
        <CommentCard key={c.id} comment={c} />
      ))}
    </div>
  );
}

function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const { settings } = useSiteSettings();
  const { comments, addComment } = useComments();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      if (res.ok) {
        setStatus("sent");
        form.reset();
        setTimeout(() => setStatus("idle"), 4000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="relative px-6 py-32">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          eyebrow="Contact"
          title="Let's Build Something"
          accent="Together"
          sub="Have a project, an idea, or just want to connect? I'd love to hear from you."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="card-surface p-8 h-full">
              <h3 className="text-xl font-semibold text-[color:var(--ice)]">Contact Information</h3>
              <p className="mt-2 text-sm text-[color:var(--slate-blue)]">
                Reach me through any of these channels.
              </p>
              <div className="mt-8 space-y-5">
                {[
                  {
                    icon: <Mail size={18} />,
                    label: "Email",
                    value: settings.email,
                    href: `mailto:${settings.email}`,
                  },
                  {
                    icon: <Phone size={18} />,
                    label: "Phone",
                    value: settings.phone,
                    href: `tel:${settings.phone.replace(/\s+/g, "")}`,
                  },
                  {
                    icon: <MapPin size={18} />,
                    label: "Location",
                    value: settings.location,
                  },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-4">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[color:var(--turquoise)]/15 text-[color:var(--turquoise)]">
                      {c.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-mono uppercase tracking-wider text-[color:var(--slate-blue)]">
                        {c.label}
                      </p>
                      {c.href ? (
                        <a
                          href={c.href}
                          className="text-sm text-[color:var(--ice)] hover:text-[color:var(--turquoise)] break-all"
                        >
                          {c.value}
                        </a>
                      ) : (
                        <p className="text-sm text-[color:var(--ice)]">{c.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3 flex-wrap">
                <MagneticButton strength={0.4}>
                  <a
                    href={settings.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-[color:var(--platinum)] hover:bg-[color:var(--turquoise)] hover:text-[color:var(--background)] hover:border-transparent transition"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={18} />
                  </a>
                </MagneticButton>
                {/* GitHub profile link */}
                <MagneticButton strength={0.4}>
                  <a
                    href={settings.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-[color:var(--platinum)] hover:bg-[color:var(--turquoise)] hover:text-[color:var(--background)] hover:border-transparent transition"
                    aria-label="GitHub"
                  >
                    <Github size={18} />
                  </a>
                </MagneticButton>
                {/* Facebook profile link */}
                <MagneticButton strength={0.4}>
                  <a
                    href={settings.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-[color:var(--platinum)] hover:bg-[color:var(--turquoise)] hover:text-[color:var(--background)] hover:border-transparent transition"
                    aria-label="Facebook"
                  >
                    <SiFacebook size={18} />
                  </a>
                </MagneticButton>
                <MagneticButton strength={0.4}>
                  <a
                    href={`mailto:${settings.email}`}
                    className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-[color:var(--platinum)] hover:bg-[color:var(--turquoise)] hover:text-[color:var(--background)] hover:border-transparent transition"
                    aria-label="Email"
                  >
                    <Mail size={18} />
                  </a>
                </MagneticButton>
                {/*
                  RESUME DOWNLOAD (contact card) — sourced from
                  settings.resumeUrl (Profile Settings admin page).
                */}
                <MagneticButton strength={0.3}>
                  <a
                    href={settings.resumeUrl}
                    download
                    className="flex items-center gap-2 rounded-full border border-[color:var(--slate-blue)]/50 px-4 py-2 text-sm font-medium text-[color:var(--platinum)] hover:border-[color:var(--turquoise)] hover:text-[color:var(--ice)] transition"
                  >
                    <Download size={14} /> Download Resume
                  </a>
                </MagneticButton>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <form onSubmit={handleSubmit} className="card-surface p-8 space-y-5">
              {[
                { id: "name", label: "Name", type: "text" },
                { id: "email", label: "Email", type: "email" },
                { id: "subject", label: "Subject", type: "text" },
              ].map((f) => (
                <div key={f.id}>
                  <label
                    htmlFor={f.id}
                    className="text-[10px] font-mono uppercase tracking-wider text-[color:var(--slate-blue)]"
                  >
                    {f.label}
                  </label>
                  <input
                    id={f.id}
                    name={f.id}
                    type={f.type}
                    required
                    className="mt-1.5 w-full rounded-lg border border-white/10 bg-[color:var(--background)]/50 px-4 py-3 text-sm text-[color:var(--ice)] outline-none transition focus:border-[color:var(--turquoise)] focus:shadow-[0_0_0_3px_rgba(68,127,152,0.2)]"
                  />
                </div>
              ))}
              <div>
                <label
                  htmlFor="msg"
                  className="text-[10px] font-mono uppercase tracking-wider text-[color:var(--slate-blue)]"
                >
                  Message
                </label>
                <textarea
                  id="msg"
                  name="message"
                  rows={5}
                  required
                  className="mt-1.5 w-full rounded-lg border border-white/10 bg-[color:var(--background)]/50 px-4 py-3 text-sm text-[color:var(--ice)] outline-none transition focus:border-[color:var(--turquoise)] focus:shadow-[0_0_0_3px_rgba(68,127,152,0.2)] resize-none"
                />
              </div>
              <MagneticButton strength={0.15} className="block w-full">
                <motion.button
                  type="submit"
                  disabled={status === "sending"}
                  whileTap={status === "sending" ? undefined : TAP_SCALE}
                  className="relative w-full overflow-hidden rounded-full bg-[color:var(--turquoise)] px-6 py-3 text-sm font-medium text-[color:var(--background)] flex items-center justify-center gap-2 hover:shadow-[0_0_40px_-5px_rgba(68,127,152,0.9)] transition-shadow disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {status === "sending" && (
                      <motion.span
                        key="sending"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-2"
                      >
                        <motion.span
                          className="h-3.5 w-3.5 rounded-full border-2 border-[color:var(--background)]/30 border-t-[color:var(--background)]"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                        />
                        Sending...
                      </motion.span>
                    )}
                    {status === "sent" && (
                      <motion.span
                        key="sent"
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                        className="flex items-center gap-2"
                      >
                        Message Sent <CircleCheckBig size={15} />
                      </motion.span>
                    )}
                    {status === "idle" && (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center gap-2"
                      >
                        Send Message <Send size={14} />
                      </motion.span>
                    )}
                    {status === "error" && (
                      <motion.span
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        Try Again
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </MagneticButton>
              {status === "error" && (
                <p className="text-sm text-center text-red-400">
                  Something went wrong — please try again, or email me directly at{" "}
                  <a href={`mailto:${settings.email}`} className="underline">
                    {settings.email}
                  </a>
                  .
                </p>
              )}
            </form>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            { n: 3, suffix: "+", l: "Projects Built" },
            // yearsStudying() is calculated from PROGRAM_START_YEAR so it auto-updates each year.
            { n: yearsStudying(), suffix: "", l: "Years Studying" },
            { n: 5, suffix: "", l: "Team Members Led" },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 0.08}>
              <TiltCard maxTilt={5} className="h-full">
                <motion.div
                  whileHover={{
                    y: -4,
                    scale: 1.02,
                    boxShadow: "0 20px 44px -22px rgba(68,127,152,0.5)",
                  }}
                  transition={SPRING_LIFT}
                  className="card-surface p-6 text-center"
                >
                  <div className="text-4xl font-bold gradient-text">
                    <CountUp to={s.n} suffix={s.suffix} />
                  </div>
                  <div className="mt-2 text-xs font-mono uppercase tracking-wider text-[color:var(--slate-blue)]">
                    {s.l}
                  </div>
                </motion.div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        <div className="mt-20">
          <Reveal>
            <h3 className="text-center font-display text-2xl font-semibold text-[color:var(--ice)] sm:text-3xl">
              Leave a Comment
            </h3>
            <p className="mt-2 text-center text-sm text-[color:var(--slate-blue)]">
              Drop a note — I read every one.
            </p>
          </Reveal>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <Reveal delay={0.05}>
              <CommentForm addComment={addComment} />
            </Reveal>
            <Reveal delay={0.1}>
              <CommentList comments={comments} />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */

function Footer() {
  const { settings } = useSiteSettings();
  return (
    <footer className="relative border-t border-white/5 px-6 py-12">
      <div className="mx-auto max-w-6xl flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-mono text-sm">
            <span className="text-[color:var(--slate-blue)]">&lt;</span>
            karl<span className="text-[color:var(--turquoise)]">.</span>dev
            <span className="text-[color:var(--slate-blue)]">/&gt;</span>
          </p>
          <p className="mt-1 text-xs text-[color:var(--slate-blue)]">
            © {new Date().getFullYear()} {settings.fullName}. Built with care.{" "}
            <Link
              to="/dashboard"
              className="text-[color:var(--slate-blue)]/60 underline-offset-2 hover:text-[color:var(--turquoise)] hover:underline transition"
            >
              Admin
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-[color:var(--slate-blue)]">
          {NAV.slice(0, 5).map((n) => (
            <button
              key={n.id}
              onClick={() => scrollTo(n.id)}
              className="hover:text-[color:var(--ice)] transition"
            >
              {n.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`mailto:${settings.email}`}
            aria-label="Email"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[color:var(--platinum)] hover:text-[color:var(--turquoise)] transition"
          >
            <Mail size={16} />
          </a>
          <a
            href={settings.social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[color:var(--platinum)] hover:text-[color:var(--turquoise)] transition"
          >
            <Linkedin size={16} />
          </a>
          {/* GitHub profile link */}
          <a
            href={settings.social.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[color:var(--platinum)] hover:text-[color:var(--turquoise)] transition"
          >
            <Github size={16} />
          </a>
          {/* Facebook profile link */}
          <a
            href={settings.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-[color:var(--platinum)] hover:text-[color:var(--turquoise)] transition"
          >
            <SiFacebook size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);
  const reduced = usePrefersReducedMotion();
  useEffect(() => {
    const f = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 380, damping: 24 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <MagneticButton strength={0.4}>
            <motion.button
              whileTap={TAP_SCALE}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="grid h-11 w-11 place-items-center rounded-full bg-[color:var(--turquoise)] text-[color:var(--background)] shadow-[0_0_30px_-5px_rgba(68,127,152,0.8)] transition-shadow hover:shadow-[0_0_40px_-5px_rgba(68,127,152,1)]"
              aria-label="Back to top"
            >
              <motion.span
                animate={reduced ? undefined : { y: [0, -3, 0] }}
                transition={
                  reduced ? undefined : { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
                }
              >
                <ArrowUp size={18} />
              </motion.span>
            </motion.button>
          </MagneticButton>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Welcome Intro ---------- */

/**
 * Session gate: once this tab has seen the intro, it won't replay on
 * in-session navigation or refresh.
 */
const INTRO_SESSION_KEY = "portfolio-intro-seen";

/** Length of the scripted sequence before it auto-finishes. */
const INTRO_DURATION_MS = 5000;

/** Safety net in case the primary timer is ever missed (e.g. a throttled
 * background tab) — guarantees the visitor is never stuck on the splash. */
const INTRO_FALLBACK_MS = INTRO_DURATION_MS + 2000;

const INTRO_LIVE_STATUS = [
  { icon: <Cpu size={13} />, label: "Embedded" },
  { icon: <Code2 size={13} />, label: "Full-Stack" },
  { icon: <Github size={13} />, label: "Open Source" },
];

/**
 * Full-screen, once-per-session splash that plays before the real page
 * content mounts. Pure SVG/CSS/framer-motion — no video/image assets.
 * Mirrors the site's own visual language: card-surface glass panels, the
 * turquoise/slate-blue/ice palette, mono micro-labels, and the "<karl.dev/>"
 * brand mark from the navbar.
 */
function WelcomeIntro({ onFinish }: { onFinish: () => void }) {
  const reduced = usePrefersReducedMotion();
  const finishedRef = useRef(false);
  const [showSkip, setShowSkip] = useState(false);

  // Whether to actually play the intro is only knowable on the client
  // (it depends on sessionStorage + matchMedia). Both the server render and
  // React's very first client render must produce identical output, so this
  // starts as "pending" — which always renders nothing — on both sides.
  // A layout effect (client-only, runs before paint) then flips it to
  // "playing" or "bypass" a moment later, with no visible flash and no
  // hydration mismatch, since the divergent branch only appears *after*
  // hydration has already reconciled successfully.
  const [phase, setPhase] = useState<"pending" | "playing" | "bypass">("pending");

  const finish = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    onFinish();
  };

  useLayoutEffect(() => {
    let alreadySeen = false;
    try {
      alreadySeen = sessionStorage.getItem(INTRO_SESSION_KEY) === "1";
    } catch {
      /* Storage disabled (e.g. private browsing) — treat as not seen. */
    }

    if (reduced || alreadySeen) {
      setPhase("bypass");
      return;
    }

    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    } catch {
      /* Storage disabled — intro will just replay next time, that's fine. */
    }
    setPhase("playing");
  }, [reduced]);

  useEffect(() => {
    if (phase === "bypass") {
      finish();
      return;
    }
    if (phase !== "playing") return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const skipButtonTimer = setTimeout(() => setShowSkip(true), 1000);
    const naturalFinishTimer = setTimeout(finish, INTRO_DURATION_MS);
    const fallbackTimer = setTimeout(finish, INTRO_FALLBACK_MS);

    return () => {
      document.body.style.overflow = previousOverflow;
      clearTimeout(skipButtonTimer);
      clearTimeout(naturalFinishTimer);
      clearTimeout(fallbackTimer);
    };
  }, [phase]);

  if (phase !== "playing") return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[color:var(--background)] px-6"
    >
      {/* Ambient background — same texture language as the Hero section */}
      <div className="pointer-events-none absolute inset-0 starfield opacity-60" />
      <div className="pointer-events-none absolute inset-0 circuit-trace opacity-50" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-[color:var(--turquoise)]/20 blur-3xl animate-float-blob" />
      <div
        className="pointer-events-none absolute bottom-0 -right-24 h-[420px] w-[420px] rounded-full bg-[color:var(--slate-blue)]/15 blur-3xl animate-float-blob"
        style={{ animationDelay: "-6s" }}
      />

      {/* Status badges */}
      <div className="relative flex flex-wrap items-center justify-center gap-2.5">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: EASE_SMOOTH }}
          className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-green-400"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-availability rounded-full bg-green-400" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
          </span>
          System Ready
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: EASE_SMOOTH }}
          className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-[color:var(--slate-blue)]"
        >
          Portfolio — 2026
        </motion.span>
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: EASE_SMOOTH }}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.25em] text-[color:var(--slate-blue)]"
        >
          <Loader2 size={11} className="animate-spin" />
          UI Loading
        </motion.span>
      </div>

      {/* Headline */}
      <div className="relative mt-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: EASE_SMOOTH }}
          className="text-3xl font-medium text-[color:var(--platinum)] sm:text-4xl"
        >
          Welcome to
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: EASE_SMOOTH }}
          className="gradient-text text-5xl font-bold leading-tight sm:text-6xl"
        >
          Karl's Portfolio
        </motion.p>
      </div>

      {/* Console card: pulsing center badge, orbiting icons, stat tiles */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.85, duration: 0.6, ease: EASE_SMOOTH }}
        className="card-surface relative mt-10 w-full max-w-sm px-6 pt-8 pb-6"
      >
        <div className="relative mx-auto grid h-24 w-24 place-items-center">
          <span className="absolute inset-0 rounded-full border border-[color:var(--turquoise)] animate-ping-slow" />
          <span className="absolute inset-2 rounded-full border border-[color:var(--turquoise)]/20" />
          <div className="absolute inset-0 animate-orbit">
            <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 grid h-6 w-6 place-items-center rounded-full border border-[color:var(--slate-blue)]/40 bg-[color:var(--background)] text-[color:var(--slate-blue)] animate-orbit-counter">
              <Cpu size={12} />
            </span>
            <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 grid h-6 w-6 place-items-center rounded-full border border-[color:var(--slate-blue)]/40 bg-[color:var(--background)] text-[color:var(--slate-blue)] animate-orbit-counter">
              <Code2 size={12} />
            </span>
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 grid h-6 w-6 place-items-center rounded-full border border-[color:var(--slate-blue)]/40 bg-[color:var(--background)] text-[color:var(--slate-blue)] animate-orbit-counter">
              <Github size={12} />
            </span>
          </div>
          <div className="relative grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[color:var(--turquoise)]/30 to-[color:var(--slate-blue)]/15">
            <span className="font-mono text-[11px] text-[color:var(--ice)]">
              <span className="text-[color:var(--slate-blue)]">&lt;</span>
              KD
              <span className="text-[color:var(--slate-blue)]">/&gt;</span>
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.5, ease: EASE_SMOOTH }}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-center"
          >
            <div className="text-sm font-bold gradient-text">07</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--slate-blue)]">
              Modules Loaded
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.25, duration: 0.5, ease: EASE_SMOOTH }}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-center"
          >
            <div className="text-sm font-bold gradient-text">100%</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[color:var(--slate-blue)]">
              Uptime Stable
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Live status chips */}
      <div className="relative mt-8 flex flex-wrap items-center justify-center gap-2">
        {INTRO_LIVE_STATUS.map((chip, i) => (
          <motion.span
            key={chip.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 + i * 0.12, duration: 0.4, ease: EASE_SMOOTH }}
            className="card-surface flex items-center gap-1.5 px-3 py-1.5 text-xs text-[color:var(--platinum)]"
          >
            <span className="text-[color:var(--turquoise)]">{chip.icon}</span>
            {chip.label}
          </motion.span>
        ))}
      </div>

      {/* Light-wipe flash that sweeps through near the end of the sequence */}
      <motion.div
        initial={{ opacity: 0, x: "-100%" }}
        animate={{ opacity: [0, 0.55, 0], x: ["-100%", "0%", "100%"] }}
        transition={{ delay: 3.6, duration: 0.7, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[color:var(--ice)] to-transparent mix-blend-screen"
      />

      {/* Progress bar — fills over the exact scripted duration */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5">
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: INTRO_DURATION_MS / 1000, ease: "linear" }}
          className="h-full bg-gradient-to-r from-[color:var(--turquoise)] via-[color:var(--glacier)] to-[color:var(--turquoise)]"
        />
      </div>

      {/* Skip button — fades in after ~1s */}
      <AnimatePresence>
        {showSkip && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ scale: 1.05, borderColor: "rgba(68,127,152,0.6)" }}
            whileTap={TAP_SCALE}
            onClick={finish}
            className="absolute bottom-6 right-6 flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--slate-blue)] transition-colors hover:text-[color:var(--ice)]"
          >
            Skip Intro <ArrowRight size={12} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---------- Page ---------- */

export default function Portfolio() {
  const [introDone, setIntroDone] = useState(false);
  const { settings } = useSiteSettings();

  /**
   * __root.tsx's `head()` runs outside React render (it powers SSR/first
   * paint and social-preview crawlers), so it can't await this component's
   * Supabase fetch. Its static meta values stay as-is on purpose — that's
   * the fallback every crawler and first paint gets. Here we additionally
   * patch `document.title` and the meta description tag client-side once
   * settings have loaded, so an edited SEO title/description shows up for
   * real visitors. Note this still doesn't help crawlers/link-unfurl bots,
   * which don't run JS — that's a separate fix (move this into the route's
   * server-side loader/head, now that settings live in Supabase and can be
   * fetched there too).
   */
  useEffect(() => {
    document.title = settings.seo.title;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", settings.seo.description);
  }, [settings.seo.title, settings.seo.description]);

  return (
    <div className="relative min-h-screen text-[color:var(--foreground)]">
      <AnimatePresence>
        {!introDone && <WelcomeIntro key="welcome-intro" onFinish={() => setIntroDone(true)} />}
      </AnimatePresence>
      <Toaster theme="dark" position="top-right" />
      <CursorGlow />
      <Navbar />
      <main>
        <Hero />
        <About />
        <TechMarquee />
        <WhyMe />
        <PortfolioShowcase />
        <Experience />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

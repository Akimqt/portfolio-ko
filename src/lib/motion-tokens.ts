import { useEffect, useState } from "react";

/* Whether the current device has a real hover-capable, fine pointer (mouse/
   trackpad) rather than touch. Framer Motion's whileHover listens on pointer
   events, and touch browsers (notably iOS Safari) can fire a synthetic hover
   on tap that never clears until something else is tapped — a card can get
   "stuck" mid-hover-lift. Gate whileHover interactions behind this so touch
   users get whileTap feedback instead of a sticky hover state. */
export function useCanHover(): boolean {
  const [canHover, setCanHover] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  });
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onChange = (e: MediaQueryListEvent) => setCanHover(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return canHover;
}

/* Shared motion tokens — mirrors Portfolio.tsx / Dashboard.tsx's rhythm so
   every screen in the app (public site + admin panel) feels like one system. */

// Primary ease-out curve for anything entering the screen (reveals, modals, images).
export const EASE_SMOOTH = [0.16, 1, 0.3, 1] as const;

// Symmetric curve for things that animate both in and out of a settled state
// (tab switches, toggles, anything that isn't a one-way reveal).
export const EASE_SMOOTH_INOUT = [0.65, 0, 0.35, 1] as const;

// Slightly quicker ease for exits — exits can be a touch faster than entrances
// without feeling rushed, since the user's attention is already leaving.
export const EASE_EXIT = [0.4, 0, 1, 1] as const;

// Spring for hover/tap lifts — softened from the previous 340/24 so lifts settle
// instead of snapping. Use for whileHover/whileTap on cards, buttons, icons.
export const SPRING_LIFT = { type: "spring", stiffness: 260, damping: 26, mass: 0.8 } as const;

// Duration bands — pick by animation "weight," not by guessing.
export const DURATION = {
  micro: 0.25, // icon nudges, tap feedback, small hover shifts
  tab: 0.3, // tab/filter content swaps, admin section switches — tens-of-times-per-session, keep under the 300ms UI ceiling
  base: 0.45, // modals, drawers, dialogs, panels (200–500ms band)
  reveal: 0.75, // scroll-triggered reveals (cards, sections, images)
  hero: 1.1, // large hero/intro choreography
} as const;

// Stagger — use as staggerChildren on a parent variants object wrapping a grid/list.
export const STAGGER = {
  container: (delayChildren = 0.05) => ({
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren },
    },
  }),
  item: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: DURATION.reveal, ease: EASE_SMOOTH } },
  },
} as const;

export const TAP_SCALE = { scale: 0.96 };

export function usePrefersReducedMotion(): boolean {
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

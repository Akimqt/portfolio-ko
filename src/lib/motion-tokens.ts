import { useEffect, useState } from "react";

/* Shared motion tokens — mirrors Portfolio.tsx / Dashboard.tsx's rhythm so
   every screen in the app (public site + admin panel) feels like one system. */
export const EASE_SMOOTH = [0.16, 1, 0.3, 1] as const;
export const SPRING_LIFT = { type: "spring", stiffness: 340, damping: 24, mass: 0.7 } as const;
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

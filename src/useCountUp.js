import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from its previous value to `target` over `duration` ms.
 * Falls back to an instant jump if the user prefers reduced motion.
 */
export function useCountUp(target, duration = 600) {
  const [display, setDisplay] = useState(target ?? 0);
  const frameRef = useRef(null);
  const fromRef = useRef(target ?? 0);

  useEffect(() => {
    if (target == null) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setDisplay(target);
      fromRef.current = target;
      return;
    }

    const from = fromRef.current;
    const delta = target - from;
    const start = performance.now();

    cancelAnimationFrame(frameRef.current);

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + delta * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return display;
}

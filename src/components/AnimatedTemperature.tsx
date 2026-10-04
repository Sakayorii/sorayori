import { useEffect, useRef } from "react";
import { usePageVisibility, useReducedMotion } from "../motion";
import type { TemperatureUnit } from "../types";

export function AnimatedTemperature({ value, unit }: { value: number; unit: TemperatureUnit }) {
  const target = Math.round(unit === "fahrenheit" ? value * 9 / 5 + 32 : value);
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef(target);
  const reduced = useReducedMotion();
  const visible = usePageVisibility();
  useEffect(() => {
    const node = ref.current!;
    const start = current.current;
    if (reduced || !visible || start === target) {
      current.current = target;
      node.textContent = `${target}°`;
      return;
    }
    let frame = 0;
    const started = performance.now();
    const tick = (time: number) => {
      const progress = Math.min(1, (time - started) / 480);
      current.current = start + (target - start) * (1 - Math.pow(1 - progress, 3));
      node.textContent = `${Math.round(current.current)}°`;
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, reduced, visible]);
  return <span className="temperature" aria-label={`${target}°`}><span ref={ref} aria-hidden="true">{Math.round(current.current)}°</span></span>;
}

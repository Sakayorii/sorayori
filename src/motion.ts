import { useEffect, useState } from "react";

export function createSpring(onUpdate: (position: number, velocity: number) => void) {
  let position = 0;
  let velocity = 0;
  let target = 0;
  let frame = 0;
  let last = 0;
  const tick = (time: number) => {
    const dt = Math.min((time - last) / 1000, .032);
    last = time;
    const steps = Math.max(1, Math.ceil(dt / .008));
    for (let i = 0; i < steps; i++) {
      const h = dt / steps;
      velocity += (-380 * (position - target) - 2 * .85 * Math.sqrt(380) * velocity) * h;
      position += velocity * h;
    }
    if (Math.abs(position - target) < .15 && Math.abs(velocity) < 2) {
      position = target; velocity = 0; frame = 0;
      onUpdate(position, velocity);
      return;
    }
    onUpdate(position, velocity);
    frame = requestAnimationFrame(tick);
  };
  return {
    set(value: number) { cancelAnimationFrame(frame); frame = 0; position = value; velocity = 0; onUpdate(position, velocity); },
    to(value: number, initialVelocity?: number) {
      target = value;
      if (initialVelocity !== undefined) velocity = initialVelocity;
      if (!frame) { last = performance.now(); frame = requestAnimationFrame(tick); }
    },
    stop() { cancelAnimationFrame(frame); frame = 0; },
  };
}

export function spatialFrames(from: number, to: number, velocity = 0) {
  const stiffness = 380;
  const dampingRatio = 0.8;
  const natural = Math.sqrt(stiffness);
  const decay = dampingRatio * natural;
  const frequency = natural * Math.sqrt(1 - dampingRatio * dampingRatio);
  return Array.from({ length: 37 }, (_, index) => {
    const time = index / 60;
    const distance = from - to;
    const position = to + Math.exp(-decay * time) * (distance * Math.cos(frequency * time) + (velocity + decay * distance) / frequency * Math.sin(frequency * time));
    return { transform: `translateY(${index === 36 ? to : position}px)`, offset: index / 36 };
  });
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function usePageVisibility() {
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return visible;
}

export function usePresence<T>(value: T | null, duration: number) {
  const [present, setPresent] = useState(value);
  useEffect(() => {
    if (value !== null) {
      setPresent(value);
      return;
    }
    const timer = window.setTimeout(() => setPresent(null), duration);
    return () => window.clearTimeout(timer);
  }, [value, duration]);
  return value ?? present;
}

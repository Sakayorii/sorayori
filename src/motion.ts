import { useEffect, useState } from "react";

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

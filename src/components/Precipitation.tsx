import { useEffect, useRef } from "react";
import { usePageVisibility, useReducedMotion } from "../motion";

export function Precipitation({ snow, active }: { snow: boolean; active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const visible = usePageVisibility();
  const reduced = useReducedMotion();
  useEffect(() => {
    const canvas = ref.current!;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;
    let width = 0;
    let height = 0;
    let frame = 0;
    let last = 0;
    let elapsed = 0;
    const particles = Array.from({ length: snow ? 38 : 66 }, (_, i) => {
      const depth = .45 + (i % 3) * .275;
      return { x: ((i * 47 + 13) % 101) / 101, y: ((i * 31 + 9) % 103) / 103, depth, phase: i * 2.39 };
    });
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const draw = (timestamp: number) => {
      const delta = last ? Math.min((timestamp - last) / 1000, .05) : 0;
      last = timestamp;
      elapsed += delta;
      context.clearRect(0, 0, width, height);
      for (const particle of particles) {
        const speed = (snow ? 36 : 460) * Math.pow(particle.depth, 1.5);
        particle.y += speed * delta / Math.max(height, 1);
        particle.x += (snow ? Math.sin(elapsed * .6 + particle.phase) * 8 : 42) * particle.depth * delta / Math.max(width, 1);
        if (particle.y > 1.08) { particle.y = -.08; particle.x = (particle.x + .381966) % 1; }
        if (particle.x > 1.05) particle.x = -.05;
        if (particle.x < -.05) particle.x = 1.05;
        const x = particle.x * width;
        const y = particle.y * height;
        context.globalAlpha = .18 + particle.depth * .35;
        context.strokeStyle = context.fillStyle = "#f8fbfc";
        if (snow) {
          context.beginPath();
          context.arc(x, y, 1.2 + particle.depth * 2, 0, Math.PI * 2);
          context.fill();
        } else {
          context.lineWidth = .7 + particle.depth;
          context.lineCap = "round";
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(x + 2.5 * particle.depth, y + 20 * particle.depth);
          context.stroke();
        }
      }
      if (active && visible && !reduced) frame = requestAnimationFrame(draw);
    };
    resize();
    draw(0);
    const observer = new ResizeObserver(() => { resize(); if (!active || !visible || reduced) draw(0); });
    observer.observe(canvas);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [snow, active, visible, reduced]);
  return <canvas ref={ref} className="precipitation-canvas" aria-hidden="true" />;
}

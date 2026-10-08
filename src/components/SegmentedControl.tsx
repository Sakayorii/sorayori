import { useLayoutEffect, useRef } from "react";

export function SegmentedControl<T extends string>({ value, label, options, onChange }: {
  value: T; label: string; options: { value: T; label: string }[]; onChange: (value: T) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ready = useRef(false);
  useLayoutEffect(() => {
    const root = ref.current!;
    const measure = () => {
      const selected = root.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
      if (!selected) return;
      root.style.setProperty("--thumb-x", `${selected.offsetLeft}px`);
      root.style.setProperty("--thumb-width", `${selected.offsetWidth}px`);
    };
    measure();
    const frame = requestAnimationFrame(() => { root.dataset.ready = "true"; ready.current = true; });
    const observer = new ResizeObserver(() => {
      root.dataset.ready = "false";
      measure();
      requestAnimationFrame(() => { if (root.isConnected && ready.current) root.dataset.ready = "true"; });
    });
    observer.observe(root);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); };
  }, [value, options.length]);
  return <div ref={ref} className="segmented measured-segmented" role="group" aria-label={label}>
    <span className="segment-thumb" aria-hidden="true" />
    {options.map((option, index) => <button key={option.value} type="button" aria-pressed={option.value === value}
      onClick={() => onChange(option.value)} onKeyDown={(event) => {
        const offset = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
        if (!offset) return;
        event.preventDefault();
        const next = Math.max(0, Math.min(options.length - 1, index + offset));
        onChange(options[next].value);
        ref.current?.querySelectorAll("button")[next]?.focus();
      }}>{option.label}</button>)}
  </div>;
}

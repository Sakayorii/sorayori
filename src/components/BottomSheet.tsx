import { useEffect, useId, useRef, type PointerEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { spatialFrames, useReducedMotion } from "../motion";

interface BottomSheetProps {
  title: string;
  closeLabel: string;
  closing: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function BottomSheet({ title, closeLabel, closing, onClose, children }: BottomSheetProps) {
  const ref = useRef<HTMLElement>(null);
  const titleId = useId();
  const reduced = useReducedMotion();
  const animation = useRef<Animation | null>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const drag = useRef<{ id: number; start: number; distance: number; time: number } | null>(null);

  useEffect(() => {
    const sheet = ref.current!;
    if (!reduced) {
      animation.current = sheet.animate(spatialFrames(sheet.getBoundingClientRect().height + 24, 0), { duration: 600, easing: "linear" });
    }
    return () => animation.current?.cancel();
  }, [reduced]);

  useEffect(() => {
    if (!closing) return;
    animation.current?.cancel();
    const sheet = ref.current!;
    const offset = Number.parseFloat(sheet.style.getPropertyValue("--drag-y")) || 0;
    animation.current = sheet.animate(
      [{ transform: `translateY(${offset}px)` }, { transform: `translateY(${sheet.getBoundingClientRect().height + 24}px)` }],
      { duration: reduced ? 0 : 240, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" },
    );
    (document.activeElement as HTMLElement | null)?.blur();
    return () => animation.current?.cancel();
  }, [closing, reduced]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const sheet = ref.current!;
    const focusable = () => Array.from(sheet.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), [tabindex="0"]'));
    (sheet.querySelector<HTMLInputElement>("input") ?? focusable()[0] ?? sheet).focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close.current(); }
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0] ?? sheet;
      const last = items[items.length - 1] ?? sheet;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKey);
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);

  function start(event: PointerEvent<HTMLDivElement>) {
    if (closing || !event.isPrimary || event.button !== 0) return;
    animation.current?.cancel();
    drag.current = { id: event.pointerId, start: event.clientY, distance: 0, time: performance.now() };
    event.currentTarget.setPointerCapture(event.pointerId);
    ref.current?.setAttribute("data-dragging", "true");
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id !== event.pointerId) return;
    drag.current.distance = Math.max(0, event.clientY - drag.current.start);
    ref.current?.style.setProperty("--drag-y", `${drag.current.distance}px`);
  }

  function end(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    drag.current = null;
    ref.current?.removeAttribute("data-dragging");
    const velocity = gesture.distance / Math.max(1, performance.now() - gesture.time);
    if (!cancelled && (gesture.distance > 100 || (gesture.distance > 28 && velocity > 0.65))) {
      close.current();
    } else {
      ref.current?.style.setProperty("--drag-y", "0px");
      if (!reduced) animation.current = ref.current!.animate(spatialFrames(gesture.distance, 0), { duration: 600, easing: "linear" });
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div className={`sheet-backdrop${closing ? " is-closing" : ""}`} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={ref} className="bottom-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <div className="sheet-grip" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={(event) => end(event, true)}>
          <div className="sheet-handle" />
        </div>
        <div className="sheet-title">
          <h2 id={titleId}>{title}</h2>
          <button className="icon-button dark" onClick={onClose} aria-label={closeLabel}><X size={20} /></button>
        </div>
        {children}
      </section>
    </div>
  );
}

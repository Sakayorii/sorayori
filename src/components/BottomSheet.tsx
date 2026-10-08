import { useEffect, useId, useRef, type PointerEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { createSpring, spatialFrames, useReducedMotion } from "../motion";

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
  const backdrop = useRef<HTMLDivElement>(null);
  const spring = useRef<ReturnType<typeof createSpring> | null>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const drag = useRef<{ id: number; start: number; distance: number; time: number; lastY: number; velocity: number } | null>(null);

  useEffect(() => {
    spring.current = createSpring((distance) => {
      const sheet = ref.current;
      if (!sheet) return;
      sheet.style.setProperty("--drag-y", `${Math.max(0, distance)}px`);
      const progress = Math.min(1, Math.max(0, distance) / Math.max(sheet.offsetHeight, 1));
      sheet.style.setProperty("--sheet-scale", `${1 - progress * .045}`);
      backdrop.current?.style.setProperty("--scrim-opacity", `${1 - progress * .8}`);
    });
    return () => spring.current?.stop();
  }, []);

  useEffect(() => {
    const sheet = ref.current!;
    if (!reduced) {
      animation.current = sheet.animate(spatialFrames(sheet.getBoundingClientRect().height + 24, 0), { duration: 600, easing: "linear" });
    }
    return () => animation.current?.cancel();
  }, [reduced]);

  useEffect(() => {
    if (!closing) return;
    spring.current?.stop();
    const currentY = new DOMMatrixReadOnly(getComputedStyle(ref.current!).transform).m42;
    animation.current?.cancel();
    const sheet = ref.current!;
    const offset = currentY;
    animation.current = sheet.animate(
      [{ transform: `translateY(${offset}px)` }, { transform: `translateY(${sheet.getBoundingClientRect().height + 24}px)` }],
      { duration: reduced ? 0 : 240, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" },
    );
    (document.activeElement as HTMLElement | null)?.blur();
    return () => animation.current?.cancel();
  }, [closing, reduced]);

  useEffect(() => {
    const viewport = window.visualViewport;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const overlay = backdrop.current;
        if (!overlay) return;
        overlay.style.top = `${viewport?.offsetTop ?? 0}px`;
        overlay.style.height = `${viewport?.height ?? window.innerHeight}px`;
        const input = ref.current?.querySelector<HTMLInputElement>("input:focus");
        if (input) {
          const rect = input.getBoundingClientRect();
          const bottom = (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight);
          if (rect.bottom > bottom - 16 || rect.top < (viewport?.offsetTop ?? 0)) input.scrollIntoView({ block: "nearest", behavior: "auto" });
        }
      });
    };
    update();
    viewport?.addEventListener("resize", update);
    viewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      viewport?.removeEventListener("resize", update);
      viewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const sheet = ref.current!;
    const focusable = () => Array.from(sheet.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), [tabindex="0"]')).filter((node) => !node.closest('[inert], [aria-hidden="true"], [hidden]') && node.getClientRects().length > 0);
    sheet.focus({ preventScroll: true });
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
    const offset = new DOMMatrixReadOnly(getComputedStyle(ref.current!).transform).m42;
    spring.current?.stop();
    animation.current?.cancel();
    ref.current?.style.setProperty("--drag-y", `${offset}px`);
    drag.current = { id: event.pointerId, start: event.clientY - offset, distance: offset, time: performance.now(), lastY: event.clientY, velocity: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
    ref.current?.setAttribute("data-dragging", "true");
  }

  function move(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.id !== event.pointerId) return;
    const gesture = drag.current;
    const now = performance.now();
    const sample = (event.clientY - gesture.lastY) / Math.max(1, now - gesture.time);
    gesture.velocity = .65 * sample + .35 * gesture.velocity;
    gesture.lastY = event.clientY;
    gesture.time = now;
    gesture.distance = Math.max(0, event.clientY - gesture.start);
    spring.current?.set(gesture.distance);
  }

  function end(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    const gesture = drag.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    drag.current = null;
    ref.current?.removeAttribute("data-dragging");
    const velocity = performance.now() - gesture.time > 100 ? 0 : gesture.velocity;
    if (!cancelled && (gesture.distance > 100 || (gesture.distance > 28 && velocity > 0.65))) {
      close.current();
    } else {
      if (reduced) spring.current?.set(0);
      else spring.current?.to(0, cancelled ? 0 : Math.max(-1800, Math.min(1800, velocity * 1000)));
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div ref={backdrop} className={`sheet-backdrop${closing ? " is-closing" : ""}`} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={ref} className="bottom-sheet" role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
        <div className="sheet-grip" onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={(event) => end(event, true)}>
          <div className="sheet-handle" />
        </div>
        <div className="sheet-title">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-button dark" onClick={onClose} aria-label={closeLabel}><X size={20} /></button>
        </div>
        <div className="sheet-body">{children}</div>
      </section>
    </div>
  );
}

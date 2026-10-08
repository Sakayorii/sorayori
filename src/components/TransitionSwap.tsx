import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "../motion";

type RetainedContent = { identity: string; children: ReactNode };

export function TransitionSwap({ identity, children, className = "" }: { identity: string; children: ReactNode; className?: string }) {
  const current = useRef<HTMLDivElement>(null);
  const previous = useRef<RetainedContent>({ identity, children });
  const outgoingRef = useRef<HTMLDivElement>(null);
  const [outgoing, setOutgoing] = useState<RetainedContent | null>(null);
  const generation = useRef(0);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    if (previous.current.identity !== identity) {
      generation.current += 1;
      setOutgoing(reduced ? null : previous.current);
    }
    previous.current = { identity, children };
  }, [identity, children, reduced]);

  useLayoutEffect(() => {
    if (!outgoing) return;
    const incoming = current.current!;
    const departing = outgoingRef.current!;
    const owner = generation.current;
    departing.inert = true;
    departing.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    const exit = departing.animate([
      { opacity: 1, transform: "translateY(0)" },
      { opacity: 0, transform: "translateY(-6px)" },
    ], { duration: 140, easing: "cubic-bezier(.4,0,1,1)", fill: "forwards" });
    const enter = incoming.animate([
      { opacity: 0, transform: "translateY(8px)", clipPath: "inset(8% 0 0 0)" },
      { opacity: 1, transform: "translateY(0)", clipPath: "inset(0 0 0 0)" },
    ], { duration: 260, easing: "cubic-bezier(.22,1,.36,1)" });
    exit.onfinish = () => { if (generation.current === owner) setOutgoing(null); };
    return () => { exit.cancel(); enter.cancel(); };
  }, [outgoing]);

  useLayoutEffect(() => { if (reduced) setOutgoing(null); }, [reduced]);

  return <div className="transition-swap">
    {outgoing && <div ref={outgoingRef} className={`transition-outgoing ${className}`} aria-hidden="true">{outgoing.children}</div>}
    <div ref={current} className={className}>{children}</div>
  </div>;
}

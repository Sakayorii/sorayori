import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "../motion";

export function Disclosure({ open, id, children }: { open: boolean; id: string; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  const initialized = useRef(false);
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    const node = root.current!;
    const inner = content.current!;
    const from = node.getBoundingClientRect().height;
    animation.current?.cancel();
    node.hidden = false;
    inner.inert = !open;
    const to = open ? inner.getBoundingClientRect().height : 0;
    node.style.height = open ? "auto" : "0px";
    if (reduced || !initialized.current) {
      node.hidden = !open;
    } else {
      const current = node.animate([{ height: `${from}px`, opacity: from ? 1 : 0 }, { height: `${to}px`, opacity: open ? 1 : 0 }], {
        duration: 300, easing: "cubic-bezier(0.2, 0.75, 0.25, 1)",
      });
      animation.current = current;
      current.onfinish = () => { if (animation.current === current) node.hidden = !open; };
    }
    initialized.current = true;
  }, [open, reduced]);
  useLayoutEffect(() => () => animation.current?.cancel(), []);

  return <div ref={root} id={id} className="disclosure" aria-hidden={!open}><div ref={content}>{children}</div></div>;
}

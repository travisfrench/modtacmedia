"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { GiCrosshair } from "react-icons/gi";

export function CursorIconLayer() {
  const [mounted, setMounted] = React.useState(false);
  const [active, setActive] = React.useState(false);

  const activeRef = React.useRef(false);
  const pos = React.useRef({ x: 0, y: 0 });
  const raf = React.useRef<number | null>(null);
  const iconEl = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!mounted) return;

    const canHover =
      window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches ?? true;

    const moveIcon = () => {
      raf.current = null;
      const el = iconEl.current;
      if (!el) return;

      // Safari-safe: ensure 3rd param has unit, and keep the percent translate first
      el.style.transform = `translate(-50%, -50%) translate3d(${pos.current.x}px, ${pos.current.y}px, 0px)`;
    };

    const onMove = (e: MouseEvent) => {
      if (!canHover) return;

      pos.current.x = e.clientX;
      pos.current.y = e.clientY;

      const t = e.target as Element | null;
      const hit = t?.closest?.('[data-cursor="crosshair"]');
      const next = Boolean(hit);

      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);
      }

      if (activeRef.current && raf.current == null) {
        raf.current = window.requestAnimationFrame(moveIcon);
      }
    };

    const onLeave = () => {
      activeRef.current = false;
      setActive(false);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("blur", onLeave);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("mouseleave", onLeave);
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed inset-0 z-[99999] hidden md:block"
      aria-hidden="true"
    >
      {/* keep mounted so Safari never misses the ref */}
      <div
        ref={iconEl}
        className={[
          "absolute left-0 top-0 will-change-transform text-white mix-blend-difference transition-opacity duration-75",
          active ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        <GiCrosshair size={40} />
      </div>
    </div>,
    document.body
  );
}

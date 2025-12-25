"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { GiCrosshair } from "react-icons/gi";

export function CursorIconLayer() {
    const [mounted, setMounted] = React.useState(false);
    const [active, setActive] = React.useState(false);

    const pos = React.useRef({ x: 0, y: 0 });
    const raf = React.useRef<number | null>(null);
    const iconEl = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        if (!mounted) return;

        const moveIcon = () => {
            raf.current = null;
            const el = iconEl.current;
            if (!el) return;
            // translate3d keeps it smooth
            el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%)`;
        };

        const onPointerMove = (e: PointerEvent) => {
            // Only show for a real mouse cursor (avoid mobile / touch)
            if (e.pointerType !== "mouse") {
                if (active) setActive(false);
                return;
            }

            pos.current.x = e.clientX;
            pos.current.y = e.clientY;

            // CSS “switch”: any element (or ancestor) with data-cursor="crosshair"
            const t = e.target as Element | null;
            const hit = t?.closest?.('[data-cursor="crosshair"]');
            const nextActive = Boolean(hit);
            if (nextActive !== active) setActive(nextActive);

            if (raf.current == null) raf.current = requestAnimationFrame(moveIcon);
        };

        const onPointerLeaveWindow = () => setActive(false);

        window.addEventListener("pointermove", onPointerMove, { passive: true });
        window.addEventListener("blur", onPointerLeaveWindow);
        document.addEventListener("mouseleave", onPointerLeaveWindow);

        return () => {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("blur", onPointerLeaveWindow);
            document.removeEventListener("mouseleave", onPointerLeaveWindow);
            if (raf.current != null) cancelAnimationFrame(raf.current);
        };
    }, [mounted, active]);

    if (!mounted) return null;

    return createPortal(
        <div
            // Hide completely on devices that don’t really “hover”
            className="pointer-events-none fixed inset-0 z-[99999] hidden md:block"
            aria-hidden="true"
        >
            {active && (
                <div
                    ref={iconEl}
                    className="absolute left-0 top-0 text-white mix-blend-difference"
                >
                    <GiCrosshair size={40} />
                </div>
            )}
        </div>,
        document.body
    );
}

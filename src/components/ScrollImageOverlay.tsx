"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { createPortal } from "react-dom";

type Shot = { src: string; alt: string };

export type ScrollTelemetry = {
    runwayVh: number;
    scrolledVh: number;
    loops: number;
    phasePx: number;
    phasePct: number;
};


type Placed = Shot & {
    id: string;
    x: number; // px within viewport space
    y: number; // px within loop canvas space (0..travelY)
    w: number; // px
    h: number; // px
    lane: 0 | 1 | 2 | 3;
};

function BodyPortal({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return createPortal(children, document.body);
}

function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n));
}

function mulberry32(seed: number) {
    return function () {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function useViewport() {
    const [vp, setVp] = React.useState({ w: 1200, h: 800 });
    React.useEffect(() => {
        const on = () => setVp({ w: window.innerWidth, h: window.innerHeight });
        on();
        window.addEventListener("resize", on);
        return () => window.removeEventListener("resize", on);
    }, []);
    return vp;
}

export function ScrollImageOverlay({
    items,
    heightVh = 600, // initial scroll length
    seed = 1337,
    extendByVh = 400, // how much to add each time the user nears the end
    onTelemetry,
}: {
    items: Shot[];
    heightVh?: number;
    seed?: number;
    extendByVh?: number;
    onTelemetry?: (t: ScrollTelemetry) => void;
}) {
    const sectionRef = React.useRef<HTMLDivElement | null>(null);
    const { w: vw, h: vh } = useViewport();

    const [open, setOpen] = React.useState<Shot | null>(null);
    const [placed, setPlaced] = React.useState<Placed[]>([]);
    const loopY = useMotionValue(0);

    // This is the "infinite driver": we keep increasing total height.
    const [extraVh, setExtraVh] = React.useState(0);
    const totalVh = heightVh + extraVh;

    const baseCanvasH = Math.max(vh * (heightVh / 100), vh * 4);
    const travelY = Math.max(1, baseCanvasH - vh);


    // ----- Build layout (placed within 0..travelY so it repeats cleanly) -----
    React.useEffect(() => {
        if (!vw || !vh || items.length === 0) return;

        const rand = mulberry32(seed);

        // Lanes that match your red-box vision and avoid center & top-right contact
        const lanes = [
            // left-mid
            { xMin: 0.06, xMax: 0.22, yMin: 0.12, yMax: 0.58, wMin: 0.12, wMax: 0.17, aspectMin: 0.95, aspectMax: 1.3 },
            // top-right wide (kept down/left from contact)
            { xMin: 0.50, xMax: 0.80, yMin: 0.11, yMax: 0.30, wMin: 0.18, wMax: 0.26, aspectMin: 1.6, aspectMax: 2.3 },
            // bottom-left
            { xMin: 0.18, xMax: 0.36, yMin: 0.70, yMax: 0.92, wMin: 0.11, wMax: 0.16, aspectMin: 1.0, aspectMax: 1.5 },
            // bottom-right
            { xMin: 0.70, xMax: 0.90, yMin: 0.58, yMax: 0.88, wMin: 0.11, wMax: 0.17, aspectMin: 0.95, aspectMax: 1.4 },
        ] as const;

        // Evenly distribute through the loop span
        const spacing = travelY / Math.max(1, items.length);

        const out: Placed[] = items.map((it, i) => {
            const lane = (i % 4) as 0 | 1 | 2 | 3;
            const L = lanes[lane];

            const wNorm = L.wMin + (L.wMax - L.wMin) * rand();
            const wPx = clamp(vw * wNorm, 180, 480);

            const aspect = L.aspectMin + (L.aspectMax - L.aspectMin) * rand();
            const hPx = clamp(wPx / aspect, 130, 360);

            const xNorm = L.xMin + (L.xMax - L.xMin) * rand();
            const yNorm = L.yMin + (L.yMax - L.yMin) * rand();

            const xPx = clamp(vw * xNorm - wPx / 2, 16, vw - wPx - 16);
            const yViewportPx = clamp(vh * yNorm - hPx / 2, 16, vh - hPx - 16);

            // Keep y within the loop span so the pattern repeats seamlessly.
            // This makes the infinite loop visually consistent.
            const yPx = (i * spacing + yViewportPx) % travelY;

            return {
                ...it,
                id: `${i}-${it.src}`,
                lane,
                x: xPx,
                y: yPx,
                w: wPx,
                h: hPx,
            };
        });

        setPlaced(out);
    }, [items, vw, vh, seed, travelY]);

    // Tile two copies (second copy shifted by travelY) so wrap never shows a gap
    const tiled = React.useMemo(() => {
        if (!placed.length) return [];
        return [
            ...placed,
            ...placed.map((p) => ({ ...p, id: p.id + "__b", y: p.y + travelY })),
        ];
    }, [placed, travelY]);

    // ----- Visual motion driver (smooth, no teleports) -----
    React.useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        let sectionTop = 0;
        const measure = () => {
            const rect = el.getBoundingClientRect();
            sectionTop = window.scrollY + rect.top;
        };

        measure();
        window.addEventListener("resize", measure);

        let raf = 0;

        const update = () => {
            raf = 0;

            const viewH = window.innerHeight;
            const sectionHeight = el.offsetHeight;

            const minY = sectionTop;
            const maxY = sectionTop + sectionHeight - viewH;

            const y = window.scrollY;
            if (y < minY || y > maxY) return;

            const raw = y - sectionTop;
            const span = travelY;

            const loops = Math.floor(raw / span);
            const mod = ((raw % span) + span) % span;
            const phasePct = (mod / span) * 100;

            loopY.set(-mod);

            onTelemetry?.({
                runwayVh: totalVh,
                scrolledVh: raw / Math.max(1, viewH) * 100,
                loops: Math.max(0, loops),
                phasePx: mod,
                phasePct,
            });
        };


        const onScroll = () => {
            if (raf) return;
            raf = window.requestAnimationFrame(update);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        return () => {
            window.removeEventListener("resize", measure);
            window.removeEventListener("scroll", onScroll as any);
            if (raf) window.cancelAnimationFrame(raf);
        };
    }, [travelY, loopY, onTelemetry, totalVh]);

    // ----- Infinite driver height extender -----
    // Extend the section as you approach the bottom so user never "reaches the end".
    React.useEffect(() => {
        const el = sectionRef.current;
        if (!el) return;

        let lock = false;
        let raf = 0;

        const maybeExtend = () => {
            raf = 0;
            if (lock) return;

            const rect = el.getBoundingClientRect();
            const sectionTopInDoc = window.scrollY + rect.top;
            const sectionHeight = el.offsetHeight;
            const viewH = window.innerHeight;

            const y = window.scrollY;
            const inSection = y >= sectionTopInDoc && y <= sectionTopInDoc + sectionHeight - viewH;
            if (!inSection) return;

            // if within last ~2 viewports, extend
            const threshold = viewH * 2.2;
            const distToEnd = sectionTopInDoc + sectionHeight - viewH - y;

            if (distToEnd < threshold) {
                lock = true;
                setExtraVh((v) => v + extendByVh);
                // small lockout to avoid rapid repeats
                window.setTimeout(() => {
                    lock = false;
                }, 250);
            }
        };

        const onScroll = () => {
            if (raf) return;
            raf = window.requestAnimationFrame(maybeExtend);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        return () => {
            window.removeEventListener("scroll", onScroll as any);
            if (raf) window.cancelAnimationFrame(raf);
        };
    }, [extendByVh]);



    return (
        <>
            {/* Endless scroll driver */}
            <section ref={sectionRef} className="relative" style={{ height: `${totalVh}vh` }}>
                <div className="sticky top-0 h-screen overflow-hidden no-scrollbar">
                    <motion.div style={{ y: loopY }} className="relative h-[1px] w-full will-change-transform">
                        {tiled.map((p) => {
                            const isMobile = vw < 640;

                            // mobile tuning
                            const baseYOffset = isMobile ? 490 : 0;     // fresh top breathing room
                            const lane3Offset = isMobile ? 120 : 0;    // keep lane 3 lower
                            const mobileScale = isMobile ? 0.82 : 1;   // reduce crowding

                            const w = p.w * mobileScale;
                            const h = p.h * mobileScale;

                            return (
                                <motion.button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setOpen({ src: p.src, alt: p.alt })}
                                    className="absolute z-[999] pointer-events-auto overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-[0_18px_60px_rgba(0,0,0,0.55)] outline-none"
                                    style={{
                                        left: p.x,
                                        top: p.y + baseYOffset + (p.lane === 3 ? lane3Offset : 0),
                                        width: w,
                                        height: h,
                                    }}
                                    whileHover={{ scale: 1.03, y: -6 }}
                                    transition={{ type: "spring", stiffness: 260, damping: 22 }}
                                >
                                    <Image
                                        src={p.src}
                                        alt={p.alt}
                                        fill
                                        sizes="(max-width: 768px) 60vw, 30vw"
                                        className="object-cover"
                                    />
                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/0" />
                                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 hover:opacity-100">
                                        <div className="absolute inset-0 ring-1 ring-emerald-400/18" />
                                    </div>
                                </motion.button>
                            );
                        })}

                    </motion.div>
                </div>
            </section>


            {/* Lightbox (portal so it overlays video/hero/etc no matter z contexts) */}
            <BodyPortal>
                <AnimatePresence>
                    {open ? (
                        <motion.div
                            className="fixed inset-0 z-[99999]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <button
                                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                                onClick={() => setOpen(null)}
                                aria-label="Close"
                            />
                            <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-10">
                                <motion.div
                                    initial={{ y: 14, scale: 0.98, opacity: 0 }}
                                    animate={{ y: 0, scale: 1, opacity: 1 }}
                                    exit={{ y: 10, scale: 0.985, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 220, damping: 24 }}
                                    className="relative w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl"
                                >
                                    <div className="relative aspect-[16/10] w-full bg-black/20">
                                        <Image src={open.src} alt={open.alt} fill sizes="95vw" className="object-contain" priority />
                                    </div>
                                    <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
                                        <div className="text-[11px] uppercase tracking-[0.22em] text-white/70">{open.alt}</div>
                                        <button
                                            onClick={() => setOpen(null)}
                                            className="rounded-lg border border-white/30 bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white hover:bg-white/10"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </BodyPortal>
        </>
    );
}

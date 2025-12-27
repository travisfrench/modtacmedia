"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import type { Variants } from "framer-motion";

function BodyPortal({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    if (!mounted) return null;
    return createPortal(children, document.body);
}

function clamp(n: number, a: number, b: number) {
    return Math.max(a, Math.min(b, n));
}

/**
 * Choose columns (>= minCols) to make rows "clean":
 * - Prefer exact division (remainder 0)
 * - Otherwise minimize empty slots in last row
 * - Prefer fewer rows if tie
 */
function pickBestCols(n: number, minCols: number, maxCols: number) {
    if (n <= 0) return minCols;

    const lo = minCols;
    const hi = Math.max(lo, maxCols);

    let best = lo;
    let bestScore = Number.POSITIVE_INFINITY;

    for (let cols = lo; cols <= hi; cols++) {
        const rows = Math.ceil(n / cols);
        const empty = rows * cols - n; // how many blanks in the final grid
        const remainder = n % cols;

        // score: prioritize no empty, then fewer rows, then closer-to-square
        const squareBias = Math.abs(rows - cols) * 0.35;
        const score = empty * 10 + rows * 0.6 + squareBias + (remainder === 0 ? -2 : 0);

        if (score < bestScore) {
            bestScore = score;
            best = cols;
        }
    }

    return best;
}

export function GalleryModal({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) {
    const [images, setImages] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [active, setActive] = React.useState<string | null>(null);

    // measure modal width so we can cap maxCols by available space
    const gridRef = React.useRef<HTMLDivElement | null>(null);
    const [gridW, setGridW] = React.useState(1100);

    React.useEffect(() => {
        if (!open) return;

        setLoading(true);
        fetch("/api/gallery", { cache: "no-store" })
            .then((r) => r.json())
            .then((d) => setImages(Array.isArray(d?.images) ? d.images : []))
            .finally(() => setLoading(false));
    }, [open]);

    React.useEffect(() => {
        if (!open) return;
        const el = gridRef.current;
        if (!el) return;

        const ro = new ResizeObserver(() => {
            const rect = el.getBoundingClientRect();
            setGridW(rect.width);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [open]);

    // columns:
    // - min 4
    // - max depends on available width and desired thumb min size
    const minCols = 4;
    const minThumbPx = 170; // tweak: smaller = more columns possible
    const maxColsByWidth = clamp(Math.floor(gridW / minThumbPx), minCols, 12);
    const cols = React.useMemo(
        () => pickBestCols(images.length, minCols, maxColsByWidth),
        [images.length, maxColsByWidth]
    );

    // Animations
    const wrap: Variants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { duration: 0.25 } },
        exit: { opacity: 0, transition: { duration: 0.18 } },
    };

    const panel: Variants = {
        hidden: { opacity: 0, scale: 0.985, y: 10 },
        show: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: "spring", stiffness: 220, damping: 24 },
        },
        exit: { opacity: 0, scale: 0.99, y: 10, transition: { duration: 0.18 } },
    };

    const gridVariants: Variants = {
        hidden: {},
        show: { transition: { staggerChildren: 0.02, delayChildren: 0.06 } },
    };

    const thumb: Variants = {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
    };


    return (
        <BodyPortal>
            <AnimatePresence>
                {open ? (
                    <motion.div
                        className="fixed inset-0 z-[99999]"
                        variants={wrap}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                    >
                        {/* backdrop */}
                        <button
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                            onClick={onClose}
                            aria-label="Close gallery"
                        />

                        {/* glass panel */}
                        <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
                            <motion.div
                                variants={panel}
                                className="relative w-full max-w-[1320px] overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl"
                            >
                                {/* header */}
                                <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/20 px-4 py-3 sm:px-5 sm:py-4">
                                    <div className="text-[11px] uppercase tracking-[0.28em] text-white/70">
                                        Gallery
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/80 hover:bg-white/10"
                                    >
                                        Close
                                    </button>
                                </div>

                                {/* content */}
                                <div className="max-h-[78vh] overflow-auto p-3 sm:p-5" ref={gridRef}>
                                    {loading ? (
                                        <div className="p-6 text-sm text-white/70">Loading…</div>
                                    ) : images.length === 0 ? (
                                        <div className="p-6 text-sm text-white/70">
                                            No images found in <span className="text-white/90">/public/media/gallery</span>
                                        </div>
                                    ) : (
                                        <motion.div
                                            variants={gridVariants}
                                            initial="hidden"
                                            animate="show"
                                            className="grid gap-3 sm:gap-4"
                                            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
                                        >
                                            {images.map((src) => (
                                                <motion.button
                                                    key={src}
                                                    type="button"
                                                    variants={thumb}
                                                    onClick={() => setActive(src)}
                                                    className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-black/20 shadow-[0_14px_40px_rgba(0,0,0,0.45)] outline-none"
                                                >
                                                    <Image
                                                        src={src}
                                                        alt="Modtac Photography"
                                                        fill
                                                        sizes="25vw"
                                                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                                    />
                                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0 opacity-80" />
                                                    <div className="pointer-events-none absolute inset-0 ring-1 ring-emerald-400/0 group-hover:ring-emerald-400/20 transition" />
                                                </motion.button>
                                            ))}
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        </div>

                        {/* Lightbox */}
                        <AnimatePresence>
                            {active ? (
                                <motion.div
                                    className="fixed inset-0 z-[100000]"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <button
                                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                                        onClick={() => setActive(null)}
                                        aria-label="Close image"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-10">
                                        <motion.div
                                            initial={{ y: 10, scale: 0.985, opacity: 0 }}
                                            animate={{ y: 0, scale: 1, opacity: 1 }}
                                            exit={{ y: 10, scale: 0.985, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 220, damping: 24 }}
                                            className="relative h-[92vh] w-[96vw] overflow-hidden rounded-[26px] border border-white/10 bg-white/5 shadow-2xl"
                                        >
                                            <div className="absolute inset-0">
                                                <Image
                                                    src={active}
                                                    alt="Modtac Photography"
                                                    fill
                                                    sizes="96vw"
                                                    className="object-contain"
                                                    priority
                                                />
                                            </div>

                                            <div className="absolute right-3 top-3 z-10">
                                                <button
                                                    onClick={() => setActive(null)}
                                                    className="rounded-xl border border-white/15 bg-black/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/80 hover:bg-black/55"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </motion.div>
                                    </div>
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </BodyPortal>
    );
}

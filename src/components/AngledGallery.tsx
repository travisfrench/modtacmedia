"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Lightbox } from "./Lightbox";

type GalleryImage = { src: string; alt: string };

export function AngledGallery({
  images,
  marqueeSeconds = 34,
}: {
  images: GalleryImage[];
  marqueeSeconds?: number;
}) {
  const loopImages = useMemo(() => [...images, ...images], [images]);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  return (
    <>
      <Lightbox open={!!selected} image={selected} onClose={() => setSelected(null)} />

      {/* Full-width, no-box gallery strip */}
      <section aria-label="Gallery" className="pointer-events-auto w-full">
        <div
          className="relative w-full overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          style={{
            perspective: 1200,
            // Responsive sizing for the stack look (no JS resize listeners needed).
            ["--mt-card-w" as any]: "clamp(220px, 26vw, 320px)",
            ["--mt-overlap" as any]: "clamp(130px, 16vw, 210px)",
          }}
        >
          {/* A subtle base fade so the strip feels grounded without looking boxed */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Edge fades so it feels endless */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 bg-gradient-to-r from-black/85 to-transparent sm:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-12 bg-gradient-to-l from-black/85 to-transparent sm:w-24" />

          <div
            className={`mt-marquee relative z-10 flex w-max items-center py-3 sm:py-4 ${
              paused ? "mt-marquee-paused" : ""
            }`}
            style={{
              // CSS var drives the @keyframes duration
              ["--mt-marquee-duration" as any]: `${marqueeSeconds}s`,
            }}
          >
            {loopImages.map((img, i) => (
              <GalleryCard
                key={`${img.src}-${i}`}
                index={i}
                image={img}
                onOpen={() => setSelected(img)}
              />
            ))}
          </div>

          <div className="relative z-20 flex items-center justify-between px-4 pb-2 text-[11px] text-white/45 sm:px-6">
            <span>Hover to pause. Click to expand.</span>
            <span className="hidden sm:inline">3D stack • OD-green accents</span>
          </div>
        </div>
      </section>
    </>
  );
}

function GalleryCard({
  image,
  onOpen,
  index,
}: {
  image: { src: string; alt: string };
  onOpen: () => void;
  index: number;
}) {
  // "Stacked inline" overlap: wide cards, heavy Y-rotation, and negative spacing.
  // Sizing is driven by CSS vars set on the parent.

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      className="group relative shrink-0 focus-visible:outline-none"
      initial={false}
      whileHover="hover"
      whileFocus="hover"
      style={{
        marginLeft: index === 0 ? 0 : "calc(-1 * var(--mt-overlap))",
        zIndex: 1 + (index % 40),
      }}
    >
      {/* Glow */}
      <div className="absolute -inset-2 rounded-[18px] bg-[var(--mt-od)] opacity-0 blur-2xl transition-opacity group-hover:opacity-15" />

      <motion.div
        variants={{
          hover: {
            rotateY: 0,
            rotateX: 0,
            rotateZ: 0,
            scale: 1.14,
            y: -2,
            z: 60,
          },
        }}
        style={{ transformStyle: "preserve-3d", transformOrigin: "left center" }}
        className="relative"
        initial={{ rotateY: -58, rotateX: 2, rotateZ: -6, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ zIndex: 9999 }}
        whileFocus={{ zIndex: 9999 }}
      >
        <div
          className="relative aspect-[16/10] overflow-hidden rounded-[16px] border border-white/10 bg-black/35 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.95)]"
          style={{ width: "var(--mt-card-w)" }}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover opacity-90 transition group-hover:opacity-100"
            sizes="(max-width: 640px) 220px, 300px"
          />

          {/* Subtle top highlight */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/35" />

          {/* Caption strip */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-3 px-3 py-2">
            <div className="truncate text-left text-[11px] text-white/75">{image.alt}</div>
            <div className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] tracking-[0.18em] text-white/70">
              VIEW
            </div>
          </div>
        </div>
      </motion.div>
    </motion.button>
  );
}

"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type Item = { src: string; alt: string };

export function HoverExpandGallery({
  items,
  height = 110,
  className = "",
}: {
  items: Item[];
  height?: number;
  className?: string;
}) {
  const [active, setActive] = React.useState<number | null>(null);

  // keep tiles small and consistent; responsive via clamp
  const tileW = "clamp(68px, 8.5vw, 108px)";
  const tileH = `${height}px`;

  return (
    <div
      className={["w-full", className].join(" ")}
      onMouseLeave={() => setActive(null)}
    >
      <div className="flex w-full items-center justify-between gap-2 sm:gap-3">
        {items.map((it, idx) => {
          const isActive = active === idx;
          const distance = active == null ? 999 : idx - active;

          const push =
            active == null
              ? 0
              : Math.abs(distance) === 1
              ? (distance > 0 ? 14 : -14)
              : Math.abs(distance) === 2
              ? (distance > 0 ? 6 : -6)
              : 0;

          return (
            <motion.button
              key={it.src}
              type="button"
              onMouseEnter={() => setActive(idx)}
              onFocus={() => setActive(idx)}
              className={[
                "relative shrink-0 overflow-hidden rounded-xl sm:rounded-2xl",
                "border border-white/10 bg-black/30",
                "outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40",
              ].join(" ")}
              style={{ width: tileW, height: tileH }}
              animate={{
                x: push,
                scale: isActive ? 2.18 : 1,
                zIndex: isActive ? 20 : 1,
                filter: isActive
                  ? "brightness(1.05) contrast(1.05)"
                  : "brightness(0.88) contrast(1)",
              }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
            >
              <Image
                src={it.src}
                alt={it.alt}
                fill
                sizes="(max-width: 640px) 18vw, (max-width: 1024px) 10vw, 7vw"
                className="object-cover"
                priority={idx < 2}
              />

              {/* subtle tactical overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/0" />

              {/* active ring */}
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-xl sm:rounded-2xl"
                animate={{ opacity: isActive ? 1 : 0 }}
                transition={{ duration: 0.18 }}
              >
                <div className="absolute inset-0 ring-1 ring-emerald-400/18" />
              </motion.div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

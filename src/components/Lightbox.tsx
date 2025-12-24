"use client";

import Image from "next/image";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

type LightboxImage = { src: string; alt: string };

export function Lightbox({
  open,
  image,
  onClose,
}: {
  open: boolean;
  image: LightboxImage | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && image && (
        <motion.div
          className="fixed inset-0 z-[9999]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
            aria-label="Close"
          />

          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="relative w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-black/40 shadow-2xl shadow-black/60"
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/40 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium tracking-[0.22em] text-white/80">
                    IMAGE
                  </div>
                  <div className="truncate text-xs text-white/50">{image.alt}</div>
                </div>

                <button
                  onClick={onClose}
                  className="rounded-full border border-white/10 bg-black/45 px-3 py-1.5 text-xs text-white/80 transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(142,162,122,0.55)]"
                >
                  Close
                </button>
              </div>

              <div className="relative aspect-[16/10] w-full bg-black">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 90vw"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

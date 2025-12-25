"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, animate } from "framer-motion";
import { createPortal } from "react-dom";

type IntroOverlayProps = {
  logoSrc: string;      // "/media/modtac-temp-logo.png"
  peekImageSrc: string; // "/media/gallery/02.webp"
  onDone: () => void;
  videoReady?: boolean;
  minShowMs?: number;
  maxShowMs?: number;
};

function BodyPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export function IntroOverlay({
  logoSrc,
  peekImageSrc,
  onDone,
  videoReady = false,
  minShowMs = 950,
  maxShowMs = 2200,
}: IntroOverlayProps) {
  const reduce = useReducedMotion();
  const [canExit, setCanExit] = React.useState(false);

  // spotlight radius (px) we animate ourselves
  const r = useMotionValue(reduce ? 340 : 120); // start small

  React.useEffect(() => {
    // Ensure it feels intentional (not a loader)
    const t = window.setTimeout(() => setCanExit(true), reduce ? 250 : minShowMs);
    return () => window.clearTimeout(t);
  }, [minShowMs, reduce]);

  React.useEffect(() => {
    // hard cap so nobody gets stuck
    const t = window.setTimeout(() => onDone(), reduce ? 600 : maxShowMs);
    return () => window.clearTimeout(t);
  }, [maxShowMs, reduce, onDone]);

  React.useEffect(() => {
    if (canExit && videoReady) onDone();
  }, [canExit, videoReady, onDone]);

  // animate spotlight radius once on mount
  React.useEffect(() => {
    const controls = animate(r, reduce ? 380 : 560, {
      duration: reduce ? 0.45 : 0.9,
      ease: [0.2, 0.8, 0.2, 1],
    });
    return () => controls.stop();
  }, [r, reduce]);

  // Build mask string from radius
  const mask = r.get(); // used only for initial render; we also subscribe below
  const [maskStr, setMaskStr] = React.useState(() => makeMask(mask));

  React.useEffect(() => {
    return r.on("change", (val) => setMaskStr(makeMask(val)));
  }, [r]);

  return (
    <BodyPortal>
      <motion.div
        className="fixed inset-0 z-[99998] overflow-hidden"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Base black */}
        <div className="absolute inset-0 bg-black" />

        {/* Spotlight reveal (peek image through a growing radial mask) */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${peekImageSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "contrast(1.05) saturate(0.95) brightness(0.55)",
            // Apply the mask (typed safely via style)
            WebkitMaskImage: maskStr as any,
            maskImage: maskStr as any,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "cover",
            maskSize: "cover",
            opacity: reduce ? 0.65 : 0.85,
          }}
        />

        {/* OD glow bloom behind logo */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: reduce ? 0.22 : 0.36 }}
          transition={{ delay: reduce ? 0.05 : 0.12, duration: reduce ? 0.25 : 0.6 }}
          style={{
            background:
              "radial-gradient(420px 320px at 50% 46%, rgba(95,128,76,0.28), rgba(95,128,76,0.10) 55%, rgba(0,0,0,0) 75%)",
            mixBlendMode: "screen",
          }}
        />

        {/* Logo reveal */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{
              opacity: 0.06,
              filter: "drop-shadow(0 0 0px rgba(95,128,76,0))",
            }}
            animate={{
              opacity: reduce ? 0.38 : 0.62,
              filter: reduce
                ? "drop-shadow(0 0 10px rgba(95,128,76,0.20))"
                : "drop-shadow(0 0 18px rgba(95,128,76,0.30))",
            }}
            transition={{ delay: reduce ? 0.03 : 0.1, duration: reduce ? 0.25 : 0.7 }}
            className="relative"
          >
            <Image
              src={logoSrc}
              alt="ModTac Media"
              width={360}
              height={180}
              priority
              className="h-[64px] w-auto sm:h-[74px] opacity-90"
            />

            {/* subtle etched shimmer */}
            {!reduce ? (
              <motion.div
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 0, x: "-20%" }}
                animate={{ opacity: 0.14, x: "18%" }}
                transition={{ delay: 0.22, duration: 0.85, ease: [0.2, 0.8, 0.2, 1] }}
                style={{
                  background:
                    "linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 46%, rgba(255,255,255,0) 72%)",
                  mixBlendMode: "screen",
                }}
              />
            ) : null}
          </motion.div>
        </div>

        {/* Optional: soft fade at end (keeps it feeling intentional) */}
        <motion.div
          className="absolute inset-0 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0 }}
        />
      </motion.div>
    </BodyPortal>
  );
}

function makeMask(radiusPx: number) {
  // Slightly above center so it feels like it “finds” the logo first
  const r = Math.max(80, Math.min(900, radiusPx));
  const inner = Math.round(r * 0.52);
  const outer = Math.round(r * 0.78);

  return `radial-gradient(circle ${r}px at 50% 46%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${inner}px, rgba(0,0,0,0) ${outer}px)`;
}

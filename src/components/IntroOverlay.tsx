"use client";

import * as React from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, animate } from "framer-motion";
import { createPortal } from "react-dom";

type IntroOverlayProps = {
  logoSrc: string;
  peekImageSrc: string;
  onDone: () => void;
  videoReady?: boolean;
  minShowMs?: number;
  maxShowMs?: number;
};

function BodyPortal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  // IMPORTANT: don’t return null. Render inline until mounted to avoid “site flash”.
  if (!mounted) return <>{children}</>;

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

  // exit choreography
  const [phase, setPhase] = React.useState<"show" | "fadeToBlack" | "fadeOut">("show");
  const exitStartedRef = React.useRef(false);

  const FADE_TO_BLACK_MS = reduce ? 220 : 900; // black covers image
  const FADE_OUT_MS = reduce ? 260 : 950;      // overlay fades away

  const startExit = React.useCallback(() => {
    if (exitStartedRef.current) return;
    exitStartedRef.current = true;

    setPhase("fadeToBlack");
    window.setTimeout(() => setPhase("fadeOut"), FADE_TO_BLACK_MS);
    window.setTimeout(() => onDone(), FADE_TO_BLACK_MS + FADE_OUT_MS);
  }, [FADE_OUT_MS, FADE_TO_BLACK_MS, onDone]);

  // Preload peek image (since it's a CSS background-image)
  React.useEffect(() => {
    if (!peekImageSrc) return;
    const img = new window.Image();
    img.decoding = "async";
    img.src = peekImageSrc;
  }, [peekImageSrc]);

  // Ensure it feels intentional (not a loader)
  React.useEffect(() => {
    const t = window.setTimeout(() => setCanExit(true), reduce ? 250 : minShowMs);
    return () => window.clearTimeout(t);
  }, [minShowMs, reduce]);

  // hard cap so nobody gets stuck — start exit (don’t instantly onDone)
  React.useEffect(() => {
    const t = window.setTimeout(() => startExit(), reduce ? 600 : maxShowMs);
    return () => window.clearTimeout(t);
  }, [maxShowMs, reduce, startExit]);

  React.useEffect(() => {
    if (canExit && videoReady) startExit();
  }, [canExit, videoReady, startExit]);

  // spotlight radius (px)
  const r = useMotionValue(reduce ? 340 : 120);
  React.useEffect(() => {
    const controls = animate(r, reduce ? 380 : 560, {
      duration: reduce ? 0.45 : 0.9,
      ease: [0.2, 0.8, 0.2, 1],
    });
    return () => controls.stop();
  }, [r, reduce]);

  const [maskStr, setMaskStr] = React.useState(() => makeMask(r.get()));
  React.useEffect(() => r.on("change", (val) => setMaskStr(makeMask(val))), [r]);

  return (
    <BodyPortal>
      <motion.div
        className="fixed inset-0 z-[99998] overflow-hidden"
        // keep overlay fully visible until we explicitly fade it out
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "fadeOut" ? 0 : 1 }}
        transition={{ duration: (phase === "fadeOut" ? FADE_OUT_MS : 1) / 1000, ease: [0.2, 0.8, 0.2, 1] }}
      >
        {/* Base black */}
        <div className="absolute inset-0 bg-black" />

        {/* Spotlight reveal */}
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: phase === "fadeToBlack" || phase === "fadeOut" ? 0 : (reduce ? 0.65 : 0.85) }}
          transition={{ duration: (FADE_TO_BLACK_MS / 1000) * 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          style={{
            backgroundImage: `url(${peekImageSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "contrast(1.05) saturate(0.95) brightness(0.55)",
            WebkitMaskImage: maskStr as any,
            maskImage: maskStr as any,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "cover",
            maskSize: "cover",
          }}
        />

        {/* OD glow bloom */}
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

        {/* Logo */}
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

        {/* End scrim: slow fade to black, then wrapper fades out revealing site */}
        <motion.div
          className="absolute inset-0 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === "fadeToBlack" || phase === "fadeOut" ? 1 : 0 }}
          transition={{ duration: FADE_TO_BLACK_MS / 1000, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </motion.div>
    </BodyPortal>
  );
}

function makeMask(radiusPx: number) {
  const r = Math.max(80, Math.min(900, radiusPx));
  const inner = Math.round(r * 0.52);
  const outer = Math.round(r * 0.78);
  return `radial-gradient(circle ${r}px at 50% 46%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) ${inner}px, rgba(0,0,0,0) ${outer}px)`;
}

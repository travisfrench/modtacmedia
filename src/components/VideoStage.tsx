"use client";

import * as React from "react";
import { IntroOverlay } from "@/components/IntroOverlay";
import { RadarHUD } from "@/components/RadarHUD";
import { ContactButton } from "./ContactButton";
import { LogoLockup } from "./LogoLockup";
import TypeRotate from "./TypeRotate";
import { ScrollImageOverlay, type ScrollTelemetry } from "@/components/ScrollImageOverlay";

const GALLERY = [
  { src: "/media/gallery/01.webp", alt: "Night-vision grade lighting" },
  { src: "/media/gallery/02.webp", alt: "Product stills, field-ready" },
  { src: "/media/gallery/03.webp", alt: "Training day, clean composition" },
  { src: "/media/gallery/04.webp", alt: "Brand moments in motion" },
  { src: "/media/gallery/05.webp", alt: "Campaign visuals built to convert" },
  { src: "/media/gallery/06.webp", alt: "Campaign visuals built to convert" },
  { src: "/media/gallery/07.webp", alt: "Campaign visuals built to convert" },
  { src: "/media/gallery/08.webp", alt: "Campaign visuals built to convert" },
  { src: "/media/gallery/09.webp", alt: "Campaign visuals built to convert" },
  { src: "/media/gallery/10.webp", alt: "Campaign visuals built to convert" },
  { src: "/media/gallery/11.webp", alt: "Campaign visuals built to convert" },
  { src: "/media/gallery/12.webp", alt: "Campaign visuals built to convert" },
];

export function VideoStage() {
  const [showIntro, setShowIntro] = React.useState(true);
  const [videoReady, setVideoReady] = React.useState(false);
  const [telemetry, setTelemetry] = React.useState<ScrollTelemetry | null>(null);

  return (
    <main className="relative min-h-dvh no-scrollbar">
      {/* Intro sits above everything */}
      {showIntro ? (
        <IntroOverlay
          logoSrc="/media/modtac-logo-white.svg"
          peekImageSrc="/media/gallery/10.webp"
          videoReady={videoReady}
          onDone={() => setShowIntro(false)}
        />
      ) : null}
      {/* Background video */}
      <video
        className="fixed inset-0 z-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/media/gallery/02.webp"
      >
        <source src="/media/MTMWebLandscape.mp4" type="video/mp4" className="hidden sm:block" />
        <source src="/media/MTMWebVert.mp4" type="video/mp4" className="sm:hidden" />
      </video>

      {/* Dark overlay */}
      <div className="fixed inset-0 z-[1] bg-black/70" />
      <div className="fixed inset-0 z-1 bg-radial from-transparent via-transparent to-green-950/30" />
      {/* Corners */}
      <div className="fixed inset-0 z-1">
        <div className="size-10 absolute top-5 left-5 sm:top-10 sm:left-10 border-l border-t border-green-300/30" />
        <div className="size-10 absolute top-5 right-5 sm:top-10 sm:right-10 border-r border-t border-green-300/30" />
        <div className="size-10 absolute bottom-5 left-5 sm:bottom-10 sm:left-10 border-l border-b border-green-300/30" />
        <div className="size-10 absolute bottom-5 right-5 sm:bottom-10 sm:right-10 border-r border-b border-green-300/30" />
      </div>
        <RadarHUD
          telemetry={telemetry}
          extraLines={[
            { label: "Location", value: "Las Vegas, NV" },
          ]}
        />

      {/* HERO UI: fixed + always clickable */}
      <div className="fixed inset-0 z-50">
          <div className="absolute bottom-10 sm:bottom-20 left-10 sm:left-20 pointer-events-auto flex items-center gap-3">
            <TypeRotate />
          </div>
          <div className="absolute top-10 right-10 sm:top-20 sm:right-20 pointer-events-auto">
            <ContactButton email="hello@modtacmedia.com" />
          </div>

        <section
          className="pointer-events-auto relative z-[99] flex h-full items-center justify-center px-4 pb-10 pt-6 sm:px-6"
        >
          <LogoLockup />
        </section>

      </div>

      <div className="relative z-10 no-scrollbar">
        <ScrollImageOverlay
          items={GALLERY}
          heightVh={800}
          onTelemetry={setTelemetry}
        />
      </div>
    </main>
  );
}

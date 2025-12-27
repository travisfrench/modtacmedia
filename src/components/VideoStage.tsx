"use client";

import * as React from "react";
import { IntroOverlay } from "@/components/IntroOverlay";
import { RadarHUD } from "@/components/RadarHUD";
import { ContactButton } from "./ContactButton";
import { LogoLockup } from "./LogoLockup";
import TypeRotate from "./TypeRotate";
import { ScrollImageOverlay, type ScrollTelemetry } from "@/components/ScrollImageOverlay";
import { GalleryModal } from "@/components/GalleryModal";
import { RiGalleryView2 } from "react-icons/ri";

const GALLERY = [
  { src: "/media/gallery/01.webp", alt: "Production Work" },
  { src: "/media/gallery/02.webp", alt: "Product Shot" },
  { src: "/media/gallery/03.webp", alt: "Production Work" },
  { src: "/media/gallery/04.webp", alt: "Product Shot" },
  { src: "/media/gallery/05.webp", alt: "Production Work" },
  { src: "/media/gallery/06.webp", alt: "Production Work" },
  { src: "/media/gallery/07.webp", alt: "Product Shot" },
  { src: "/media/gallery/08.webp", alt: "Production Work" },
  { src: "/media/gallery/09.webp", alt: "Product Shot" },
  { src: "/media/gallery/10.webp", alt: "Production Work" },
  { src: "/media/gallery/11.webp", alt: "Product Shot" },
  { src: "/media/gallery/12.webp", alt: "Product Shot" },
];

export function VideoStage() {
  const [showIntro, setShowIntro] = React.useState(true);
  const [videoReady, setVideoReady] = React.useState(false);
  const [telemetry, setTelemetry] = React.useState<ScrollTelemetry | null>(null);
  const [galleryOpen, setGalleryOpen] = React.useState(false);

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
        poster="/media/gallery/10.webp"
      >
        <source src="/media/MTMWeb2Landscape.mp4" type="video/mp4" className="hidden sm:block" />
        <source src="/media/MTMWeb2.mp4" type="video/mp4" className="sm:hidden" />
      </video>

      {/* Dark overlay */}
      <div className="fixed inset-0 z-[1] bg-radial from-black/20 to-black/80" />
      <div className="fixed inset-0 z-1 bg-radial from-transparent via-transparent to-green-950/30" />
      {/* Corners */}
      <div className="fixed inset-0 z-1">
        <div className="size-10 absolute top-5 left-5 sm:top-10 sm:left-10 border-l border-t border-white/30" />
        <div className="size-10 absolute top-5 right-5 sm:top-10 sm:right-10 border-r border-t border-white/30" />
        <div className="size-10 absolute bottom-5 left-5 sm:bottom-10 sm:left-10 border-l border-b border-white/30" />
        <div className="size-10 absolute bottom-5 right-5 sm:bottom-10 sm:right-10 border-r border-b border-white/30" />
      </div>
      <RadarHUD
        telemetry={telemetry}
        extraLines={[
          { label: "Location", value: "Las Vegas, NV" },
        ]}
      />

      {/* HERO UI: fixed + always clickable */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <div className="absolute bottom-8 sm:bottom-12 left-10 sm:left-14 pointer-events-auto z-[200] flex items-center gap-3">
          <TypeRotate />
        </div>

        <div className="grid grid-rows-2 gap-2 sm:inline-flex absolute top-8 right-10 sm:top-12 sm:right-14 pointer-events-auto z-[200] space-x-2">
          <ContactButton email="derrick@modtac.media" />
          <button
        onClick={() => setGalleryOpen(true)}
        data-cursor="crosshair" 
        className="w-full cursor-none inline-flex items-center gap-2 pointer-events-auto rounded-lg backdrop-blur-sm bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-white/80 hover:bg-white/10"
      >
        <RiGalleryView2 size={20} /> Gallery
      </button>
        </div>

        {/* Center lockup: let only the lockup receive clicks */}
        <section className="relative z-[150] flex h-full items-center justify-center px-4 pb-10 pt-6 sm:px-6 pointer-events-none">
          <div className="pointer-events-auto">
            <LogoLockup />
          </div>
        </section>
      </div>

      <div className="relative z-10 no-scrollbar">
        <ScrollImageOverlay
          items={GALLERY}
          heightVh={700}
          onTelemetry={setTelemetry}
        />
      </div>
      <GalleryModal open={galleryOpen} onClose={() => setGalleryOpen(false)} />
    </main>
  );
}

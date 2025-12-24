import { ContactButton } from "./ContactButton";
import { LogoLockup } from "./LogoLockup";
import TypeRotate from "./TypeRotate";
import { ScrollImageOverlay } from "@/components/ScrollImageOverlay";

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
];

export function VideoStage() {
  return (
    <main className="relative min-h-dvh no-scrollbar">
      {/* Background video */}
      <video
        className="fixed inset-0 z-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/media/poster.jpg"
      >
        <source src="/media/hero.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="fixed inset-0 z-[1] bg-black/70" />

      {/* HERO UI: fixed + always clickable */}
      <div className="fixed inset-0 z-50 pointer-events-none">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="pointer-events-auto flex items-center gap-3">
            <TypeRotate />
          </div>
          <div className="pointer-events-auto">
            <ContactButton email="hello@modtacmedia.com" />
          </div>
        </header>

        <section className="pointer-events-none flex h-3/4 items-center justify-center px-4 pb-10 pt-6 sm:px-6">
          <LogoLockup />
        </section>
      </div>

      <div className="relative z-10 no-scrollbar">
        <ScrollImageOverlay items={GALLERY} heightVh={600} />
      </div>
    </main>
  );
}

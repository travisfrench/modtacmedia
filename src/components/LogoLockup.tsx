import Image from "next/image";

export function LogoLockup() {
  return (
    <div data-cursor="crosshair" className="relative z-[999] cursor-none pointer-events-auto mx-auto flex max-w-[760px] flex-col items-center text-center">
      {/* Simple mark (placeholder) */}
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-[28px] bg-[var(--mt-od)] opacity-15 blur-2xl" />
          <div className="ml-4">
            <Image
            src="/media/modtac-logo-white.svg"
            alt="modtac media logo"
            width={300}
            height={200}
            className="h-[70px] w-auto mb-4"
            />
        </div>
      </div>

      <h1 className="text-balance text-2xl tracking-tight text-[var(--mt-ink)] sm:text-xl">
        Tactical marketing for serious brands
      </h1>
    </div>
  );
}

import Link from "next/link";

export function ContactButton({ email }: { email: string }) {
  return (
    <Link
      href={`mailto:${email}`}
      data-cursor="crosshair" 
      className="cursor-none group inline-flex items-center gap-2 text-sm font-medium tracking-[0.22em] text-[var(--mt-ink)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(142,162,122,0.55)]"
      aria-label={`Email ${email}`}
    >
      <span className="relative inline-flex h-2 w-2">
        <span className="absolute inset-0 rounded-full bg-green-700 animate-pulse blur-[2px]" />
        <span className="relative rounded-full bg-[var(--mt-od)]" />
      </span>
      <span className="text-[10px] sm:text-xs text-shadow-lg">CONTACT</span>
    </Link>
  );
}

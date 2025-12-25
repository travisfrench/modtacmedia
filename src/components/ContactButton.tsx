import Link from "next/link";

export function ContactButton({ email }: { email: string }) {
  return (
    <Link
      href={`mailto:${email}`}
      className="group inline-flex items-center gap-2 text-xs font-medium tracking-[0.22em] text-[var(--mt-ink)] backdrop-blur transition hover:border-[rgba(142,162,122,0.7)] hover:bg-black/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(142,162,122,0.55)]"
      aria-label={`Email ${email}`}
    >
      <span className="relative inline-flex h-2 w-2">
        <span className="absolute inset-0 rounded-full bg-green-700 animate-pulse blur-[2px]" />
        <span className="relative rounded-full bg-[var(--mt-od)]" />
      </span>
      <span className="text-[10px] sm:text-xs">CONTACT</span>
    </Link>
  );
}

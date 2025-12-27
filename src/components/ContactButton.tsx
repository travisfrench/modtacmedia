import Link from "next/link";
import { MdOutlineEmail } from "react-icons/md";

export function ContactButton({ email }: { email: string }) {
  return (
    <Link
      href={`mailto:${email}`}
      data-cursor="crosshair" 
      className="cursor-none group gap-2 text-sm font-medium tracking-[0.22em] text-[var(--mt-ink)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(142,162,122,0.55)]"
      aria-label={`Email ${email}`}
    >
      <span className="inline-flex items-center gap-2 pointer-events-auto rounded-lg backdrop-blur-sm bg-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.26em] text-white/80 hover:bg-white/10"><MdOutlineEmail size={20} /> CONTACT</span>
    </Link>
  );
}

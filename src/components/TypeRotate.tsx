"use client";

import * as React from "react";

type TypeRotateProps = {
  items?: string[];
  className?: string;
  typingMsPerChar?: number;
  deletingMsPerChar?: number;
  holdMs?: number;
  betweenMs?: number;
  cursorBlinkMs?: number;
};

export default function TypeRotate({
  items = [
    "Video Production",
    "Still Photography",
    "Campaign Strategy",
    "Marketing Consulting",
    "Paid Social",
    "Digital Assets",
  ],
  className = "",
  typingMsPerChar = 55,
  deletingMsPerChar = 32,
  holdMs = 900,
  betweenMs = 250,
  cursorBlinkMs = 520,
}: TypeRotateProps) {
  const [index, setIndex] = React.useState(0);
  const [text, setText] = React.useState("");
  const [phase, setPhase] = React.useState<"typing" | "holding" | "deleting" | "between">(
    "typing"
  );
  const [cursorOn, setCursorOn] = React.useState(true);

  const current = items[index] ?? "";

  // cursor blink
  React.useEffect(() => {
    const id = window.setInterval(() => setCursorOn((v) => !v), cursorBlinkMs);
    return () => window.clearInterval(id);
  }, [cursorBlinkMs]);

  // type/delete loop
  React.useEffect(() => {
    let timer: number | undefined;

    if (phase === "typing") {
      if (text.length < current.length) {
        timer = window.setTimeout(() => {
          setText(current.slice(0, text.length + 1));
        }, typingMsPerChar);
      } else {
        timer = window.setTimeout(() => setPhase("holding"), holdMs);
      }
    }

    if (phase === "holding") {
    }

    if (phase === "deleting") {
      if (text.length > 0) {
        timer = window.setTimeout(() => {
          setText(current.slice(0, text.length - 1));
        }, deletingMsPerChar);
      } else {
        timer = window.setTimeout(() => setPhase("between"), betweenMs);
      }
    }

    if (phase === "between") {
      timer = window.setTimeout(() => {
        setIndex((i) => (i + 1) % items.length);
        setPhase("typing");
      }, betweenMs);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [
    phase,
    text,
    current,
    items.length,
    typingMsPerChar,
    deletingMsPerChar,
    holdMs,
    betweenMs,
  ]);

  // once we finish holding, start deleting
  React.useEffect(() => {
    if (phase !== "holding") return;
    const id = window.setTimeout(() => setPhase("deleting"), holdMs);
    return () => window.clearTimeout(id);
  }, [phase, holdMs]);

  return (
    <div className={["flex items-center gap-3", className].join(" ")}>
      <div className="doto-font flex items-center justify-center">
        <span
          className={[
            "text-sm text-white/80",
            "tracking-[0.22em] uppercase",
            "px-3 py-2 rounded-lg",
            "border border-dotted border-white/30 bg-black/25 backdrop-blur",
            "hover:border-white/50",
          ].join(" ")}
          aria-live="polite"
        >
          <span className="text-white/90">{text}</span>
          <span
            className={[
              "inline-block align-[-0.08em] ml-1",
              "w-[0.7ch]",
              cursorOn ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            █
          </span>
        </span>
      </div>
    </div>
  );
}

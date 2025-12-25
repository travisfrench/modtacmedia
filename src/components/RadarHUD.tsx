"use client";

import * as React from "react";
import type { ScrollTelemetry } from "@/components/ScrollImageOverlay";

export function RadarHUD({
    telemetry,
    location = "Las Vegas, NV",
    extraLines = [],
}: {
    telemetry: ScrollTelemetry | null;
    location?: string;
    extraLines?: Array<{ label: string; value: React.ReactNode }>;
}) {
    const runway = telemetry ? Math.round(telemetry.runwayVh) : 0;
    const loops = telemetry ? telemetry.loops : 0;

    return (
        <div className="pointer-events-none fixed left-10 sm:left-15 top-10 sm:top-15 z-[60]">
            <div className="max-w-[230px]">
                {/* subtle “radar glass” lines */}

                <div className="relative">
                    <div className="space-y-1 text-[12px] tracking-[0.14em] text-green-700/80">
                        <Line
                            label="Scroll Distance"
                            value={`${telemetry ? telemetry.scrolledVh.toFixed(0) : "0"}vh`}
                        />

                        <Line
                            label="Phase"
                            value={`${telemetry ? telemetry.phasePct.toFixed(0) : "0"}%`}
                        />
                        <Line label="Image loops" value={`${loops}`} />

                        {extraLines.length ? (
                            <div className="mt-2 border-t border-white/10 pt-2 space-y-1">
                                {extraLines.map((l) => (
                                    <Line key={l.label} label={l.label} value={l.value} />
                                ))}
                            </div>
                        ) : null}
                    </div>
                    

                    {/* tiny blinking cursor accent */}
                    <div className="mt-2 h-[10px]">
                        <span className="inline-block h-[10px] w-[6px] animate-pulse rounded-sm bg-[rgba(95,128,76,0.55)]" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Line({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-baseline justify-between gap-3">
            <span className="text-green-300/35">{label}</span>
            <span className="text-green-300/55">{value}</span>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function MatchCountdown({ target }: { target: string | Date }) {
  const targetMs = new Date(target).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  if (now === null) {
    return <div className="h-16" aria-hidden />;
  }

  const diff = targetMs - now;

  if (diff <= 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-pitch-400/30 bg-pitch-500/10 px-4 py-3">
        <span className="font-display text-lg font-bold uppercase tracking-[0.2em] text-pitch-300 animate-pulse-glow">
          Es hoy · En juego
        </span>
      </div>
    );
  }

  const dias = Math.floor(diff / 86400000);
  const horas = Math.floor(diff / 3600000) % 24;
  const minutos = Math.floor(diff / 60000) % 60;
  const segundos = Math.floor(diff / 1000) % 60;

  const units = [
    { value: dias, label: "días" },
    { value: horas, label: "hrs" },
    { value: minutos, label: "min" },
    { value: segundos, label: "seg" },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {units.map((u) => (
        <div
          key={u.label}
          className="rounded-2xl border border-white/10 bg-black/30 py-2.5 text-center backdrop-blur-sm"
        >
          <p className="font-display text-2xl font-bold tabular-nums leading-none text-white">
            {pad(u.value)}
          </p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/50">
            {u.label}
          </p>
        </div>
      ))}
    </div>
  );
}

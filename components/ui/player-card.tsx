"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface PlayerCardProps {
  nombre: string;
  posicion: string;
  dorsal?: number | null;
  fotoUrl?: string | null;
  rating?: number;
  equipo?: string;
  stats?: { label: string; value: number }[];
  tier?: "bronce" | "plata" | "oro" | "leyenda";
  className?: string;
}

const tierStyles = {
  bronce: {
    gradient: "from-[#8a5a3b] via-[#c98b5e] to-[#6b4226]",
    glow: "shadow-[0_0_40px_-5px_rgba(180,120,80,0.5)]",
    label: "text-[#f0d9c0]",
  },
  plata: {
    gradient: "from-[#8a97a8] via-[#d9e2ec] to-[#6b7684]",
    glow: "shadow-[0_0_40px_-5px_rgba(180,190,210,0.5)]",
    label: "text-[#eef2f7]",
  },
  oro: {
    gradient: "from-[#a3760f] via-[#F2B33D] to-[#8a5f0a]",
    glow: "shadow-[0_0_50px_-5px_rgba(242,179,61,0.6)]",
    label: "text-[#fff3d6]",
  },
  leyenda: {
    gradient: "from-[#0e7a52] via-[#1FCB6B] to-[#0a5c3c]",
    glow: "shadow-[0_0_60px_-5px_rgba(31,203,107,0.7)]",
    label: "text-white",
  },
};

export function PlayerCard({
  nombre,
  posicion,
  dorsal,
  fotoUrl,
  rating = 84,
  equipo,
  stats = [],
  tier = "oro",
  className,
}: PlayerCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [12, -12]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-12, 12]), { stiffness: 200, damping: 20 });
  const glareX = useTransform(x, [-100, 100], [0, 100]);
  const glareY = useTransform(y, [-100, 100], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setHover(false);
  };

  const style = tierStyles[tier];

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={cn(
        "relative w-64 aspect-[3/4.2] rounded-2xl cursor-pointer select-none",
        "bg-gradient-to-br",
        style.gradient,
        style.glow,
        "border border-white/20",
        className
      )}
    >
      {/* Glare effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300"
        style={{
          opacity: hover ? 0.5 : 0,
          background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.5), transparent 60%)`,
        }}
      />

      {/* Diagonal shine pattern */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-30">
        <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/40 to-transparent rotate-12" />
      </div>

      <div className="relative h-full flex flex-col p-4" style={{ transform: "translateZ(30px)" }}>
        {/* Top: rating + position */}
        <div className="flex items-start justify-between">
          <div className="text-center">
            <p className={cn("text-3xl font-display font-bold leading-none", style.label)}>{rating}</p>
            <p className={cn("text-xs font-semibold uppercase tracking-wider", style.label)}>{posicion}</p>
          </div>
          {dorsal != null && (
            <div className={cn("text-2xl font-display font-bold", style.label)}>#{dorsal}</div>
          )}
        </div>

        {/* Photo */}
        <div className="flex-1 flex items-center justify-center my-2">
          <div className="w-32 h-32 rounded-full bg-black/20 border-2 border-white/30 flex items-center justify-center overflow-hidden backdrop-blur-sm">
            {fotoUrl ? (
              <img src={fotoUrl} alt={nombre} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-display font-bold text-white/90">
                {nombre.charAt(0)}
              </span>
            )}
          </div>
        </div>

        {/* Name */}
        <div className="text-center mb-2">
          <p className="text-white font-display font-bold text-lg uppercase tracking-wide leading-tight truncate drop-shadow">
            {nombre}
          </p>
          {equipo && <p className="text-white/70 text-xs truncate">{equipo}</p>}
        </div>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-2 pt-2 border-t border-white/20">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center justify-between text-xs">
                <span className="text-white font-bold">{s.value}</span>
                <span className="text-white/70 uppercase tracking-wide">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-dark-900">
      {/* Aurora blobs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-pitch-500/20 blur-[120px]"
        animate={{
          x: ["-10%", "20%", "-10%"],
          y: ["0%", "20%", "0%"],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "-10%", left: "0%" }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-blue-500/15 blur-[120px]"
        animate={{
          x: ["10%", "-15%", "10%"],
          y: ["10%", "-10%", "10%"],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        style={{ top: "20%", right: "0%" }}
      />
      <motion.div
        className="absolute w-[450px] h-[450px] rounded-full bg-gold-500/10 blur-[120px]"
        animate={{
          x: ["0%", "15%", "0%"],
          y: ["-5%", "10%", "-5%"],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        style={{ bottom: "0%", left: "30%" }}
      />

      {/* Stadium pitch grid lines fading to horizon */}
      <div
        className="absolute inset-x-0 bottom-0 h-[60vh] opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(31,203,107,0.6) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(31,203,107,0.6) 40px)",
          maskImage: "linear-gradient(to top, black, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)",
        }}
      />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

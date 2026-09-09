"use client";

import { motion } from "framer-motion";

const motes = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 17) % 96}%`,
  top: `${8 + ((i * 29) % 86)}%`,
  delay: (i % 6) * 0.45,
  size: 4 + (i % 4) * 2
}));

export function AmbientDecor() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="leaf-spray leaf-left">❧</div>
      <div className="leaf-spray leaf-right">❧</div>
      <div className="gold-line line-a" />
      <div className="gold-line line-b" />
      {motes.map((m, i) => (
        <motion.span
          key={i}
          className="mote"
          style={{ left: m.left, top: m.top, width: m.size, height: m.size }}
          animate={{ opacity: [0.2, 0.85, 0.2], y: [0, -7, 0], scale: [0.9, 1.15, 0.9] }}
          transition={{ duration: 4.2, repeat: Infinity, delay: m.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

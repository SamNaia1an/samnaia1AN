"use client";

import { motion } from "framer-motion";
import { finalFlowerMessage, flowerIntroMessage } from "@/data/content";

const petals = Array.from({ length: 34 }, (_, i) => ({
  left: `${(i * 19) % 100}%`,
  delay: (i % 10) * 0.22,
  duration: 4.8 + (i % 8) * 0.38,
  drift: -70 + (i % 13) * 11,
  size: 11 + (i % 5) * 4,
  rotate: -40 + (i % 9) * 10
}));

export function FlowersSurprise({ onClose }: { onClose: () => void }) {
  return (
    <div className="surprise-overlay">
      {petals.map((p, i) => (
        <motion.span
          key={i}
          className="petal rose-petal red-petal"
          style={{ left: p.left, width: p.size, height: p.size * 0.72 }}
          initial={{ y: -80, x: 0, rotate: p.rotate, opacity: 0 }}
          animate={{ y: "110vh", x: p.drift, rotate: p.rotate + 430, opacity: [0, 1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}

      <button className="close-button" onClick={onClose}>×</button>
      <motion.div className="surprise-scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div
          className="sam-gift-figure"
          initial={{ x: -180, opacity: 0, rotate: -4 }}
          animate={{ x: 0, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 18, stiffness: 65 }}
        >
          <img src="/assets/sam.png" alt="Sam" />
          <motion.img
            src="/assets/bouquet-roses.jpg"
            alt="Bouquet de roses rouges"
            className="bouquet-photo"
            initial={{ scale: 0.72, opacity: 0, rotate: 16, y: 28 }}
            animate={{ scale: 1, opacity: 1, rotate: [11, 7, 11], y: [10, 0, 10] }}
            transition={{ delay: 0.5, duration: 1.25, ease: "easeOut", repeat: Infinity, repeatDelay: 1.1 }}
          />
        </motion.div>
        <motion.div
          className="speech-card"
          initial={{ y: 25, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 1.0 }}
        >
          <div className="speech-small">{flowerIntroMessage}</div>
          <div className="speech-main">{finalFlowerMessage}</div>
          <button className="gold-button compact" onClick={onClose}>J&apos;arrive ♡</button>
        </motion.div>
      </motion.div>
    </div>
  );
}

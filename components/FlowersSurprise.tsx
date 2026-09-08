"use client";

import { motion } from "framer-motion";
import { finalFlowerMessage, flowerIntroMessage } from "@/data/content";

const petals = Array.from({ length: 36 }, (_, i) => ({
  left: `${(i * 29) % 100}%`,
  delay: (i % 12) * 0.24,
  duration: 5 + (i % 8) * 0.42,
  drift: -55 + (i % 11) * 11,
  size: 10 + (i % 5) * 3,
  rotate: -30 + (i % 7) * 12
}));

const roses = [
  { x: 18, y: 16, color: "rose-pink" },
  { x: 49, y: 6, color: "rose-cream" },
  { x: 77, y: 20, color: "rose-pink" },
  { x: 33, y: 34, color: "rose-cream" },
  { x: 61, y: 36, color: "rose-pink" }
];

export function FlowersSurprise({ onClose }: { onClose: () => void }) {
  return (
    <div className="surprise-overlay">
      {petals.map((p, i) => (
        <motion.span
          key={i}
          className="petal rose-petal"
          style={{ left: p.left, width: p.size, height: p.size * 0.68 }}
          initial={{ y: -80, x: 0, rotate: p.rotate, opacity: 0 }}
          animate={{ y: "110vh", x: p.drift, rotate: p.rotate + 380, opacity: [0, 1, 1, 0] }}
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
          <motion.div
            className="bouquet bouquet-roses"
            initial={{ scale: 0.75, opacity: 0, rotate: 16, y: 24 }}
            animate={{ scale: 1, opacity: 1, rotate: [12, 8, 12], y: [12, 0, 12] }}
            transition={{ delay: 0.55, duration: 1.25, ease: "easeOut", repeat: Infinity, repeatDelay: 1.2 }}
          >
            <div className="bouquet-wrap">
              {roses.map((rose, index) => (
                <span
                  key={index}
                  className={`rose ${rose.color}`}
                  style={{ left: `${rose.x}%`, top: `${rose.y}%` }}
                />
              ))}
              <span className="bouquet-ribbon" />
              <span className="bouquet-stem stem-left" />
              <span className="bouquet-stem stem-center" />
              <span className="bouquet-stem stem-right" />
            </div>
          </motion.div>
        </motion.div>
        <motion.div
          className="speech-card"
          initial={{ y: 25, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ delay: 1.05 }}
        >
          <div className="speech-small">{flowerIntroMessage}</div>
          <div className="speech-main">{finalFlowerMessage}</div>
          <button className="gold-button compact" onClick={onClose}>J'arrive ♡</button>
        </motion.div>
      </motion.div>
    </div>
  );
}

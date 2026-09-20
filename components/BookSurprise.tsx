"use client";

import { motion } from "framer-motion";
import { finalBookMessage } from "@/data/content";

const gifts = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 17 + 4) % 96}%`,
  delay: (i % 9) * 0.32,
  duration: 5.8 + (i % 6) * 0.45,
  drift: -55 + (i % 10) * 12,
  size: 18 + (i % 4) * 4,
  rotate: -18 + (i % 7) * 8
}));

const pages = [0, 1, 2, 3];

export function BookSurprise({ onClose }: { onClose: () => void }) {
  return (
    <div className="surprise-overlay book-mode">
      {gifts.map((gift, i) => (
        <motion.span
          key={i}
          className="falling-gift"
          style={{ left: gift.left, width: gift.size, height: gift.size }}
          initial={{ y: -90, x: 0, rotate: gift.rotate, opacity: 0 }}
          animate={{
            y: "112vh",
            x: [0, gift.drift, gift.drift / 2],
            rotate: gift.rotate + 420,
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: gift.duration,
            delay: gift.delay,
            repeat: Infinity,
            ease: "linear"
          }}
          aria-hidden="true"
        />
      ))}

      <button className="close-button" onClick={onClose}>×</button>
      <div className="sparkle-field" aria-hidden="true">✦　⋆　♡　✧　⋆　✦　♡</div>

      <motion.div className="surprise-scene" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div
          className="sam-gift-figure book-figure"
          initial={{ y: 70, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 18 }}
        >
          <img src="/assets/sam.png" alt="Sam" />

          <motion.div
            className="book-prop book-prop-animated"
            initial={{ rotateY: -70, scale: 0.65, opacity: 0 }}
            animate={{
              rotateY: 0,
              scale: 1,
              opacity: 1,
              y: [0, -9, 0],
              rotate: [5, 1.5, 5]
            }}
            transition={{
              rotateY: { delay: 0.55, duration: 0.85, ease: [0.22, 1, 0.36, 1] },
              scale: { delay: 0.55, duration: 0.85, ease: [0.22, 1, 0.36, 1] },
              opacity: { delay: 0.55, duration: 0.35 },
              y: { delay: 2.7, duration: 2.8, repeat: Infinity, ease: "easeInOut" },
              rotate: { delay: 2.7, duration: 2.8, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <div className="book-glow" aria-hidden="true" />
            <img src="/assets/book-cover.png" alt="Couverture du livre" />

            <div className="page-flip-stack" aria-hidden="true">
              {pages.map((page, index) => (
                <motion.span
                  key={page}
                  className={`flip-page flip-page-${index + 1}`}
                  initial={{ rotateY: 0, opacity: 0 }}
                  animate={{
                    rotateY: [0, 0, -168, -168],
                    opacity: [0, 1, 1, 0]
                  }}
                  transition={{
                    delay: 1.32 + index * 0.18,
                    duration: 0.72,
                    times: [0, 0.08, 0.82, 1],
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  <i />
                  <b />
                </motion.span>
              ))}
            </div>

            <motion.div
              className="page-flip-shine"
              initial={{ opacity: 0, x: "-35%" }}
              animate={{ opacity: [0, 0.8, 0], x: ["-35%", "120%", "120%"] }}
              transition={{ delay: 1.42, duration: 1.1, ease: "easeOut" }}
              aria-hidden="true"
            />
          </motion.div>
        </motion.div>

        <motion.div
          className="speech-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.05 }}
        >
          <div className="speech-main medium">{finalBookMessage}</div>
          <button className="gold-button compact" onClick={onClose}>♡</button>
        </motion.div>
      </motion.div>
    </div>
  );
}

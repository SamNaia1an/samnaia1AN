"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import { finalBookMessage } from "@/data/content";

const BOOK_URL = "https://samnaia1an.github.io/livre1an/#page1";

const giftHues = [0, 42, 88, 145, 198, 248, 305, 338];
const gifts = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 17 + 4) % 96}%`,
  delay: (i % 11) * 0.26,
  duration: 5.3 + (i % 7) * 0.42,
  drift: -65 + (i % 12) * 12,
  size: 22 + (i % 5) * 5,
  rotate: -18 + (i % 7) * 8,
  hue: giftHues[i % giftHues.length]
}));

const pages = Array.from({ length: 11 }, (_, i) => i);

export function BookSurprise({ onClose }: { onClose: () => void }) {
  const [flipKey, setFlipKey] = useState(1);
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function replayFlip() {
    setFlipKey((value) => value + 1);
  }

  function handleBookClick() {
    clickCountRef.current += 1;

    if (clickCountRef.current === 3) {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
      clickCountRef.current = 0;
      window.open(BOOK_URL, "_blank", "noopener,noreferrer");
      return;
    }

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      // 1 clic = on rejoue le feuilletage. 2 clics = même effet.
      replayFlip();
      clickCountRef.current = 0;
      clickTimerRef.current = null;
    }, 460);
  }

  return (
    <div className="surprise-overlay book-mode">
      {gifts.map((gift, i) => (
        <motion.span
          key={i}
          className="falling-gift-emoji"
          style={{
            left: gift.left,
            fontSize: gift.size,
            filter: `hue-rotate(${gift.hue}deg) saturate(1.3) drop-shadow(0 4px 5px rgba(100,60,30,.18))`
          }}
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
        >
          🎁
        </motion.span>
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

          <motion.button
            type="button"
            className="book-prop book-prop-animated book-interactive"
            onClick={handleBookClick}
            aria-label="Feuilleter le livre. Trois clics rapides ouvrent le livre complet."
            title="Clique pour feuilleter"
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
            whileTap={{ scale: 0.98 }}
          >
            <div className="book-glow" aria-hidden="true" />
            <img src="/assets/book-cover.png" alt="Couverture du livre" />

            <div key={flipKey} className="page-flip-stack page-flip-stack-realistic" aria-hidden="true">
              {pages.map((page, index) => (
                <motion.span
                  key={`${flipKey}-${page}`}
                  className={`flip-page realistic-flip-page realistic-flip-page-${index + 1}`}
                  initial={{ rotateY: 0, rotateZ: 0, x: 0, opacity: 0 }}
                  animate={{
                    rotateY: [0, -12, -95, -172, -178],
                    rotateZ: [0, 0.3, -0.5, -1.2, -1.2],
                    x: [0, 1, -2, -4, -4],
                    opacity: [0, 1, 1, 1, 0]
                  }}
                  transition={{
                    delay: 0.12 + index * 0.055,
                    duration: 0.54,
                    times: [0, 0.12, 0.48, 0.88, 1],
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  <i />
                  <b />
                </motion.span>
              ))}
            </div>

            <motion.div
              key={`shine-${flipKey}`}
              className="page-flip-shine"
              initial={{ opacity: 0, x: "-35%" }}
              animate={{ opacity: [0, 0.9, 0], x: ["-35%", "130%", "130%"] }}
              transition={{ delay: 0.28, duration: 0.95, ease: "easeOut" }}
              aria-hidden="true"
            />
          </motion.button>
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

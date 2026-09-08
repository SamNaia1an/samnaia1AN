"use client";

import { motion } from "framer-motion";
import { bookCoverLabel, finalBookMessage } from "@/data/content";

export function BookSurprise({ onClose }: { onClose: () => void }) {
  return (
    <div className="surprise-overlay book-mode">
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
            className="book-prop"
            initial={{ rotateY: -70, scale: 0.65 }}
            animate={{ rotateY: 0, scale: 1 }}
            transition={{ delay: 0.65, duration: 0.9 }}
          >
            <img src="/assets/book-cover.png" alt="Couverture du livre" />
            <div className="book-cover-label">{bookCoverLabel}</div>
          </motion.div>
        </motion.div>
        <motion.div className="speech-card" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.05 }}>
          <div className="speech-main medium">{finalBookMessage}</div>
          <button className="gold-button compact" onClick={onClose}>♡</button>
        </motion.div>
      </motion.div>
    </div>
  );
}

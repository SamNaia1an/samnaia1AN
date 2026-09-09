"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { letterText } from "@/data/content";

type Props = { onContinue: () => void };

export function LetterScene({ onContinue }: Props) {
  const [opened, setOpened] = useState(false);

  return (
    <section className="letter-stage">
      <motion.div
        className="sam-letter-avatar"
        initial={{ x: "-78vw", opacity: 0, rotate: -7, y: 24 }}
        animate={{ x: 0, opacity: 1, rotate: 0, y: 0 }}
        transition={{ type: "spring", stiffness: 72, damping: 15, duration: 1.9 }}
      >
        <img src="/assets/sam.png" alt="Avatar de Sam" />
        <motion.div
          className="carried-envelope"
          animate={{ y: [0, -8, 0], rotate: [-3, 2, -3], x: [0, 2, 0] }}
          transition={{ repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
        >
          ♡
        </motion.div>
      </motion.div>

      <div className="envelope-wrap">
        <motion.button
          type="button"
          className={`envelope-clicker ${opened ? "is-opened" : ""}`}
          onClick={() => setOpened(true)}
          initial={{ scale: 0.72, opacity: 0, y: 70, rotate: -5 }}
          animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
          transition={{ delay: 0.65, type: "spring", stiffness: 110, damping: 14 }}
          whileHover={!opened ? { y: -10, rotate: -2, scale: 1.02 } : undefined}
          whileTap={!opened ? { scale: 0.98 } : undefined}
          aria-label="Ouvrir la lettre"
        >
          <motion.div
            className="envelope"
            animate={opened ? { scale: 0.96, y: 35, opacity: 0.35 } : { y: [0, -10, 0], rotate: [0, 1.5, 0, -1.5, 0] }}
            transition={opened ? { duration: 0.55, ease: "easeOut" } : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <motion.div
              className="envelope-flap"
              animate={opened ? { rotateX: -180 } : { rotateX: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: "top center" }}
            />
            <div className="heart-seal">♡</div>
          </motion.div>

          {!opened && (
            <motion.div
              className="tap-to-open"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              Appuie sur la lettre pour l&apos;ouvrir ✨
            </motion.div>
          )}
        </motion.button>

        <AnimatePresence>
          {opened && (
            <motion.article
              className="letter-paper"
              initial={{ y: 170, scaleY: 0.18, opacity: 0 }}
              animate={{ y: -8, scaleY: 1, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="letter-kicker">Pour toi, mon amour</div>
              {letterText.split("\n").map((line, i) => <p key={i}>{line || "\u00A0"}</p>)}
              <div className="letter-signature">Sam ♡</div>
              <button className="gold-button compact" onClick={onContinue}>Continuer ♡</button>
            </motion.article>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

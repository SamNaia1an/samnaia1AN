"use client";

import { motion } from "framer-motion";
import { letterText } from "@/data/content";

type Props = { onContinue: () => void };

export function LetterScene({ onContinue }: Props) {
  return (
    <section className="letter-stage">
      <motion.div
        className="sam-letter-avatar"
        initial={{ x: "-75vw", opacity: 0, rotate: -4 }}
        animate={{ x: 0, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 70, damping: 17, duration: 1.6 }}
      >
        <img src="/assets/sam.png" alt="Avatar de Sam" />
        <motion.div
          className="carried-envelope"
          animate={{ y: [0, -5, 0], rotate: [-1, 1, -1] }}
          transition={{ repeat: Infinity, duration: 2.3 }}
        >
          ♡
        </motion.div>
      </motion.div>

      <motion.div
        className="envelope-wrap"
        initial={{ scale: 0.75, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.85, duration: 0.7 }}
      >
        <motion.div className="envelope" animate={{ rotate: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <div className="envelope-flap" />
          <div className="heart-seal">♡</div>
        </motion.div>

        <motion.article
          className="letter-paper"
          initial={{ y: 120, scaleY: 0.2, opacity: 0 }}
          animate={{ y: -20, scaleY: 1, opacity: 1 }}
          transition={{ delay: 1.55, duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="letter-kicker">Pour toi, mon amour</div>
          {letterText.split("\n").map((line, i) => <p key={i}>{line || "\u00A0"}</p>)}
          <div className="letter-signature">Sam ♡</div>
          <button className="gold-button compact" onClick={onContinue}>Continuer ♡</button>
        </motion.article>
      </motion.div>
    </section>
  );
}

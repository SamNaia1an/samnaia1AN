"use client";

import { motion } from "framer-motion";
import { Countdown } from "./Countdown";
import type { Surprise } from "@/data/surprises";

export function UnlockCard({
  surprise,
  now,
  onOpen,
  forceUnlocked = false
}: {
  surprise: Surprise;
  now: Date;
  onOpen: () => void;
  forceUnlocked?: boolean;
}) {
  const target = new Date(surprise.unlockAt);
  const unlocked = forceUnlocked || now >= target;
  const timeLabel = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    hour: "2-digit",
    minute: "2-digit"
  }).format(target);

  return (
    <motion.button
      className={`unlock-card ${unlocked ? "is-unlocked" : "is-locked"}`}
      onClick={() => unlocked && onOpen()}
      whileHover={unlocked ? { y: -4, scale: 1.01 } : undefined}
      whileTap={unlocked ? { scale: 0.985 } : undefined}
      animate={unlocked ? {
        boxShadow: [
          "0 12px 35px rgba(156,103,41,.12)",
          "0 16px 48px rgba(202,144,55,.32)",
          "0 12px 35px rgba(156,103,41,.12)"
        ]
      } : {}}
      transition={{ duration: 2.6, repeat: unlocked ? Infinity : 0 }}
    >
      <div className="unlock-icon">{unlocked ? "♡" : "♙"}</div>
      <div>
        {forceUnlocked && <div className="available-now">Disponible maintenant</div>}
        <h3>{surprise.title}</h3>
        <p>{unlocked ? surprise.subtitle : `Disponible à ${timeLabel}`}</p>
        {!unlocked && !forceUnlocked && (
          <div className="countdown"><Countdown target={target} now={now} /></div>
        )}
        {unlocked && <div className="open-hint">Ouvrir la surprise →</div>}
      </div>
    </motion.button>
  );
}

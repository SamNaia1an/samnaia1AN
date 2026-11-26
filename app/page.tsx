"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AmbientDecor } from "@/components/AmbientDecor";
import { PhotoGate } from "@/components/PhotoGate";
import { LetterScene } from "@/components/LetterScene";
import { SurpriseHub } from "@/components/SurpriseHub";

type Step = "gate" | "letter" | "hub";

export default function Home() {
  // Naia recommence toujours par l'identification à chaque ouverture/rechargement.
  const [step, setStep] = useState<Step>("gate");
  const [ownerMode, setOwnerMode] = useState(false);
  const [showSH, setShowSH] = useState(false);

  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get("sh");
    if (!key) return;

    let cancelled = false;

    fetch("/api/owner-mode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ key })
    })
      .then(async (res) => {
        const data = (await res.json()) as { ok?: boolean };
        if (!cancelled) setShowSH(Boolean(res.ok && data.ok));
      })
      .catch(() => {
        if (!cancelled) setShowSH(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function go(next: Step) {
    // La progression existe seulement pendant cette visite.
    setStep(next);
  }

  function enterOwnerMode() {
    setOwnerMode(true);
    setStep("letter");
  }

  return (
    <main className="site-shell">
      <AmbientDecor />

      {showSH && step === "gate" && (
        <motion.button
          type="button"
          className="sh-owner-button"
          onClick={enterOwnerMode}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.72, scale: 1 }}
          whileHover={{ opacity: 1, scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          aria-label="Entrer en mode Sam"
        >
          SH
        </motion.button>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={`${step}-${ownerMode ? "sam" : "naia"}`}
          className="page-layer"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6 }}
        >
          {step === "gate" && <PhotoGate onComplete={() => go("letter")} />}
          {step === "letter" && <LetterScene onContinue={() => go("hub")} />}
          {step === "hub" && <SurpriseHub ownerMode={ownerMode} />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

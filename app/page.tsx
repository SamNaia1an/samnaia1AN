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
  const [samEntry, setSamEntry] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");
  const [keyBusy, setKeyBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSamEntry(params.get("sam") === "1");
    const key = params.get("sh");
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

      {(showSH || samEntry) && step === "gate" && (
        <motion.button
          type="button"
          className="sh-owner-button"
          onClick={() => { if (showSH) enterOwnerMode(); else setKeyError("Entre ta clé SH dans le formulaire."); }}
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
          {step === "gate" && samEntry && !showSH && <form className="soft-copy" style={{ maxWidth: 360, margin: "12px auto", padding: 16 }} onSubmit={async (e) => { e.preventDefault(); setKeyBusy(true); setKeyError(""); try { const r = await fetch("/api/owner-mode", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: keyInput }) }); if (!r.ok) { setKeyError("Clé incorrecte."); return; } setKeyInput(""); setShowSH(true); enterOwnerMode(); } catch { setKeyError("Connexion impossible."); } finally { setKeyBusy(false); } }}><label htmlFor="sh-key">Clé privée SH</label><input id="sh-key" type="password" autoComplete="current-password" value={keyInput} onChange={e => setKeyInput(e.target.value)} required style={{ display: "block", width: "100%", padding: 10, margin: "8px 0", background: "white", color: "#60462e", border: "1px solid #c99f7c", borderRadius: 8 }} /><button type="submit" disabled={keyBusy} style={{ padding: 10, background: "#9b6746", color: "white", borderRadius: 8 }}>SH — Ouvrir toutes les surprises</button>{keyError && <p role="alert">{keyError}</p>}<p><a href="/validation-sam">Générer un code</a></p></form>}
          {step === "gate" && <PhotoGate onComplete={() => go("letter")} />}
          {step === "letter" && <LetterScene onContinue={() => go("hub")} />}
          {step === "hub" && <SurpriseHub ownerMode={ownerMode} />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

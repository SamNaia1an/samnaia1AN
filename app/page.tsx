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
  const [authOpen, setAuthOpen] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keyError, setKeyError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSamEntry(params.get("sam") === "1");
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const key = fragment.get("sh") || params.get("sh");
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
      {authOpen && step==="gate" && <div className="camera-modal" style={{zIndex:100}}><form className="photo-card" onSubmit={async e=>{e.preventDefault();setKeyError("");try{const r=await fetch("/api/owner-mode",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key:keyInput})});if(!r.ok){setKeyError("Clé incorrecte.");return;}setKeyInput("");setAuthOpen(false);setShowSH(true);enterOwnerMode();}catch{setKeyError("Connexion impossible.");}}}><h2>SH</h2><label htmlFor="sh-key">Ta clé privée</label><input id="sh-key" type="password" required value={keyInput} onChange={e=>setKeyInput(e.target.value)} style={{display:"block",width:"100%",border:"1px solid var(--gold-soft)",padding:12,borderRadius:12,background:"var(--paper-2)"}}/><button className="gold-button" type="submit">Entrer ♡</button><button type="button" style={{display:"block",marginTop:12}} onClick={()=>setAuthOpen(false)}>Annuler</button>{keyError && <p className="error-text">{keyError}</p>}</form></div>}

      {(showSH || samEntry) && step === "gate" && (
        <motion.button
          type="button"
          className="sh-owner-button"
          onClick={() => showSH ? enterOwnerMode() : setAuthOpen(true)}
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
          {step === "gate" && <PhotoGate onComplete={() => go("letter")} onOwnerSkip={showSH ? enterOwnerMode : undefined} />}
          {step === "letter" && <LetterScene onContinue={() => go("hub")} />}
          {step === "hub" && <SurpriseHub ownerMode={ownerMode} />}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}

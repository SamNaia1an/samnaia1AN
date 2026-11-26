"use client";

import { useState } from "react";
import type { CSSProperties } from "react";

const panel: CSSProperties = { maxWidth: 430, margin: "auto", padding: 28, textAlign: "center", background: "#fff5e9", color: "#805637", border: "1px solid #d7b18a", borderRadius: 22, boxShadow: "0 10px 35px #76533922" };
const button: CSSProperties = { display: "block", width: "100%", boxSizing: "border-box", padding: "13px 12px", borderRadius: 12, border: 0, background: "#9b6746", color: "white", textDecoration: "none", font: "inherit", cursor: "pointer", margin: "12px 0" };
const input: CSSProperties = { width: "100%", boxSizing: "border-box", padding: 12, border: "1px solid #c99f7c", borderRadius: 10, textAlign: "center", fontSize: 22, letterSpacing: 5, background: "white", color: "#805637" };

export function PhotoGate({ onComplete }: { onComplete: () => void }) {
  const [id, setId] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [step, setStep] = useState<"photo" | "request">("photo");
  async function call(body: object) {
    const res = await fetch("/api/photo-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
    return data;
  }
  async function start() {
    setBusy(true); setMessage(""); setCode("");
    try { const data = await call({ action: "create" }); setId(data.id); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Réessaie."); }
    finally { setBusy(false); }
  }
  async function verify() {
    setBusy(true); setMessage("");
    try { const data = await call({ action: "verify", id, code }); if (data.ok) onComplete(); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Réessaie."); }
    finally { setBusy(false); }
  }
  const requestText = "Coucou ! Peux-tu m’envoyer le code de la surprise ? Référence : " + id;
  return <section style={panel}>
    <div style={{ fontSize: 32 }} aria-hidden="true">♡</div>
    <h1>Encore un petit secret…</h1>
    {step === "photo" ? <>
      <p>Si tu en as envie, prends une photo souvenir et partage-la avec Sam.</p>
      <label style={{ ...button, position: "relative" }}>Prendre une photo ♡
        <input aria-label="Prendre ou choisir une photo (facultatif)" type="file" accept="image/*" capture="user" style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", cursor: "pointer" }} onChange={e => { setPhoto(e.target.files?.[0] ?? null); setMessage(""); }} />
      </label>
      {photo && <><p>Photo choisie. Elle n’est pas envoyée au site.</p><button style={button} onClick={async () => {
        try {
          if (navigator.canShare?.({ files: [photo] })) {
            await navigator.share({ files: [photo] });
            setMessage("Partage terminé si tu as choisi de l’envoyer.");
          } else setMessage("Tu peux joindre la photo directement dans ton application de messagerie.");
        } catch { setMessage("Partage annulé ou indisponible."); }
      }}>Partager la photo (WhatsApp ou Messages)</button></>}
      <a style={button} href="https://wa.me/33638133297" target="_blank" rel="noopener noreferrer">Ouvrir la conversation de Sam</a>
      <button type="button" style={button} onClick={() => { setStep("request"); setPhoto(null); setMessage(""); }}>Demander un code ♡</button>
    </> : <>
      <p>Demande ton code à Sam, puis entre ses quatre chiffres.</p>
      {!id ? <button style={button} disabled={busy} onClick={start}>{busy ? "Un instant…" : "Créer ma demande de code"}</button> : <>
        <a style={button} href={"https://wa.me/33638133297?text="+encodeURIComponent(requestText)} target="_blank" rel="noopener noreferrer">Demander le code sur WhatsApp</a>
        <button style={button} type="button" onClick={async () => { try { await navigator.clipboard.writeText(requestText); setMessage("Demande copiée : colle-la dans Messages."); } catch { setMessage("Copie la référence affichée."); } }}>Copier la demande pour Messages</button>
        <p style={{ overflowWrap: "anywhere", fontSize: 12, userSelect: "all" }}>Référence : {id}</p>
        <form onSubmit={e => { e.preventDefault(); if (!busy && code.length === 4) void verify(); }}>
          <label htmlFor="gift-code">Code à 4 chiffres</label>
          <input id="gift-code" style={input} inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0,4))} placeholder="0000" maxLength={4} />
          <button style={button} disabled={busy || code.length!==4} type="submit">Valider ♡</button>
        </form>
        <button style={{ ...button, background:"transparent", color:"#805637" }} disabled={busy} onClick={start}>Nouvelle demande</button>
      </>}
    </>}
    {message && <p role="status">{message}</p>}
    <button type="button" style={{ ...button, background:"transparent", color:"#805637", border:"1px solid #c99f7c" }} onClick={onComplete}>Continuer sans photo ni code</button>
  </section>;
}

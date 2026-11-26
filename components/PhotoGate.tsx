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
  async function call(body: object) {
    const res = await fetch("/api/photo-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Une erreur est survenue.");
    return data;
  }
  async function start() {
    setBusy(true); setMessage(""); setCode(""); setPhoto(null);
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
  const whatsapp = id ? `https://wa.me/33638133297?text=${encodeURIComponent(`Coucou ! Voici ma référence pour le code de la surprise : ${id}`)}` : "";
  return (
    <section style={panel}>
      <div style={{ fontSize: 32 }} aria-hidden="true">♡</div>
      <h1>Encore un petit secret…</h1>
      <p>Un code à quatre chiffres t’attend pour découvrir la suite.</p>
      {!id ? <button style={button} disabled={busy} onClick={start}>{busy ? "Un instant…" : "Demander mon code ♡"}</button> : <>
        <p>Envoie ta référence à Sam pour qu’il puisse te donner ton code. Tu peux joindre une photo si tu en as envie, mais ce n’est pas nécessaire.</p>
        <p style={{ overflowWrap: "anywhere", fontSize: 13, userSelect: "all" }}>Référence : {id}</p>
        <a style={button} href={whatsapp} target="_blank" rel="noopener noreferrer">Envoyer ma référence sur WhatsApp</a>
        <details style={{ margin: "16px 0" }}>
          <summary>Ajouter une photo (facultatif)</summary>
          <p>La photo reste sur ton appareil tant que tu ne choisis pas de la partager.</p>
          <input aria-label="Prendre ou choisir une photo" type="file" accept="image/*" capture="user" onChange={e => setPhoto(e.target.files?.[0] ?? null)} />
          {photo && <button type="button" style={button} onClick={async () => {
            try {
              if (navigator.canShare?.({ files: [photo] })) {
                await navigator.share({ files: [photo], text: `Référence : ${id}` });
              } else {
                setMessage("Tu peux joindre une photo directement dans WhatsApp si tu le souhaites.");
              }
            } catch { setMessage("Partage non effectué. Tu peux continuer sans photo."); }
          }}>Partager la photo (choisir le destinataire)</button>}
        </details>
        <form onSubmit={e => { e.preventDefault(); if (!busy && code.length === 4) void verify(); }}>
          <label htmlFor="gift-code">Ton code à 4 chiffres</label>
          <input id="gift-code" style={input} inputMode="numeric" autoComplete="one-time-code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="0000" maxLength={4} />
          <button style={button} disabled={busy || code.length !== 4} type="submit">Valider ♡</button>
        </form>
        <button disabled={busy} type="button" style={{ background: "none", border: 0, color: "inherit", textDecoration: "underline", cursor: "pointer" }} onClick={start}>Nouvelle demande</button>
      </>}
      {message && <p role="alert">{message}</p>}
    </section>
  );
}

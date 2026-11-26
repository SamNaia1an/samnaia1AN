"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
const field: CSSProperties = { width: "100%", boxSizing: "border-box", padding: 12, margin: "8px 0 18px", border: "1px solid #b99172", borderRadius: 8, font: "inherit", background: "white", color: "#60462e" };

export default function ValidationSam() {
  const [id, setId] = useState("");
  useEffect(()=>{setId(new URLSearchParams(window.location.search).get("r") || "");},[]);
  const [adminKey, setAdminKey] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function generate() {
    setBusy(true); setMessage(""); setCode("");
    try {
      const res = await fetch("/api/photo-code", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "issue", id: id.trim(), adminKey }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur.");
      setCode(data.code);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Réessaie."); }
    finally { setBusy(false); }
  }
  return <main style={{ maxWidth: 460, margin: "40px auto", padding: 25, borderRadius: 20, background: "#fff5e9", color: "#805637" }}>
    <h1>Générer le code de la surprise</h1><p><a href="/?sam=1">Retour à ton accès SH</a></p>
    <p>Génère un code à transmettre à Naia si elle choisit de participer. Elle peut continuer sans photo ni code.</p>
    <form onSubmit={e => { e.preventDefault(); if (!busy) void generate(); }}>
      {!id && <p>Ouvre le lien de demande reçu dans ta conversation avec Naia.</p>}
      <label>Ta clé privée SH<input style={field} type="password" value={adminKey} onChange={e => setAdminKey(e.target.value)} required /></label>
      <button disabled={busy || !id} style={{ ...field, cursor: "pointer", color: "white", background: "#9b6746" }} type="submit">{busy ? "Génération…" : "Générer un nouveau code"}</button>
    </form>
    {code && <><p style={{ fontSize: 48, letterSpacing: 10, textAlign: "center", userSelect: "all" }}>{code}</p><p>Valable 10 minutes, une seule utilisation. Transmets-le directement à Naia.</p><button onClick={async () => { try { await navigator.clipboard.writeText(code); setMessage("Code copié."); } catch { setMessage("Sélectionne et copie le code affiché."); } }}>Copier le code</button></>}
    {message && <p role="status">{message}</p>}
  </main>;
}

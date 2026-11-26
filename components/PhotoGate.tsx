"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { recipientName } from "@/data/content";

type Props = { onComplete: () => void };

export function PhotoGate({ onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "checking" | "done">("idle");
  const [shared, setShared] = useState(false);
  const [codeStep, setCodeStep] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [shareError, setShareError] = useState("");

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  async function openCamera() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      }, 30);
    } catch {
      setError("La caméra n'a pas pu s'ouvrir. Vérifie l'autorisation dans ton navigateur.");
    }
  }

  function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const size = Math.min(video.videoWidth || 720, video.videoHeight || 720);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const sx = Math.max(0, ((video.videoWidth || size) - size) / 2);
    const sy = Math.max(0, ((video.videoHeight || size) - size) / 2);
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    setPhoto(canvas.toDataURL("image/jpeg", 0.9));
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setCameraOpen(false);
  }


  async function sharePhoto() {
    if (!photo) return;
    setShareError("");
    try {
      const blob = await (await fetch(photo)).blob();
      const file = new File([blob], "photo-identification-naia.jpg", { type: "image/jpeg" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Photo pour Sam ♡",
          text: "Pour toi ♡"
        });
        setShared(true);
        return;
      }

      // Repli pour les navigateurs qui ne savent pas partager un fichier directement.
      const a = document.createElement("a");
      a.href = photo;
      a.download = "photo-identification-naia.jpg";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setShareError("La photo a été enregistrée sur ton appareil. Tu peux la joindre à un message pour Sam si tu le souhaites.");
    } catch (err) {
      // Si l'utilisateur ferme la feuille de partage, on ne valide pas l'étape.
      setShareError("Le partage a été annulé ou n’est pas disponible. Tu peux continuer sans envoyer de photo.");
    }
  }

  async function verifyCode() {
    setBusy(true); setCodeError("");
    try {
      const r=await fetch("/api/photo-code",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code})});
      const d=await r.json();
      if(!r.ok || !d.ok) throw new Error(d.error || "Code incorrect.");
      validate();
    } catch(e){setCodeError(e instanceof Error ? e.message : "Réessaie.");}
    finally{setBusy(false);}
  }

  function validate() {
    setStatus("checking");
    setTimeout(() => {
      setStatus("done");
      setTimeout(onComplete, 1500);
    }, 1100);
  }

  return (
    <motion.section className="center-stage" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="eyebrow">27 novembre ♡</div>
      <h1 className="display-title">Une dernière petite vérification…</h1>
      <p className="soft-copy">La photo n’est pas stockée sur le site ; tu peux l’envoyer à Sam si tu le souhaites.</p>

      <motion.div className="photo-card" layout>
        <AnimatePresence mode="wait">
          {codeStep ? (
            <motion.div key="code" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              <div className="camera-icon">♡</div>
              <h2>Un dernier petit secret…</h2>
              {status === "idle" && <>
                <p>Demande le code à Sam, puis entre les quatre chiffres.</p>
                <a className="gold-button compact" style={{display:"inline-block",textDecoration:"none"}} href={"https://wa.me/33638133297?text="+encodeURIComponent("Coucou ! Peux-tu m’envoyer le code de la surprise ? ♡")} target="_blank" rel="noopener noreferrer">Demander le code à Sam ♡</a>
                <form onSubmit={e=>{e.preventDefault();if(!busy&&code.length===4)void verifyCode();}} style={{marginTop:18}}>
                  <label htmlFor="gift-code">Code à 4 chiffres</label>
                  <input id="gift-code" value={code} onChange={e=>{setCode(e.target.value.replace(/\D/g,"").slice(0,4));setCodeError("");}} inputMode="numeric" autoComplete="one-time-code" placeholder="0000" maxLength={4} style={{display:"block",width:"100%",padding:12,border:"1px solid var(--gold-soft)",borderRadius:14,textAlign:"center",letterSpacing:8,fontSize:24,background:"var(--paper-2)",marginTop:8}} />
                  <button className="gold-button" type="submit" disabled={busy||code.length!==4}>Valider ♡</button>
                </form>
                {codeError && <p className="error-text" role="alert">{codeError}</p>}
              </>}
              {status === "checking" && <div className="checking">Vérification en cours…</div>}
              {status === "done" && <motion.div className="success" initial={{scale:0.7,opacity:0}} animate={{scale:1,opacity:1}}><span>✓</span><strong>Bienvenue, {recipientName} ♡</strong></motion.div>}
            </motion.div>
          ) : !photo ? (
            <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="camera-icon">⌁</div>
              <h2>C'est bien toi ?</h2>
              <p>Une petite photo souvenir, si tu en as envie.</p>
              <button className="gold-button" onClick={openCamera}>M'identifier</button>
              {error && <p className="error-text">{error}</p>}
            </motion.div>
          ) : (
            <motion.div key="photo" initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <img src={photo} alt="Photo prise avec la caméra" className="selfie-preview" />
              {status === "idle" && (
                <>
                  <button className="gold-button" onClick={sharePhoto}>Envoyer la photo à Sam ♡</button>
                  <p className="soft-copy" style={{ marginTop: 10 }}>Choisis WhatsApp ou Messages, puis la conversation avec Sam.</p>
                  {shareError && <p className="error-text">{shareError}</p>}
                  {shareError && !shared && (
                    <button className="gold-button compact" onClick={() => setShared(true)}>J’ai terminé</button>
                  )}
                  {shared && (
                    <button className="gold-button" onClick={()=>{setPhoto(null);setCodeStep(true);}} style={{ marginTop: 12 }}>Continuer ♡</button>
                  )}
                </>
              )}
              {status === "checking" && <div className="checking">Identification en cours…</div>}
              {status === "done" && (
                <motion.div className="success" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <span>✓</span>
                  <strong>Bienvenue, {recipientName} ♡</strong>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {status === "idle" && <div style={{marginTop:16}}>{!codeStep && <button type="button" onClick={()=>{streamRef.current?.getTracks().forEach(t=>t.stop());setCameraOpen(false);setPhoto(null);setCodeStep(true);}} style={{color:"var(--muted)",textDecoration:"underline",background:"none",border:0,cursor:"pointer"}}>Continuer sans photo</button>}<button type="button" onClick={()=>{setPhoto(null);setCodeStep(true);validate();}} style={{display:"block",margin:"12px auto",color:"var(--muted)",textDecoration:"underline",background:"none",border:0,cursor:"pointer"}}>Passer le jeu et découvrir la suite</button></div>}

      <AnimatePresence>
        {cameraOpen && (
          <motion.div className="camera-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="camera-shell" initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }}>
              <video ref={videoRef} playsInline muted className="camera-video" />
              <div className="camera-actions">
                <button className="ghost-button" onClick={() => {
                  streamRef.current?.getTracks().forEach((t) => t.stop());
                  setCameraOpen(false);
                }}>Annuler</button>
                <button className="shutter" onClick={takePhoto} aria-label="Prendre la photo" />
                <span className="ghost-spacer" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <canvas ref={canvasRef} className="hidden-canvas" />
    </motion.section>
  );
}

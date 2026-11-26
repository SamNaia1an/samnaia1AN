"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { recipientName } from "@/data/content";

type Props = { onComplete: () => void; onOwnerSkip?: () => void };

export function PhotoGate({ onComplete, onOwnerSkip }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraRequest = useRef(0);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [shareFinished, setShareFinished] = useState(false);
  const [status, setStatus] = useState<"idle" | "checking" | "done">("idle");
  const [showHint, setShowHint] = useState(false);
  const [codeStep, setCodeStep] = useState(false);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [shareError, setShareError] = useState("");

  useEffect(() => () => { cameraRequest.current++; streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

  function continueToCode() {
    cameraRequest.current++;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraOpen(false);
    setPhoto(null);
    setCodeStep(true);
  }

  async function openCamera() {
    setError("");
    setCameraOpen(true);
    const request = ++cameraRequest.current;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false
      });
      if(request !== cameraRequest.current){stream.getTracks().forEach(t=>t.stop());return;}
      streamRef.current = stream;
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      }, 30);
    } catch {
      if(request !== cameraRequest.current)return;
      setError("La caméra n’a pas pu s’ouvrir. Tu peux continuer.");
      continueToCode();
    }
  }

  function takePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) return;
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
    setShareFinished(false);
    setShareError("");
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
        setShareFinished(true);
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
      // Le partage est volontaire et ne conditionne pas la suite.
      setShareError("Le partage a été annulé ou n’est pas disponible.");
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
      {!codeStep && !cameraOpen && status === "idle" && <button type="button" onClick={continueToCode} style={{position:"absolute",top:"max(12px, env(safe-area-inset-top))",left:"max(12px, env(safe-area-inset-left))",zIndex:10,minHeight:44,padding:"6px 8px",fontSize:14,fontWeight:500,background:"rgba(255,250,241,.95)",border:"1px solid var(--gold-soft)",borderRadius:12,color:"var(--ink)",cursor:"pointer",textDecoration:"underline"}}>Passer la photo</button>}
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
                <p>Entre les quatre chiffres du code de la surprise.</p>
                <a className="gold-button compact" style={{display:"inline-block",textDecoration:"none"}} href={"https://wa.me/33638133297?text="+encodeURIComponent("Coucou ! Peux-tu m’envoyer le code de la surprise ? ♡")} target="_blank" rel="noopener noreferrer">Demander le code à Sam ♡</a>
                <form onSubmit={e=>{e.preventDefault();if(!busy&&code.length===4)void verifyCode();}} style={{marginTop:18}}>
                  <label htmlFor="gift-code">Code à 4 chiffres</label>
                  <input id="gift-code" value={code} onChange={e=>{setCode(e.target.value.replace(/\D/g,"").slice(0,4));setCodeError("");}} inputMode="numeric" autoComplete="one-time-code" placeholder="0000" maxLength={4} style={{display:"block",width:"100%",padding:12,border:"1px solid var(--gold-soft)",borderRadius:14,textAlign:"center",letterSpacing:8,fontSize:24,background:"var(--paper-2)",marginTop:8}} />
                  <button className="gold-button" type="submit" disabled={busy||code.length!==4}>Valider ♡</button>
                </form>
                <button type="button" onClick={()=>setShowHint(!showHint)} style={{marginTop:12,background:"none",border:0,color:"var(--muted)",textDecoration:"underline",cursor:"pointer"}}>Un indice ?</button>
                {showHint && <p role="status">Le code du jeu est 2711.</p>}
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
                  {shareFinished && <button className="gold-button" onClick={continueToCode} style={{ marginTop: 12 }}>Continuer ♡</button>}
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
      {onOwnerSkip && status === "idle" && <button className="gold-button compact" onClick={onOwnerSkip} style={{marginTop:18}}>Passer le jeu et découvrir la suite</button>}

      <AnimatePresence>
        {cameraOpen && (
          <motion.div className="camera-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="camera-shell" initial={{ y: 20, scale: 0.95 }} animate={{ y: 0, scale: 1 }}>
              <video ref={videoRef} playsInline muted className="camera-video" />
              <div className="camera-actions">
                <button className="ghost-button" onClick={continueToCode} aria-label="Annuler la photo et accéder au code">Annuler</button>
                <button className="shutter" onClick={takePhoto} aria-label="Prendre la photo" />
                <span className="ghost-spacer" />
              </div>
              <p style={{color:"#fff",textAlign:"center",fontSize:13,margin:"0 12px 14px"}}>Photo facultative : Annuler permet d’accéder au code.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <canvas ref={canvasRef} className="hidden-canvas" />
    </motion.section>
  );
}

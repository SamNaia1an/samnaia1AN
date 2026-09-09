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
      setShareError("Ton navigateur ne peut pas ouvrir directement le partage. La photo a été enregistrée : envoie-la à Sam sur WhatsApp ou Messages, puis appuie sur « J’ai envoyé ».");
    } catch (err) {
      // Si l'utilisateur ferme la feuille de partage, on ne valide pas l'étape.
      setShareError("Le partage n’a pas été terminé. Appuie de nouveau sur le bouton et choisis WhatsApp ou Messages.");
    }
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
      <p className="soft-copy">La photo n’est pas stockée sur le site ; tu pourras l’envoyer à Sam.</p>

      <motion.div className="photo-card" layout>
        <AnimatePresence mode="wait">
          {!photo ? (
            <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="camera-icon">⌁</div>
              <h2>C'est bien toi ?</h2>
              <p>Une petite photo et la surprise peut commencer.</p>
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
                    <button className="ghost-button" onClick={() => setShared(true)}>J’ai envoyé</button>
                  )}
                  {shared && (
                    <button className="gold-button" onClick={validate} style={{ marginTop: 12 }}>Continuer ♡</button>
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

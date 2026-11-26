"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { surprises, Surprise } from "@/data/surprises";
import { UnlockCard } from "./UnlockCard";
import { FlowersSurprise } from "./FlowersSurprise";
import { BookSurprise } from "./BookSurprise";

function useServerClock() {
  const [now, setNow] = useState(new Date(0));
  const anchor = useRef<{ server: number; local: number } | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    let syncTimer: ReturnType<typeof setInterval>;

    const sync = async () => {
      try {
        const res = await fetch("/api/time", { cache: "no-store" });
        const data = await res.json();
        const server = new Date(data.now).getTime();
        if (!res.ok || !Number.isFinite(server)) throw new Error("Horloge indisponible");
        anchor.current = { server, local: Date.now() };
        setNow(new Date(anchor.current.server));
      } catch {
        // Preserve the last verified server clock during a transient network failure.
        if (anchor.current) setNow(new Date(anchor.current.server + (Date.now() - anchor.current.local)));
      }
    };

    void sync();
    timer = setInterval(() => {
      if (!anchor.current) return;
      setNow(new Date(anchor.current.server + (Date.now() - anchor.current.local)));
    }, 1000);
    syncTimer = setInterval(sync, 60_000);

    return () => {
      clearInterval(timer);
      clearInterval(syncTimer);
    };
  }, []);

  return now;
}

export function SurpriseHub({ ownerMode = false }: { ownerMode?: boolean }) {
  const now = useServerClock();
  const [active, setActive] = useState<Surprise | null>(null);

  return (
    <section className="hub-stage">
      <motion.div className="hub-heading" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <div className="eyebrow">Une journée rien que pour toi</div>
        <h1 className="display-title">La journée n&apos;est pas encore terminée… ♡</h1>
        <p className="soft-copy">
          {ownerMode ? "Mode Sam : toutes les surprises sont disponibles." : "Chaque petite carte s'ouvrira au bon moment."}
        </p>
      </motion.div>

      <div className="avatar-pair" aria-hidden="true">
        <motion.img src="/assets/naia.png" alt="" initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} />
        <motion.img src="/assets/sam.png" alt="" initial={{ x: 12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} />
      </div>

      <div className="unlock-grid">
        {surprises.map((s) => (
          <UnlockCard
            key={s.id}
            surprise={s}
            now={now}
            forceUnlocked={ownerMode}
            onOpen={() => setActive(s)}
          />
        ))}
      </div>

      <div className="tiny-footer">Fait avec beaucoup trop d&apos;amour par Sam. ♡</div>

      <AnimatePresence>
        {active?.kind === "flowers" && <FlowersSurprise onClose={() => setActive(null)} />}
        {active?.kind === "book" && <BookSurprise onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
}

"use client";

export function Countdown({ target, now }: { target: Date; now: Date }) {
  const diff = Math.max(0, target.getTime() - now.getTime());
  const s = Math.floor(diff / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return <span>{pad(h)}:{pad(m)}:{pad(sec)}</span>;
}

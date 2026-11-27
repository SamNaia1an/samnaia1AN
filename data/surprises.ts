export type SurpriseKind = "flowers" | "book";

export type Surprise = {
  id: string;
  title: string;
  subtitle: string;
  unlockAt: string;
  kind: SurpriseKind;
};

export const surprises: Surprise[] = [
  {
    id: "flowers",
    title: "Une première surprise…",
    subtitle: "Quelque chose t'attend ♡",
    unlockAt: "2026-11-27T16:35:00+01:00",
    kind: "flowers"
  },
  {
    id: "book",
    title: "Ton cadeau",
    subtitle: "Le dernier petit secret de la journée ♡",
    unlockAt: "2026-12-08T17:00:00+01:00",
    kind: "book"
  }
];

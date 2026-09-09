export type SurpriseKind = "flowers" | "book";

export type Surprise = {
  id: string;
  title: string;
  subtitle: string;
  unlockAt: string;
  kind: SurpriseKind;
};

// 27 novembre 2026, heure de Paris.
// Le 27 novembre, Paris est à UTC+1.
export const surprises: Surprise[] = [
  {
    id: "flowers",
    title: "Une première surprise…",
    subtitle: "Quelque chose t'attend ♡",
    unlockAt: "2026-11-27T07:35:00+01:00",
    kind: "flowers"
  },
  {
    id: "book",
    title: "Ton cadeau",
    subtitle: "Le dernier petit secret de la journée ♡",
    unlockAt: "2026-11-27T15:00:00+01:00",
    kind: "book"
  }
];

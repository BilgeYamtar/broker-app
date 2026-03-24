export const classificationSocieties = [
  "DNV GL",
  "Lloyd's Register",
  "Bureau Veritas",
  "ABS",
  "ClassNK",
  "Korean Register",
  "RINA",
  "CCS",
] as const;

export type ClassificationSociety = (typeof classificationSocieties)[number];

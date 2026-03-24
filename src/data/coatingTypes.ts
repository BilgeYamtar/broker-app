export const coatingTypes = [
  "Stainless Steel",
  "Epoxy",
  "Zinc Silicate",
  "Phenolic Epoxy",
] as const;

export type CoatingType = (typeof coatingTypes)[number];

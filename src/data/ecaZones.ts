export const ecaZones = [
  "North Sea",
  "Baltic",
  "North American Coast",
  "US Caribbean",
] as const;

export type EcaZone = (typeof ecaZones)[number];

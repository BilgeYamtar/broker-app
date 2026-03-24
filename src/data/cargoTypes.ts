export const cargoTypes = [
  "Liquid Bulk",
  "Dry Bulk",
  "Containerized",
  "Break Bulk",
  "Roll-on/Roll-off",
  "Refrigerated",
  "Gas",
] as const;

export type CargoType = (typeof cargoTypes)[number];

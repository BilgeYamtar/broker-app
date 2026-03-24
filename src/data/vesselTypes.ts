export const vesselTypes = [
  "Chemical Tanker",
  "Product Tanker",
  "Crude Oil Tanker",
  "Bulk Carrier",
  "General Cargo",
  "Container Vessel",
  "LPG Carrier",
  "LNG Carrier",
] as const;

export type VesselType = (typeof vesselTypes)[number];

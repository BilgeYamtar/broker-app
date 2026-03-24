export const hazardClasses = [
  "Non-Hazardous",
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
] as const;

export type HazardClass = (typeof hazardClasses)[number];

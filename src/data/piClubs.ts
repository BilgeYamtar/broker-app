export const piClubs = [
  "American Club",
  "Britannia",
  "Gard",
  "Japan P&I Club",
  "London P&I Club",
  "North P&I Club",
  "Shipowners' Club",
  "Skuld",
  "Standard Club",
  "Steamship Mutual",
  "Swedish Club",
  "UK P&I Club",
  "West P&I Club",
] as const;

export type PiClub = (typeof piClubs)[number];

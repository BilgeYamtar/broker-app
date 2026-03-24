import { z } from "zod";

const ftsStatusEnum = ["FTS", "NOT_FTS"] as const;
const flagColorEnum = ["green", "yellow", "red"] as const;

export const flagDetailSchema = z.object({
  dimension: z.string(),
  color: z.enum(flagColorEnum),
  message: z.string(),
});

export type FlagDetail = z.infer<typeof flagDetailSchema>;

export const flagsSchema = z.object({
  hullIntegrity: z.enum(flagColorEnum),
  thermal: z.enum(flagColorEnum),
  ecaCompliance: z.enum(flagColorEnum),
});

export type Flags = z.infer<typeof flagsSchema>;

export const feasibilityResultSchema = z.object({
  id: z.string().uuid(),
  vesselId: z.string().uuid(),
  cargoId: z.string().uuid(),
  overallScore: z.number().min(0).max(100),
  hullIntegrityScore: z.number().min(0).max(100),
  thermalScore: z.number().min(0).max(100),
  ecaComplianceScore: z.number().min(0).max(100),
  ftsStatus: z.enum(ftsStatusEnum),
  flags: flagsSchema,
  flagDetails: z.array(flagDetailSchema),
  isDemo: z.boolean(),
  createdAt: z.string(),
});

export type FeasibilityResult = z.infer<typeof feasibilityResultSchema>;

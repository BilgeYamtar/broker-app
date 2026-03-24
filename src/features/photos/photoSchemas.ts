import { z } from "zod";

export const photoSchema = z.object({
  id: z.string().uuid(),
  uri: z.string().min(1),
  vesselId: z.string().uuid().nullable(),
  brokerNoteId: z.string().uuid().nullable(),
  isDemo: z.boolean(),
  createdAt: z.string(),
});

export type Photo = z.infer<typeof photoSchema>;

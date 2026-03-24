import { z } from "zod";

export const brokerNoteSchema = z.object({
  id: z.string().uuid(),
  vesselId: z.string().uuid(),
  noteText: z.string().min(1),
  captainName: z.string().nullable(),
  sourceName: z.string().nullable(),
  isDemo: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type BrokerNote = z.infer<typeof brokerNoteSchema>;

export const brokerNoteFormSchema = z.object({
  vesselId: z.string().uuid(),
  noteText: z.string().min(1, "Not metni gerekli"),
  captainName: z.string().optional(),
  sourceName: z.string().optional(),
});

export type BrokerNoteFormData = z.infer<typeof brokerNoteFormSchema>;

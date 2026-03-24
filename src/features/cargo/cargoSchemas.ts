import { z } from "zod";
import { cargoTypes } from "@/data/cargoTypes";
import { hazardClasses } from "@/data/hazardClasses";

export const cargoSchema = z.object({
  id: z.string().uuid(),
  cargoName: z.string().min(1),
  cargoType: z.enum(cargoTypes),
  weightMt: z.number().positive(),
  volumeCbm: z.number().positive(),
  hazardClass: z.enum(hazardClasses),
  temperatureControl: z.boolean(),
  ventilation: z.boolean(),
  isDemo: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Cargo = z.infer<typeof cargoSchema>;

export const cargoFormSchema = z.object({
  cargoName: z.string().min(1, "Yük adı gerekli"),
  cargoType: z.enum(cargoTypes),
  weightMt: z.number().positive("Ağırlık pozitif olmalı"),
  volumeCbm: z.number().positive("Hacim pozitif olmalı"),
  hazardClass: z.enum(hazardClasses),
  temperatureControl: z.boolean().optional().default(false),
  ventilation: z.boolean().optional().default(false),
});

export type CargoFormData = z.infer<typeof cargoFormSchema>;

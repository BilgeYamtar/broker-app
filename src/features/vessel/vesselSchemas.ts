import { z } from "zod";
import { classificationSocieties } from "@/data/classificationSocieties";
import { piClubs } from "@/data/piClubs";
import { vesselTypes } from "@/data/vesselTypes";
import { coatingTypes } from "@/data/coatingTypes";

export const vesselSchema = z.object({
  id: z.string().uuid(),
  vesselName: z.string().min(1),
  imoNumber: z.string().min(1),
  builtYear: z.number().int().min(1900).max(2100),
  dwtCapacity: z.number().positive(),
  lengthM: z.number().positive(),
  beamM: z.number().positive(),
  depthM: z.number().positive(),
  grossTonnage: z.number().nonnegative(),
  netTonnage: z.number().nonnegative(),
  classificationSociety: z.enum(classificationSocieties),
  piClub: z.enum(piClubs),
  vesselType: z.enum(vesselTypes),
  coatingType: z.enum(coatingTypes),
  flag: z.string().nullable(),
  isActive: z.boolean(),
  isDemo: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Vessel = z.infer<typeof vesselSchema>;

export const vesselFormSchema = z.object({
  vesselName: z.string().min(1, "Gemi adı gerekli"),
  imoNumber: z.string().min(1, "IMO numarası gerekli"),
  builtYear: z.number({ error: "Yapım yılı gerekli" }).int().min(1900, "Yapım yılı 1900'den büyük olmalı").max(2100, "Geçersiz yapım yılı"),
  dwtCapacity: z.number({ error: "DWT kapasitesi gerekli" }).positive("DWT kapasitesi pozitif olmalı"),
  lengthM: z.number({ error: "Uzunluk gerekli" }).positive("Uzunluk pozitif olmalı"),
  beamM: z.number({ error: "Genişlik gerekli" }).positive("Genişlik pozitif olmalı"),
  depthM: z.number({ error: "Derinlik gerekli" }).positive("Derinlik pozitif olmalı"),
  grossTonnage: z.number().nonnegative(),
  netTonnage: z.number().nonnegative(),
  classificationSociety: z.enum(classificationSocieties),
  piClub: z.enum(piClubs),
  vesselType: z.enum(vesselTypes),
  coatingType: z.enum(coatingTypes),
  flag: z.string().nullable().optional(),
});

export type VesselFormData = z.infer<typeof vesselFormSchema>;

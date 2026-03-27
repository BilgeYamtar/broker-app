import { getDatabase } from "@/lib/database";
import type { Result } from "@/lib/result";
import {
  vesselFormSchema,
  type Vessel,
  type VesselFormData,
} from "./vesselSchemas";

interface VesselRow {
  id: string;
  vessel_name: string;
  imo_number: string;
  built_year: number;
  dwt_capacity: number;
  length_m: number;
  beam_m: number;
  depth_m: number;
  gross_tonnage: number;
  net_tonnage: number;
  classification_society: string;
  pi_club: string;
  vessel_type: string;
  coating_type: string;
  is_active: number;
  is_demo: number;
  created_at: string;
  updated_at: string;
}

function rowToVessel(row: VesselRow): Vessel {
  return {
    id: row.id,
    vesselName: row.vessel_name,
    imoNumber: row.imo_number,
    builtYear: row.built_year,
    dwtCapacity: row.dwt_capacity,
    lengthM: row.length_m,
    beamM: row.beam_m,
    depthM: row.depth_m,
    grossTonnage: row.gross_tonnage,
    netTonnage: row.net_tonnage,
    classificationSociety:
      row.classification_society as Vessel["classificationSociety"],
    piClub: row.pi_club as Vessel["piClub"],
    vesselType: row.vessel_type as Vessel["vesselType"],
    coatingType: row.coating_type as Vessel["coatingType"],
    isActive: row.is_active === 1,
    isDemo: row.is_demo === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createVessel(
  data: VesselFormData,
  isDemo = false
): Promise<Result<Vessel>> {
  const parsed = vesselFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  try {
    const db = getDatabase();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const d = parsed.data;

    await db.runAsync(
      `INSERT INTO vessels (id, vessel_name, imo_number, built_year, dwt_capacity, length_m, beam_m, depth_m, gross_tonnage, net_tonnage, classification_society, pi_club, vessel_type, coating_type, is_active, is_demo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, d.vesselName, d.imoNumber, d.builtYear, d.dwtCapacity, d.lengthM, d.beamM, d.depthM, d.grossTonnage, d.netTonnage, d.classificationSociety, d.piClub, d.vesselType, d.coatingType, 1, isDemo ? 1 : 0, now, now]
    );

    const vessel: Vessel = {
      id,
      vesselName: d.vesselName,
      imoNumber: d.imoNumber,
      builtYear: d.builtYear,
      dwtCapacity: d.dwtCapacity,
      lengthM: d.lengthM,
      beamM: d.beamM,
      depthM: d.depthM,
      grossTonnage: d.grossTonnage,
      netTonnage: d.netTonnage,
      classificationSociety: d.classificationSociety,
      piClub: d.piClub,
      vesselType: d.vesselType,
      coatingType: d.coatingType,
      isActive: true,
      isDemo: isDemo,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: vessel };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create vessel",
    };
  }
}

export async function getVesselById(id: string): Promise<Result<Vessel>> {
  try {
    const db = getDatabase();
    const row = await db.getFirstAsync<VesselRow>(
      "SELECT * FROM vessels WHERE id = ?",
      [id]
    );

    if (!row) {
      return { success: false, error: "Vessel not found" };
    }

    return { success: true, data: rowToVessel(row) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get vessel",
    };
  }
}

export async function getAllVessels(): Promise<Result<Vessel[]>> {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync<VesselRow>(
      "SELECT * FROM vessels ORDER BY updated_at DESC"
    );

    return { success: true, data: rows.map(rowToVessel) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get vessels",
    };
  }
}

export async function updateVessel(
  id: string,
  data: VesselFormData
): Promise<Result<Vessel>> {
  const parsed = vesselFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    const d = parsed.data;

    const result = await db.runAsync(
      `UPDATE vessels SET vessel_name = ?, imo_number = ?, built_year = ?, dwt_capacity = ?, length_m = ?, beam_m = ?, depth_m = ?, gross_tonnage = ?, net_tonnage = ?, classification_society = ?, pi_club = ?, vessel_type = ?, coating_type = ?, updated_at = ?
       WHERE id = ?`,
      [d.vesselName, d.imoNumber, d.builtYear, d.dwtCapacity, d.lengthM, d.beamM, d.depthM, d.grossTonnage, d.netTonnage, d.classificationSociety, d.piClub, d.vesselType, d.coatingType, now, id]
    );

    if (result.changes === 0) {
      return { success: false, error: "Vessel not found" };
    }

    const getResult = await getVesselById(id);
    if (!getResult.success) {
      return getResult;
    }

    return { success: true, data: getResult.data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update vessel",
    };
  }
}

export async function deleteVessel(id: string): Promise<Result<void>> {
  try {
    const db = getDatabase();
    const result = await db.runAsync(
      "DELETE FROM vessels WHERE id = ?",
      [id]
    );

    if (result.changes === 0) {
      return { success: false, error: "Vessel not found" };
    }

    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete vessel",
    };
  }
}

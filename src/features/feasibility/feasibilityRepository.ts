import { getDatabase } from "@/lib/database";
import type { Result } from "@/lib/result";
import { generateUUID } from "@/utils/uuid";
import type {
  FeasibilityResult,
  Flags,
  FlagDetail,
} from "./feasibilitySchemas";

interface FeasibilityRow {
  id: string;
  vessel_id: string;
  cargo_id: string;
  overall_score: number;
  hull_integrity_score: number;
  thermal_score: number;
  eca_compliance_score: number;
  fts_status: string;
  flags: string;
  flag_details: string;
  is_demo: number;
  created_at: string;
}

function rowToResult(row: FeasibilityRow): FeasibilityResult {
  return {
    id: row.id,
    vesselId: row.vessel_id,
    cargoId: row.cargo_id,
    overallScore: row.overall_score,
    hullIntegrityScore: row.hull_integrity_score,
    thermalScore: row.thermal_score,
    ecaComplianceScore: row.eca_compliance_score,
    ftsStatus: row.fts_status as FeasibilityResult["ftsStatus"],
    flags: JSON.parse(row.flags) as Flags,
    flagDetails: JSON.parse(row.flag_details) as FlagDetail[],
    isDemo: row.is_demo === 1,
    createdAt: row.created_at,
  };
}

export async function create(
  data: Omit<FeasibilityResult, "id" | "createdAt">,
  isDemo = false
): Promise<Result<FeasibilityResult>> {
  try {
    const db = getDatabase();
    const id = generateUUID();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO feasibility_results
        (id, vessel_id, cargo_id, overall_score, hull_integrity_score, thermal_score,
         eca_compliance_score, fts_status, flags, flag_details, is_demo, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.vesselId, data.cargoId, data.overallScore, data.hullIntegrityScore, data.thermalScore, data.ecaComplianceScore, data.ftsStatus, JSON.stringify(data.flags), JSON.stringify(data.flagDetails), isDemo ? 1 : 0, now]
    );

    const result: FeasibilityResult = {
      ...data,
      id,
      isDemo,
      createdAt: now,
    };

    return { success: true, data: result };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to save feasibility result",
    };
  }
}

export async function getById(
  id: string
): Promise<Result<FeasibilityResult>> {
  try {
    const db = getDatabase();
    const row = await db.getFirstAsync<FeasibilityRow>(
      "SELECT * FROM feasibility_results WHERE id = ?",
      [id]
    );

    if (!row) {
      return { success: false, error: "Feasibility result not found" };
    }

    return { success: true, data: rowToResult(row) };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to get feasibility result",
    };
  }
}

export async function getAll(): Promise<Result<FeasibilityResult[]>> {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync<FeasibilityRow>(
      "SELECT * FROM feasibility_results ORDER BY created_at DESC"
    );

    return { success: true, data: rows.map(rowToResult) };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to get feasibility results",
    };
  }
}

export async function getByVesselId(
  vesselId: string
): Promise<Result<FeasibilityResult[]>> {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync<FeasibilityRow>(
      "SELECT * FROM feasibility_results WHERE vessel_id = ? ORDER BY created_at DESC",
      [vesselId]
    );

    return { success: true, data: rows.map(rowToResult) };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to get feasibility results",
    };
  }
}

export async function getByCargoId(
  cargoId: string
): Promise<Result<FeasibilityResult[]>> {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync<FeasibilityRow>(
      "SELECT * FROM feasibility_results WHERE cargo_id = ? ORDER BY created_at DESC",
      [cargoId]
    );

    return { success: true, data: rows.map(rowToResult) };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error
          ? err.message
          : "Failed to get feasibility results",
    };
  }
}

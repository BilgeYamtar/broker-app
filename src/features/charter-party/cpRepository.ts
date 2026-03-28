import { getDatabase } from "@/lib/database";
import type { Result } from "@/lib/result";
import { generateUUID } from "@/utils/uuid";
import type { CpStatus } from "@/data/charterPartyTemplates";

export interface SavedCharterParty {
  id: string;
  templateId: string;
  title: string;
  status: CpStatus;
  vesselId: string | null;
  cargoId: string | null;
  fieldData: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface CpRow {
  id: string;
  template_id: string;
  title: string;
  status: string;
  vessel_id: string | null;
  cargo_id: string | null;
  field_data: string;
  created_at: string;
  updated_at: string;
}

function rowToCp(row: CpRow): SavedCharterParty {
  return {
    id: row.id,
    templateId: row.template_id,
    title: row.title,
    status: row.status as CpStatus,
    vesselId: row.vessel_id,
    cargoId: row.cargo_id,
    fieldData: JSON.parse(row.field_data),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface CreateCpData {
  templateId: string;
  title: string;
  status?: CpStatus;
  vesselId?: string | null;
  cargoId?: string | null;
  fieldData: Record<string, string>;
}

export async function createCharterParty(
  data: CreateCpData
): Promise<Result<SavedCharterParty>> {
  try {
    const db = getDatabase();
    const id = generateUUID();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO charter_parties (id, template_id, title, status, vessel_id, cargo_id, field_data, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.templateId,
        data.title,
        data.status ?? "draft",
        data.vesselId ?? null,
        data.cargoId ?? null,
        JSON.stringify(data.fieldData),
        now,
        now,
      ]
    );

    const cp: SavedCharterParty = {
      id,
      templateId: data.templateId,
      title: data.title,
      status: data.status ?? "draft",
      vesselId: data.vesselId ?? null,
      cargoId: data.cargoId ?? null,
      fieldData: data.fieldData,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: cp };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create charter party",
    };
  }
}

export async function updateCharterParty(
  id: string,
  data: Partial<CreateCpData>
): Promise<Result<SavedCharterParty>> {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();

    const existing = await db.getFirstAsync<CpRow>(
      "SELECT * FROM charter_parties WHERE id = ?",
      [id]
    );
    if (!existing) {
      return { success: false, error: "Charter party not found" };
    }

    const fieldData = data.fieldData ?? JSON.parse(existing.field_data);

    await db.runAsync(
      `UPDATE charter_parties SET title = ?, status = ?, vessel_id = ?, cargo_id = ?, field_data = ?, updated_at = ?
       WHERE id = ?`,
      [
        data.title ?? existing.title,
        data.status ?? existing.status,
        data.vesselId !== undefined ? data.vesselId : existing.vessel_id,
        data.cargoId !== undefined ? data.cargoId : existing.cargo_id,
        JSON.stringify(fieldData),
        now,
        id,
      ]
    );

    return getCpById(id);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update charter party",
    };
  }
}

export async function getCpById(
  id: string
): Promise<Result<SavedCharterParty>> {
  try {
    const db = getDatabase();
    const row = await db.getFirstAsync<CpRow>(
      "SELECT * FROM charter_parties WHERE id = ?",
      [id]
    );

    if (!row) {
      return { success: false, error: "Charter party not found" };
    }

    return { success: true, data: rowToCp(row) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get charter party",
    };
  }
}

export async function getAllCharterParties(): Promise<Result<SavedCharterParty[]>> {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync<CpRow>(
      "SELECT * FROM charter_parties ORDER BY updated_at DESC"
    );

    return { success: true, data: rows.map(rowToCp) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get charter parties",
    };
  }
}

export async function deleteCharterParty(id: string): Promise<Result<void>> {
  try {
    const db = getDatabase();
    const result = await db.runAsync(
      "DELETE FROM charter_parties WHERE id = ?",
      [id]
    );

    if (result.changes === 0) {
      return { success: false, error: "Charter party not found" };
    }

    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete charter party",
    };
  }
}

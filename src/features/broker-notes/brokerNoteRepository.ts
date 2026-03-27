import { getDatabase } from "@/lib/database";
import type { Result } from "@/lib/result";
import {
  brokerNoteFormSchema,
  type BrokerNote,
  type BrokerNoteFormData,
} from "./brokerNoteSchemas";

interface BrokerNoteRow {
  id: string;
  vessel_id: string;
  note_text: string;
  captain_name: string | null;
  source_name: string | null;
  is_demo: number;
  created_at: string;
  updated_at: string;
}

function rowToNote(row: BrokerNoteRow): BrokerNote {
  return {
    id: row.id,
    vesselId: row.vessel_id,
    noteText: row.note_text,
    captainName: row.captain_name,
    sourceName: row.source_name,
    isDemo: row.is_demo === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createBrokerNote(
  data: BrokerNoteFormData,
  isDemo = false
): Promise<Result<BrokerNote>> {
  const parsed = brokerNoteFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  try {
    const db = getDatabase();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const d = parsed.data;

    await db.runAsync(
      `INSERT INTO broker_notes (id, vessel_id, note_text, captain_name, source_name, is_demo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, d.vesselId, d.noteText, d.captainName ?? null, d.sourceName ?? null, isDemo ? 1 : 0, now, now]
    );

    const note: BrokerNote = {
      id,
      vesselId: d.vesselId,
      noteText: d.noteText,
      captainName: d.captainName ?? null,
      sourceName: d.sourceName ?? null,
      isDemo: isDemo,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: note };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to create broker note",
    };
  }
}

export async function getBrokerNoteById(
  id: string
): Promise<Result<BrokerNote>> {
  try {
    const db = getDatabase();
    const row = await db.getFirstAsync<BrokerNoteRow>(
      "SELECT * FROM broker_notes WHERE id = ?",
      [id]
    );

    if (!row) {
      return { success: false, error: "Broker note not found" };
    }

    return { success: true, data: rowToNote(row) };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to get broker note",
    };
  }
}

export async function getByVesselId(
  vesselId: string
): Promise<Result<BrokerNote[]>> {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync<BrokerNoteRow>(
      "SELECT * FROM broker_notes WHERE vessel_id = ? ORDER BY updated_at DESC",
      [vesselId]
    );

    return { success: true, data: rows.map(rowToNote) };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to get broker notes",
    };
  }
}

export async function getAllBrokerNotes(): Promise<Result<BrokerNote[]>> {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync<BrokerNoteRow>(
      "SELECT * FROM broker_notes ORDER BY updated_at DESC"
    );

    return { success: true, data: rows.map(rowToNote) };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to get broker notes",
    };
  }
}

export async function updateBrokerNote(
  id: string,
  data: BrokerNoteFormData
): Promise<Result<BrokerNote>> {
  const parsed = brokerNoteFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    const d = parsed.data;

    const result = await db.runAsync(
      `UPDATE broker_notes SET note_text = ?, captain_name = ?, source_name = ?, updated_at = ?
       WHERE id = ?`,
      [d.noteText, d.captainName ?? null, d.sourceName ?? null, now, id]
    );

    if (result.changes === 0) {
      return { success: false, error: "Broker note not found" };
    }

    const getResult = await getBrokerNoteById(id);
    if (!getResult.success) {
      return getResult;
    }

    return { success: true, data: getResult.data };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to update broker note",
    };
  }
}

export async function deleteBrokerNote(id: string): Promise<Result<void>> {
  try {
    const db = getDatabase();
    const result = await db.runAsync(
      "DELETE FROM broker_notes WHERE id = ?",
      [id]
    );

    if (result.changes === 0) {
      return { success: false, error: "Broker note not found" };
    }

    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Failed to delete broker note",
    };
  }
}

import { getDatabase } from "@/lib/database";
import type { Result } from "@/lib/result";
import type { Photo } from "./photoSchemas";
import { deletePhotoFile } from "@/utils/photoUtils";

interface PhotoRow {
  id: string;
  uri: string;
  vessel_id: string | null;
  broker_note_id: string | null;
  is_demo: number;
  created_at: string;
}

function rowToPhoto(row: PhotoRow): Photo {
  return {
    id: row.id,
    uri: row.uri,
    vesselId: row.vessel_id,
    brokerNoteId: row.broker_note_id,
    isDemo: row.is_demo === 1,
    createdAt: row.created_at,
  };
}

export async function createPhoto(params: {
  uri: string;
  vesselId?: string | null;
  brokerNoteId?: string | null;
  isDemo?: boolean;
}): Promise<Result<Photo>> {
  try {
    const db = await getDatabase();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO photos (id, uri, vessel_id, broker_note_id, is_demo, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      id,
      params.uri,
      params.vesselId ?? null,
      params.brokerNoteId ?? null,
      params.isDemo ? 1 : 0,
      now
    );

    const photo: Photo = {
      id,
      uri: params.uri,
      vesselId: params.vesselId ?? null,
      brokerNoteId: params.brokerNoteId ?? null,
      isDemo: params.isDemo ?? false,
      createdAt: now,
    };

    return { success: true, data: photo };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create photo",
    };
  }
}

export async function getPhotosByVesselId(
  vesselId: string
): Promise<Result<Photo[]>> {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<PhotoRow>(
      "SELECT * FROM photos WHERE vessel_id = ? ORDER BY created_at DESC",
      vesselId
    );

    return { success: true, data: rows.map(rowToPhoto) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get photos",
    };
  }
}

export async function getPhotosByBrokerNoteId(
  brokerNoteId: string
): Promise<Result<Photo[]>> {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<PhotoRow>(
      "SELECT * FROM photos WHERE broker_note_id = ? ORDER BY created_at DESC",
      brokerNoteId
    );

    return { success: true, data: rows.map(rowToPhoto) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get photos",
    };
  }
}

export async function getAllPhotosForVessel(
  vesselId: string
): Promise<Result<Photo[]>> {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<PhotoRow>(
      `SELECT p.* FROM photos p
       WHERE p.vessel_id = ?
       UNION ALL
       SELECT p.* FROM photos p
       INNER JOIN broker_notes bn ON p.broker_note_id = bn.id
       WHERE bn.vessel_id = ?
       ORDER BY created_at DESC`,
      vesselId,
      vesselId
    );

    return { success: true, data: rows.map(rowToPhoto) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get photos",
    };
  }
}

export async function deletePhoto(id: string): Promise<Result<void>> {
  try {
    const db = await getDatabase();

    // Fetch URI first so we can delete the file
    const row = await db.getFirstAsync<PhotoRow>(
      "SELECT * FROM photos WHERE id = ?",
      id
    );

    if (!row) {
      return { success: false, error: "Photo not found" };
    }

    await db.runAsync("DELETE FROM photos WHERE id = ?", id);

    // Best-effort file cleanup
    deletePhotoFile(row.uri);

    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete photo",
    };
  }
}

import { getDatabase } from "@/lib/database";
import type { Result } from "@/lib/result";
import { generateUUID } from "@/utils/uuid";

export interface SavedDocument {
  id: string;
  templateId: string;
  title: string;
  vesselId: string | null;
  cargoId: string | null;
  fieldData: Record<string, string>;
  checklistData: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

interface DocumentRow {
  id: string;
  template_id: string;
  title: string;
  vessel_id: string | null;
  cargo_id: string | null;
  field_data: string;
  checklist_data: string;
  created_at: string;
  updated_at: string;
}

function rowToDocument(row: DocumentRow): SavedDocument {
  return {
    id: row.id,
    templateId: row.template_id,
    title: row.title,
    vesselId: row.vessel_id,
    cargoId: row.cargo_id,
    fieldData: JSON.parse(row.field_data),
    checklistData: JSON.parse(row.checklist_data),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface CreateDocumentData {
  templateId: string;
  title: string;
  vesselId?: string | null;
  cargoId?: string | null;
  fieldData: Record<string, string>;
  checklistData: Record<string, boolean>;
}

export async function createDocument(
  data: CreateDocumentData
): Promise<Result<SavedDocument>> {
  try {
    const db = getDatabase();
    const id = generateUUID();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO documents (id, template_id, title, vessel_id, cargo_id, field_data, checklist_data, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.templateId,
        data.title,
        data.vesselId ?? null,
        data.cargoId ?? null,
        JSON.stringify(data.fieldData),
        JSON.stringify(data.checklistData),
        now,
        now,
      ]
    );

    const doc: SavedDocument = {
      id,
      templateId: data.templateId,
      title: data.title,
      vesselId: data.vesselId ?? null,
      cargoId: data.cargoId ?? null,
      fieldData: data.fieldData,
      checklistData: data.checklistData,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: doc };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create document",
    };
  }
}

export async function updateDocument(
  id: string,
  data: Partial<CreateDocumentData>
): Promise<Result<SavedDocument>> {
  try {
    const db = getDatabase();
    const now = new Date().toISOString();

    const existing = await db.getFirstAsync<DocumentRow>(
      "SELECT * FROM documents WHERE id = ?",
      [id]
    );
    if (!existing) {
      return { success: false, error: "Document not found" };
    }

    const fieldData = data.fieldData ?? JSON.parse(existing.field_data);
    const checklistData = data.checklistData ?? JSON.parse(existing.checklist_data);

    await db.runAsync(
      `UPDATE documents SET title = ?, vessel_id = ?, cargo_id = ?, field_data = ?, checklist_data = ?, updated_at = ?
       WHERE id = ?`,
      [
        data.title ?? existing.title,
        data.vesselId !== undefined ? data.vesselId : existing.vessel_id,
        data.cargoId !== undefined ? data.cargoId : existing.cargo_id,
        JSON.stringify(fieldData),
        JSON.stringify(checklistData),
        now,
        id,
      ]
    );

    return getDocumentById(id);
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update document",
    };
  }
}

export async function getDocumentById(
  id: string
): Promise<Result<SavedDocument>> {
  try {
    const db = getDatabase();
    const row = await db.getFirstAsync<DocumentRow>(
      "SELECT * FROM documents WHERE id = ?",
      [id]
    );

    if (!row) {
      return { success: false, error: "Document not found" };
    }

    return { success: true, data: rowToDocument(row) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get document",
    };
  }
}

export async function getAllDocuments(): Promise<Result<SavedDocument[]>> {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync<DocumentRow>(
      "SELECT * FROM documents ORDER BY updated_at DESC"
    );

    return { success: true, data: rows.map(rowToDocument) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get documents",
    };
  }
}

export async function getDocumentsByTemplate(
  templateId: string
): Promise<Result<SavedDocument[]>> {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync<DocumentRow>(
      "SELECT * FROM documents WHERE template_id = ? ORDER BY updated_at DESC",
      [templateId]
    );

    return { success: true, data: rows.map(rowToDocument) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get documents",
    };
  }
}

export async function deleteDocument(id: string): Promise<Result<void>> {
  try {
    const db = getDatabase();
    const result = await db.runAsync(
      "DELETE FROM documents WHERE id = ?",
      [id]
    );

    if (result.changes === 0) {
      return { success: false, error: "Document not found" };
    }

    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete document",
    };
  }
}

import { getDatabase } from "@/lib/database";
import type { Result } from "@/lib/result";
import { cargoFormSchema, type Cargo, type CargoFormData } from "./cargoSchemas";

interface CargoRow {
  id: string;
  cargo_name: string;
  cargo_type: string;
  weight_mt: number;
  volume_cbm: number;
  hazard_class: string;
  temperature_control: number;
  ventilation: number;
  is_demo: number;
  created_at: string;
  updated_at: string;
}

function rowToCargo(row: CargoRow): Cargo {
  return {
    id: row.id,
    cargoName: row.cargo_name,
    cargoType: row.cargo_type as Cargo["cargoType"],
    weightMt: row.weight_mt,
    volumeCbm: row.volume_cbm,
    hazardClass: row.hazard_class as Cargo["hazardClass"],
    temperatureControl: row.temperature_control === 1,
    ventilation: row.ventilation === 1,
    isDemo: row.is_demo === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createCargo(
  data: CargoFormData,
  isDemo = false
): Promise<Result<Cargo>> {
  const parsed = cargoFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  try {
    const db = getDatabase();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const d = parsed.data;

    await db.runAsync(
      `INSERT INTO cargoes (id, cargo_name, cargo_type, weight_mt, volume_cbm, hazard_class, temperature_control, ventilation, is_demo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, d.cargoName, d.cargoType, d.weightMt, d.volumeCbm, d.hazardClass, d.temperatureControl ? 1 : 0, d.ventilation ? 1 : 0, isDemo ? 1 : 0, now, now]
    );

    const cargo: Cargo = {
      id,
      cargoName: d.cargoName,
      cargoType: d.cargoType,
      weightMt: d.weightMt,
      volumeCbm: d.volumeCbm,
      hazardClass: d.hazardClass,
      temperatureControl: d.temperatureControl ?? false,
      ventilation: d.ventilation ?? false,
      isDemo: isDemo,
      createdAt: now,
      updatedAt: now,
    };

    return { success: true, data: cargo };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to create cargo",
    };
  }
}

export async function getCargoById(id: string): Promise<Result<Cargo>> {
  try {
    const db = getDatabase();
    const row = await db.getFirstAsync<CargoRow>(
      "SELECT * FROM cargoes WHERE id = ?",
      [id]
    );

    if (!row) {
      return { success: false, error: "Cargo not found" };
    }

    return { success: true, data: rowToCargo(row) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get cargo",
    };
  }
}

export async function getAllCargoes(): Promise<Result<Cargo[]>> {
  try {
    const db = getDatabase();
    const rows = await db.getAllAsync<CargoRow>(
      "SELECT * FROM cargoes ORDER BY updated_at DESC"
    );

    return { success: true, data: rows.map(rowToCargo) };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to get cargoes",
    };
  }
}

export async function updateCargo(
  id: string,
  data: CargoFormData
): Promise<Result<Cargo>> {
  const parsed = cargoFormSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.message };
  }

  try {
    const db = getDatabase();
    const now = new Date().toISOString();
    const d = parsed.data;

    const result = await db.runAsync(
      `UPDATE cargoes SET cargo_name = ?, cargo_type = ?, weight_mt = ?, volume_cbm = ?, hazard_class = ?, temperature_control = ?, ventilation = ?, updated_at = ?
       WHERE id = ?`,
      [d.cargoName, d.cargoType, d.weightMt, d.volumeCbm, d.hazardClass, d.temperatureControl ? 1 : 0, d.ventilation ? 1 : 0, now, id]
    );

    if (result.changes === 0) {
      return { success: false, error: "Cargo not found" };
    }

    const getResult = await getCargoById(id);
    if (!getResult.success) {
      return getResult;
    }

    return { success: true, data: getResult.data };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update cargo",
    };
  }
}

export async function deleteCargo(id: string): Promise<Result<void>> {
  try {
    const db = getDatabase();
    const result = await db.runAsync(
      "DELETE FROM cargoes WHERE id = ?",
      [id]
    );

    if (result.changes === 0) {
      return { success: false, error: "Cargo not found" };
    }

    return { success: true, data: undefined };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to delete cargo",
    };
  }
}

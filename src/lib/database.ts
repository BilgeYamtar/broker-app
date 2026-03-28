import * as SQLite from "expo-sqlite";
import { config } from "@/constants/config";

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Opens (or returns cached) the SQLite database.
 * Uses openDatabaseSync — reliable on iOS during early startup (SDK 55).
 * All DDL is executed synchronously to avoid async race conditions.
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (db) return db;

  db = SQLite.openDatabaseSync(config.SQLITE_DB_NAME);

  db.execSync("PRAGMA journal_mode = WAL;");
  db.execSync("PRAGMA foreign_keys = ON;");

  createTables(db);
  createIndexes(db);
  runMigrations(db);

  return db;
}

function createTables(db: SQLite.SQLiteDatabase): void {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS vessels (
      id TEXT PRIMARY KEY NOT NULL,
      vessel_name TEXT NOT NULL,
      imo_number TEXT NOT NULL,
      built_year INTEGER NOT NULL,
      dwt_capacity REAL NOT NULL,
      length_m REAL NOT NULL,
      beam_m REAL NOT NULL,
      depth_m REAL NOT NULL,
      gross_tonnage REAL NOT NULL,
      net_tonnage REAL NOT NULL,
      classification_society TEXT NOT NULL,
      pi_club TEXT NOT NULL,
      vessel_type TEXT NOT NULL,
      coating_type TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS cargoes (
      id TEXT PRIMARY KEY NOT NULL,
      cargo_name TEXT NOT NULL,
      cargo_type TEXT NOT NULL,
      weight_mt REAL NOT NULL,
      volume_cbm REAL NOT NULL,
      hazard_class TEXT NOT NULL,
      temperature_control INTEGER NOT NULL DEFAULT 0,
      ventilation INTEGER NOT NULL DEFAULT 0,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS feasibility_results (
      id TEXT PRIMARY KEY NOT NULL,
      vessel_id TEXT NOT NULL,
      cargo_id TEXT NOT NULL,
      overall_score REAL NOT NULL,
      hull_integrity_score REAL NOT NULL,
      thermal_score REAL NOT NULL,
      eca_compliance_score REAL NOT NULL,
      fts_status TEXT NOT NULL,
      flags TEXT NOT NULL,
      flag_details TEXT NOT NULL,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE,
      FOREIGN KEY (cargo_id) REFERENCES cargoes(id) ON DELETE CASCADE
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS broker_notes (
      id TEXT PRIMARY KEY NOT NULL,
      vessel_id TEXT NOT NULL,
      note_text TEXT NOT NULL,
      captain_name TEXT,
      source_name TEXT,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY NOT NULL,
      uri TEXT NOT NULL,
      vessel_id TEXT,
      broker_note_id TEXT,
      is_demo INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE CASCADE,
      FOREIGN KEY (broker_note_id) REFERENCES broker_notes(id) ON DELETE CASCADE
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS charter_parties (
      id TEXT PRIMARY KEY NOT NULL,
      template_id TEXT NOT NULL,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      vessel_id TEXT,
      cargo_id TEXT,
      field_data TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE SET NULL,
      FOREIGN KEY (cargo_id) REFERENCES cargoes(id) ON DELETE SET NULL
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY NOT NULL,
      template_id TEXT NOT NULL,
      title TEXT NOT NULL,
      vessel_id TEXT,
      cargo_id TEXT,
      field_data TEXT NOT NULL DEFAULT '{}',
      checklist_data TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (vessel_id) REFERENCES vessels(id) ON DELETE SET NULL,
      FOREIGN KEY (cargo_id) REFERENCES cargoes(id) ON DELETE SET NULL
    );
  `);
}

function createIndexes(db: SQLite.SQLiteDatabase): void {
  db.execSync(`CREATE INDEX IF NOT EXISTS idx_vessels_vessel_type ON vessels(vessel_type);`);
  db.execSync(`CREATE INDEX IF NOT EXISTS idx_vessels_imo_number ON vessels(imo_number);`);
  db.execSync(`CREATE INDEX IF NOT EXISTS idx_vessels_is_demo ON vessels(is_demo);`);

  db.execSync(`CREATE INDEX IF NOT EXISTS idx_cargoes_cargo_type ON cargoes(cargo_type);`);
  db.execSync(`CREATE INDEX IF NOT EXISTS idx_cargoes_hazard_class ON cargoes(hazard_class);`);
  db.execSync(`CREATE INDEX IF NOT EXISTS idx_cargoes_is_demo ON cargoes(is_demo);`);

  db.execSync(`CREATE INDEX IF NOT EXISTS idx_feasibility_vessel_id ON feasibility_results(vessel_id);`);
  db.execSync(`CREATE INDEX IF NOT EXISTS idx_feasibility_cargo_id ON feasibility_results(cargo_id);`);
  db.execSync(`CREATE INDEX IF NOT EXISTS idx_feasibility_is_demo ON feasibility_results(is_demo);`);

  db.execSync(`CREATE INDEX IF NOT EXISTS idx_broker_notes_vessel_id ON broker_notes(vessel_id);`);
  db.execSync(`CREATE INDEX IF NOT EXISTS idx_broker_notes_is_demo ON broker_notes(is_demo);`);

  db.execSync(`CREATE INDEX IF NOT EXISTS idx_photos_vessel_id ON photos(vessel_id);`);
  db.execSync(`CREATE INDEX IF NOT EXISTS idx_photos_broker_note_id ON photos(broker_note_id);`);

  db.execSync(`CREATE INDEX IF NOT EXISTS idx_charter_parties_template_id ON charter_parties(template_id);`);
  db.execSync(`CREATE INDEX IF NOT EXISTS idx_charter_parties_status ON charter_parties(status);`);
  db.execSync(`CREATE INDEX IF NOT EXISTS idx_charter_parties_vessel_id ON charter_parties(vessel_id);`);

  db.execSync(`CREATE INDEX IF NOT EXISTS idx_documents_template_id ON documents(template_id);`);
  db.execSync(`CREATE INDEX IF NOT EXISTS idx_documents_vessel_id ON documents(vessel_id);`);
  db.execSync(`CREATE INDEX IF NOT EXISTS idx_documents_cargo_id ON documents(cargo_id);`);
}

function runMigrations(db: SQLite.SQLiteDatabase): void {
  // Migration 1: Add flag column to vessels (v1.1)
  try {
    db.execSync(`ALTER TABLE vessels ADD COLUMN flag TEXT;`);
  } catch {
    // Column already exists — safe to ignore
  }
}

export function closeDatabase(): void {
  if (db) {
    db.closeSync();
    db = null;
  }
}

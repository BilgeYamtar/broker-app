/**
 * Feasibility Rule Engine — Pure function.
 *
 * CRITICAL: This module must NEVER import Zustand stores or SQLite modules.
 * All inputs are passed in; all outputs are deterministic.
 */

import type { Result } from "@/lib/result";
import type {
  FeasibilityResult,
  FlagDetail,
  Flags,
} from "@/features/feasibility/feasibilitySchemas";

// ── Input types (minimal slices of Cargo & Vessel) ──────────────────────────

export interface FeasibilityCargoInput {
  id: string;
  cargoType: string;
  hazardClass: string;
  temperatureControl: boolean;
}

export interface FeasibilityVesselInput {
  id: string;
  vesselType: string;
  coatingType: string;
  builtYear: number;
  dwtCapacity: number;
}

export interface FeasibilityRule {
  cargoType: string;
  coatingType: string;
  compatibility: boolean;
  scoreImpact: number;
  flags: string[];
  notes: string;
}

// ── Constants ───────────────────────────────────────────────────────────────

const FTS_THRESHOLD = 60;
const UNKNOWN_COMBO_SCORE = 50;
const HAZARD_PENALTY: Record<string, number> = {
  "Class 1": 30,
  "Class 2": 20,
  "Class 3": 15,
  "Class 4": 12,
  "Class 5": 12,
  "Class 6": 10,
  "Class 7": 25,
  "Class 8": 15,
  "Class 9": 8,
};

const VESSEL_AGE_THRESHOLD = 20;
const VESSEL_AGE_PENALTY = 10;

/** Vessel types that are ECA-capable (modern emission controls). */
const ECA_CAPABLE_VESSEL_TYPES = new Set([
  "Chemical Tanker",
  "Product Tanker",
  "Container Vessel",
  "LNG Carrier",
]);

/** Hazard classes that trigger ECA scrutiny. */
const ECA_SENSITIVE_HAZARD_CLASSES = new Set([
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 7",
]);

// ── Helpers ─────────────────────────────────────────────────────────────────

function scoreToColor(score: number): "green" | "yellow" | "red" {
  if (score >= 75) return "green";
  if (score >= 50) return "yellow";
  return "red";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ── Message Formatter Type ───────────────────────────────────────────────────

/** Callback that resolves a message key with interpolation params. */
export type MessageFormatter = (key: string, params?: Record<string, string | number>) => string;

// ── Maps: English text from JSON → message key ─────────────────────────────

const FLAG_TEXT_TO_KEY: Record<string, string> = {
  "Check cargo-specific epoxy resistance": "ruleFlag_checkEpoxyResistance",
  "Zinc silicate reacts with acidic liquid cargoes": "ruleFlag_zincReactsAcidic",
  "Monitor for abrasion wear on zinc silicate": "ruleFlag_zincAbrasion",
  "Risk of coating damage from heavy break bulk items": "ruleFlag_breakBulkDamage",
  "Stainless steel decks may be slippery for wheeled cargo": "ruleFlag_stainlessSlippery",
  "Zinc silicate cannot withstand wheeled traffic abrasion": "ruleFlag_zincWheelTraffic",
  "Monitor epoxy integrity under thermal cycling": "ruleFlag_epoxyThermalCycling",
  "Zinc silicate degrades under condensation and thermal stress": "ruleFlag_zincCondensation",
  "Epoxy cannot withstand cryogenic temperatures": "ruleFlag_epoxyCryogenic",
  "Zinc silicate fails at cryogenic temperatures": "ruleFlag_zincCryogenic",
  "Phenolic epoxy not rated for cryogenic service": "ruleFlag_phenolicCryogenic",
};

const NOTE_TEXT_TO_KEY: Record<string, string> = {
  "Zinc silicate is not recommended for liquid bulk due to potential chemical reaction with acidic or alkaline cargoes.": "ruleNote_zincLiquidBulk",
  "Zinc silicate is not suitable for RoRo operations due to rapid coating degradation from vehicle traffic.": "ruleNote_zincRoro",
  "Zinc silicate fails under refrigerated conditions due to moisture condensation and thermal expansion mismatch.": "ruleNote_zincRefrigerated",
  "Standard epoxy coatings become brittle and fail at cryogenic temperatures required for gas cargo.": "ruleNote_epoxyGas",
  "Zinc silicate is completely unsuitable for gas carrier tanks due to cryogenic brittleness.": "ruleNote_zincGas",
  "Phenolic epoxy lacks cryogenic certification required for LPG/LNG containment systems.": "ruleNote_phenolicGas",
};

/** Default (English) message formatter — used as fallback. */
function defaultFormatter(key: string, params?: Record<string, string | number>): string {
  const templates: Record<string, string> = {
    msgCoatingIncompatible: "{coatingType} coating incompatible with {cargoType} cargo — {notes}",
    msgUnknownCombo: "Unknown combination: {cargoType} cargo with {coatingType} coating. Conservative scoring applied.",
    msgHazardSafeguards: "{hazardClass} hazardous cargo requires additional structural safeguards.",
    msgVesselAge: "Vessel is {vesselAge} years old — enhanced hull inspection recommended.",
    msgThermalSupported: "Vessel type supports temperature-controlled cargo.",
    msgThermalNotSupported: "{vesselType} lacks standard thermal management systems for temperature-controlled cargo.",
    msgCoatingThermalCycling: "Coating may degrade under thermal cycling in refrigerated operations.",
    msgNoTempRequired: "No temperature control requirements for this cargo.",
    msgEcaAdditionalControls: "{vesselType} may require additional emission controls for ECA zone transit.",
    msgEcaSpecialHandling: "{hazardClass} cargo requires special ECA zone handling and documentation.",
    msgEcaOlderVessel: "Older vessel may not meet current ECA emission tier requirements.",
    // Rule flags
    ruleFlag_checkEpoxyResistance: "Check cargo-specific epoxy resistance",
    ruleFlag_zincReactsAcidic: "Zinc silicate reacts with acidic liquid cargoes",
    ruleFlag_zincAbrasion: "Monitor for abrasion wear on zinc silicate",
    ruleFlag_breakBulkDamage: "Risk of coating damage from heavy break bulk items",
    ruleFlag_stainlessSlippery: "Stainless steel decks may be slippery for wheeled cargo",
    ruleFlag_zincWheelTraffic: "Zinc silicate cannot withstand wheeled traffic abrasion",
    ruleFlag_epoxyThermalCycling: "Monitor epoxy integrity under thermal cycling",
    ruleFlag_zincCondensation: "Zinc silicate degrades under condensation and thermal stress",
    ruleFlag_epoxyCryogenic: "Epoxy cannot withstand cryogenic temperatures",
    ruleFlag_zincCryogenic: "Zinc silicate fails at cryogenic temperatures",
    ruleFlag_phenolicCryogenic: "Phenolic epoxy not rated for cryogenic service",
    // Rule notes (incompatible combos only)
    ruleNote_zincLiquidBulk: "Zinc silicate is not recommended for liquid bulk due to potential chemical reaction with acidic or alkaline cargoes.",
    ruleNote_zincRoro: "Zinc silicate is not suitable for RoRo operations due to rapid coating degradation from vehicle traffic.",
    ruleNote_zincRefrigerated: "Zinc silicate fails under refrigerated conditions due to moisture condensation and thermal expansion mismatch.",
    ruleNote_epoxyGas: "Standard epoxy coatings become brittle and fail at cryogenic temperatures required for gas cargo.",
    ruleNote_zincGas: "Zinc silicate is completely unsuitable for gas carrier tanks due to cryogenic brittleness.",
    ruleNote_phenolicGas: "Phenolic epoxy lacks cryogenic certification required for LPG/LNG containment systems.",
    // Dimensions
    dimHullIntegrity: "Hull Integrity",
    dimThermalManagement: "Thermal Management",
    dimEcaCompliance: "ECA Compliance",
  };
  let template = templates[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      template = template.replace(`{${k}}`, String(v));
    }
  }
  return template;
}

// ── Service ─────────────────────────────────────────────────────────────────

export function runFeasibility(
  cargo: FeasibilityCargoInput,
  vessel: FeasibilityVesselInput,
  rules: FeasibilityRule[],
  msg: MessageFormatter = defaultFormatter
): Result<Omit<FeasibilityResult, "id" | "isDemo" | "createdAt">> {
  try {
    const flagDetails: FlagDetail[] = [];

    // ── 1. Hull Integrity (coating-cargo matrix) ──────────────────────────

    const rule = rules.find(
      (r) =>
        r.cargoType === cargo.cargoType && r.coatingType === vessel.coatingType
    );

    let hullIntegrityScore: number;

    const dimHull = msg("dimHullIntegrity");

    if (rule) {
      hullIntegrityScore = rule.scoreImpact;
      for (const flag of rule.flags) {
        const flagKey = FLAG_TEXT_TO_KEY[flag];
        flagDetails.push({
          dimension: dimHull,
          color: rule.compatibility ? "yellow" : "red",
          message: flagKey ? msg(flagKey) : flag,
        });
      }
      if (!rule.compatibility) {
        const noteKey = NOTE_TEXT_TO_KEY[rule.notes];
        const translatedNote = noteKey ? msg(noteKey) : rule.notes;
        flagDetails.push({
          dimension: dimHull,
          color: "red",
          message: msg("msgCoatingIncompatible", { coatingType: vessel.coatingType, cargoType: cargo.cargoType, notes: translatedNote }),
        });
      }
    } else {
      // Unknown combination → conservative yellow warning (FR33)
      hullIntegrityScore = UNKNOWN_COMBO_SCORE;
      flagDetails.push({
        dimension: dimHull,
        color: "yellow",
        message: msg("msgUnknownCombo", { cargoType: cargo.cargoType, coatingType: vessel.coatingType }),
      });
    }

    // Hazard class penalty
    const hazardPenalty = HAZARD_PENALTY[cargo.hazardClass] ?? 0;
    if (hazardPenalty > 0) {
      hullIntegrityScore = clamp(hullIntegrityScore - hazardPenalty, 0, 100);
      flagDetails.push({
        dimension: dimHull,
        color: hazardPenalty >= 20 ? "red" : "yellow",
        message: msg("msgHazardSafeguards", { hazardClass: cargo.hazardClass }),
      });
    }

    // Vessel age penalty
    const currentYear = new Date().getFullYear();
    const vesselAge = currentYear - vessel.builtYear;
    if (vesselAge > VESSEL_AGE_THRESHOLD) {
      hullIntegrityScore = clamp(hullIntegrityScore - VESSEL_AGE_PENALTY, 0, 100);
      flagDetails.push({
        dimension: dimHull,
        color: "yellow",
        message: msg("msgVesselAge", { vesselAge }),
      });
    }

    hullIntegrityScore = clamp(hullIntegrityScore, 0, 100);

    // ── 2. Thermal Management ─────────────────────────────────────────────

    let thermalScore = 100;
    const dimThermal = msg("dimThermalManagement");

    if (cargo.temperatureControl) {
      // Check if vessel type supports reefer
      const reeferCapableTypes = new Set([
        "Chemical Tanker",
        "Product Tanker",
        "Container Vessel",
      ]);

      if (reeferCapableTypes.has(vessel.vesselType)) {
        thermalScore = 85;
        flagDetails.push({
          dimension: dimThermal,
          color: "green",
          message: msg("msgThermalSupported"),
        });
      } else {
        thermalScore = 35;
        flagDetails.push({
          dimension: dimThermal,
          color: "red",
          message: msg("msgThermalNotSupported", { vesselType: vessel.vesselType }),
        });
      }

      // Refrigerated cargo on non-stainless steel gets extra penalty
      if (
        cargo.cargoType === "Refrigerated" &&
        vessel.coatingType !== "Stainless Steel" &&
        vessel.coatingType !== "Phenolic Epoxy"
      ) {
        thermalScore = clamp(thermalScore - 15, 0, 100);
        flagDetails.push({
          dimension: dimThermal,
          color: "yellow",
          message: msg("msgCoatingThermalCycling"),
        });
      }
    } else {
      // No temperature control required — full score
      flagDetails.push({
        dimension: dimThermal,
        color: "green",
        message: msg("msgNoTempRequired"),
      });
    }

    thermalScore = clamp(thermalScore, 0, 100);

    // ── 3. ECA Compliance ─────────────────────────────────────────────────

    let ecaComplianceScore = 100;
    const dimEca = msg("dimEcaCompliance");

    if (!ECA_CAPABLE_VESSEL_TYPES.has(vessel.vesselType)) {
      ecaComplianceScore = 55;
      flagDetails.push({
        dimension: dimEca,
        color: "yellow",
        message: msg("msgEcaAdditionalControls", { vesselType: vessel.vesselType }),
      });
    }

    if (ECA_SENSITIVE_HAZARD_CLASSES.has(cargo.hazardClass)) {
      ecaComplianceScore = clamp(ecaComplianceScore - 30, 0, 100);
      flagDetails.push({
        dimension: dimEca,
        color: "red",
        message: msg("msgEcaSpecialHandling", { hazardClass: cargo.hazardClass }),
      });
    }

    // Older vessels less likely to meet current ECA standards
    if (vesselAge > VESSEL_AGE_THRESHOLD) {
      ecaComplianceScore = clamp(ecaComplianceScore - 10, 0, 100);
      flagDetails.push({
        dimension: dimEca,
        color: "yellow",
        message: msg("msgEcaOlderVessel"),
      });
    }

    ecaComplianceScore = clamp(ecaComplianceScore, 0, 100);

    // ── 4. Overall Score & FTS Determination ──────────────────────────────

    const overallScore = clamp(
      Math.round(
        hullIntegrityScore * 0.5 +
          thermalScore * 0.25 +
          ecaComplianceScore * 0.25
      ),
      0,
      100
    );

    const flags: Flags = {
      hullIntegrity: scoreToColor(hullIntegrityScore),
      thermal: scoreToColor(thermalScore),
      ecaCompliance: scoreToColor(ecaComplianceScore),
    };

    const ftsStatus = overallScore >= FTS_THRESHOLD ? "FTS" : "NOT_FTS";

    return {
      success: true,
      data: {
        vesselId: vessel.id,
        cargoId: cargo.id,
        overallScore,
        hullIntegrityScore,
        thermalScore,
        ecaComplianceScore,
        ftsStatus,
        flags,
        flagDetails,
      },
    };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof Error ? err.message : "Feasibility assessment failed",
    };
  }
}

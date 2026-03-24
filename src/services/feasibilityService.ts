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

// ── Service ─────────────────────────────────────────────────────────────────

export function runFeasibility(
  cargo: FeasibilityCargoInput,
  vessel: FeasibilityVesselInput,
  rules: FeasibilityRule[]
): Result<Omit<FeasibilityResult, "id" | "isDemo" | "createdAt">> {
  try {
    const flagDetails: FlagDetail[] = [];

    // ── 1. Hull Integrity (coating-cargo matrix) ──────────────────────────

    const rule = rules.find(
      (r) =>
        r.cargoType === cargo.cargoType && r.coatingType === vessel.coatingType
    );

    let hullIntegrityScore: number;

    if (rule) {
      hullIntegrityScore = rule.scoreImpact;
      for (const flag of rule.flags) {
        flagDetails.push({
          dimension: "Hull Integrity",
          color: rule.compatibility ? "yellow" : "red",
          message: flag,
        });
      }
      if (!rule.compatibility) {
        flagDetails.push({
          dimension: "Hull Integrity",
          color: "red",
          message: `${vessel.coatingType} coating incompatible with ${cargo.cargoType} cargo — ${rule.notes}`,
        });
      }
    } else {
      // Unknown combination → conservative yellow warning (FR33)
      hullIntegrityScore = UNKNOWN_COMBO_SCORE;
      flagDetails.push({
        dimension: "Hull Integrity",
        color: "yellow",
        message: `Unknown combination: ${cargo.cargoType} cargo with ${vessel.coatingType} coating. Conservative scoring applied.`,
      });
    }

    // Hazard class penalty
    const hazardPenalty = HAZARD_PENALTY[cargo.hazardClass] ?? 0;
    if (hazardPenalty > 0) {
      hullIntegrityScore = clamp(hullIntegrityScore - hazardPenalty, 0, 100);
      flagDetails.push({
        dimension: "Hull Integrity",
        color: hazardPenalty >= 20 ? "red" : "yellow",
        message: `${cargo.hazardClass} hazardous cargo requires additional structural safeguards.`,
      });
    }

    // Vessel age penalty
    const currentYear = new Date().getFullYear();
    const vesselAge = currentYear - vessel.builtYear;
    if (vesselAge > VESSEL_AGE_THRESHOLD) {
      hullIntegrityScore = clamp(hullIntegrityScore - VESSEL_AGE_PENALTY, 0, 100);
      flagDetails.push({
        dimension: "Hull Integrity",
        color: "yellow",
        message: `Vessel is ${vesselAge} years old — enhanced hull inspection recommended.`,
      });
    }

    hullIntegrityScore = clamp(hullIntegrityScore, 0, 100);

    // ── 2. Thermal Management ─────────────────────────────────────────────

    let thermalScore = 100;

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
          dimension: "Thermal Management",
          color: "green",
          message: "Vessel type supports temperature-controlled cargo.",
        });
      } else {
        thermalScore = 35;
        flagDetails.push({
          dimension: "Thermal Management",
          color: "red",
          message: `${vessel.vesselType} lacks standard thermal management systems for temperature-controlled cargo.`,
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
          dimension: "Thermal Management",
          color: "yellow",
          message:
            "Coating may degrade under thermal cycling in refrigerated operations.",
        });
      }
    } else {
      // No temperature control required — full score
      flagDetails.push({
        dimension: "Thermal Management",
        color: "green",
        message: "No temperature control requirements for this cargo.",
      });
    }

    thermalScore = clamp(thermalScore, 0, 100);

    // ── 3. ECA Compliance ─────────────────────────────────────────────────

    let ecaComplianceScore = 100;

    if (!ECA_CAPABLE_VESSEL_TYPES.has(vessel.vesselType)) {
      ecaComplianceScore = 55;
      flagDetails.push({
        dimension: "ECA Compliance",
        color: "yellow",
        message: `${vessel.vesselType} may require additional emission controls for ECA zone transit.`,
      });
    }

    if (ECA_SENSITIVE_HAZARD_CLASSES.has(cargo.hazardClass)) {
      ecaComplianceScore = clamp(ecaComplianceScore - 30, 0, 100);
      flagDetails.push({
        dimension: "ECA Compliance",
        color: "red",
        message: `${cargo.hazardClass} cargo requires special ECA zone handling and documentation.`,
      });
    }

    // Older vessels less likely to meet current ECA standards
    if (vesselAge > VESSEL_AGE_THRESHOLD) {
      ecaComplianceScore = clamp(ecaComplianceScore - 10, 0, 100);
      flagDetails.push({
        dimension: "ECA Compliance",
        color: "yellow",
        message:
          "Older vessel may not meet current ECA emission tier requirements.",
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

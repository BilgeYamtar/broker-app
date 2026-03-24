import {
  runFeasibility,
  type FeasibilityCargoInput,
  type FeasibilityVesselInput,
  type FeasibilityRule,
} from "./feasibilityService";
import rules from "@/data/feasibilityRules.json";

const typedRules = rules as FeasibilityRule[];

// ── Test Fixtures ───────────────────────────────────────────────────────────

function makeCargo(overrides: Partial<FeasibilityCargoInput> = {}): FeasibilityCargoInput {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    cargoType: "Dry Bulk",
    hazardClass: "Non-Hazardous",
    temperatureControl: false,
    ...overrides,
  };
}

function makeVessel(overrides: Partial<FeasibilityVesselInput> = {}): FeasibilityVesselInput {
  return {
    id: "00000000-0000-0000-0000-000000000002",
    vesselType: "Bulk Carrier",
    coatingType: "Epoxy",
    builtYear: 2015,
    dwtCapacity: 50000,
    ...overrides,
  };
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("feasibilityService — runFeasibility", () => {
  test("compatible cargo-coating pair → high score, green flags", () => {
    // Dry Bulk + Epoxy = scoreImpact 90, compatible
    const cargo = makeCargo({ cargoType: "Dry Bulk" });
    const vessel = makeVessel({ coatingType: "Epoxy" });

    const result = runFeasibility(cargo, vessel, typedRules);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.hullIntegrityScore).toBeGreaterThanOrEqual(75);
    expect(result.data.overallScore).toBeGreaterThanOrEqual(75);
    expect(result.data.flags.hullIntegrity).toBe("green");
    expect(result.data.ftsStatus).toBe("FTS");

    // No red flags for hull integrity
    const redHullFlags = result.data.flagDetails.filter(
      (f) => f.dimension === "Hull Integrity" && f.color === "red"
    );
    expect(redHullFlags).toHaveLength(0);
  });

  test("incompatible cargo-coating pair → low score, red flags", () => {
    // Gas + Zinc Silicate = scoreImpact 10, incompatible
    const cargo = makeCargo({ cargoType: "Gas" });
    const vessel = makeVessel({ coatingType: "Zinc Silicate" });

    const result = runFeasibility(cargo, vessel, typedRules);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.hullIntegrityScore).toBeLessThanOrEqual(30);
    expect(result.data.flags.hullIntegrity).toBe("red");
    expect(result.data.ftsStatus).toBe("NOT_FTS");

    // Should have red hull integrity flag
    const redHullFlags = result.data.flagDetails.filter(
      (f) => f.dimension === "Hull Integrity" && f.color === "red"
    );
    expect(redHullFlags.length).toBeGreaterThan(0);
  });

  test("unknown combination → yellow warning flags, conservative scoring (FR33)", () => {
    const cargo = makeCargo({ cargoType: "UnknownCargoType" });
    const vessel = makeVessel({ coatingType: "UnknownCoating" });

    const result = runFeasibility(cargo, vessel, typedRules);

    expect(result.success).toBe(true);
    if (!result.success) return;

    // Conservative score = 50 for unknown
    expect(result.data.hullIntegrityScore).toBe(50);

    // Should have yellow warning about unknown combination
    const yellowFlags = result.data.flagDetails.filter(
      (f) =>
        f.dimension === "Hull Integrity" &&
        f.color === "yellow" &&
        f.message.includes("Unknown combination")
    );
    expect(yellowFlags).toHaveLength(1);
  });

  test("ECA-sensitive hazard class → red ECA flag", () => {
    const cargo = makeCargo({
      cargoType: "Liquid Bulk",
      hazardClass: "Class 1",
    });
    const vessel = makeVessel({
      coatingType: "Phenolic Epoxy",
      vesselType: "Chemical Tanker",
    });

    const result = runFeasibility(cargo, vessel, typedRules);

    expect(result.success).toBe(true);
    if (!result.success) return;

    // ECA score should be penalized
    expect(result.data.ecaComplianceScore).toBeLessThanOrEqual(70);

    // Should have red ECA flag
    const redEcaFlags = result.data.flagDetails.filter(
      (f) => f.dimension === "ECA Compliance" && f.color === "red"
    );
    expect(redEcaFlags.length).toBeGreaterThan(0);
    expect(redEcaFlags[0].message).toContain("Class 1");
  });

  test("determinism: same inputs run 100 times → identical output (NFR9)", () => {
    const cargo = makeCargo({
      cargoType: "Liquid Bulk",
      hazardClass: "Class 3",
      temperatureControl: true,
    });
    const vessel = makeVessel({
      coatingType: "Stainless Steel",
      vesselType: "Chemical Tanker",
      builtYear: 2000,
    });

    const first = runFeasibility(cargo, vessel, typedRules);
    expect(first.success).toBe(true);
    if (!first.success) return;

    for (let i = 0; i < 99; i++) {
      const run = runFeasibility(cargo, vessel, typedRules);
      expect(run.success).toBe(true);
      if (!run.success) return;

      expect(run.data.overallScore).toBe(first.data.overallScore);
      expect(run.data.hullIntegrityScore).toBe(first.data.hullIntegrityScore);
      expect(run.data.thermalScore).toBe(first.data.thermalScore);
      expect(run.data.ecaComplianceScore).toBe(first.data.ecaComplianceScore);
      expect(run.data.ftsStatus).toBe(first.data.ftsStatus);
      expect(run.data.flags).toEqual(first.data.flags);
      expect(run.data.flagDetails).toEqual(first.data.flagDetails);
    }
  });

  test("temperature-controlled cargo on incompatible vessel → low thermal score", () => {
    const cargo = makeCargo({
      cargoType: "Refrigerated",
      temperatureControl: true,
    });
    const vessel = makeVessel({
      vesselType: "Bulk Carrier",
      coatingType: "Epoxy",
    });

    const result = runFeasibility(cargo, vessel, typedRules);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.thermalScore).toBeLessThanOrEqual(35);
    expect(result.data.flags.thermal).toBe("red");
  });

  test("old vessel gets hull and ECA penalties", () => {
    const cargo = makeCargo();
    const vessel = makeVessel({ builtYear: 1990 });

    const result = runFeasibility(cargo, vessel, typedRules);

    expect(result.success).toBe(true);
    if (!result.success) return;

    // Should have age-related flags
    const ageFlags = result.data.flagDetails.filter((f) =>
      f.message.includes("years old")
    );
    expect(ageFlags.length).toBeGreaterThan(0);

    // Should have ECA age flag
    const ecaAgeFlags = result.data.flagDetails.filter(
      (f) =>
        f.dimension === "ECA Compliance" &&
        f.message.includes("Older vessel")
    );
    expect(ecaAgeFlags.length).toBeGreaterThan(0);
  });

  test("non-ECA-capable vessel type gets ECA penalty", () => {
    const cargo = makeCargo();
    const vessel = makeVessel({ vesselType: "Bulk Carrier" });

    const result = runFeasibility(cargo, vessel, typedRules);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.ecaComplianceScore).toBeLessThan(100);
    const ecaFlags = result.data.flagDetails.filter(
      (f) =>
        f.dimension === "ECA Compliance" &&
        f.message.includes("additional emission controls")
    );
    expect(ecaFlags.length).toBeGreaterThan(0);
  });

  test("overall score is weighted: 50% hull + 25% thermal + 25% ECA", () => {
    const cargo = makeCargo();
    const vessel = makeVessel({
      builtYear: 2020,
      vesselType: "Chemical Tanker",
    });

    const result = runFeasibility(cargo, vessel, typedRules);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const expected = Math.round(
      result.data.hullIntegrityScore * 0.5 +
        result.data.thermalScore * 0.25 +
        result.data.ecaComplianceScore * 0.25
    );
    expect(result.data.overallScore).toBe(expected);
  });

  test("all scores are clamped between 0 and 100", () => {
    // Worst case: Gas + Zinc Silicate + Class 1 + old vessel + temp control
    const cargo = makeCargo({
      cargoType: "Gas",
      hazardClass: "Class 1",
      temperatureControl: true,
    });
    const vessel = makeVessel({
      coatingType: "Zinc Silicate",
      vesselType: "General Cargo",
      builtYear: 1980,
    });

    const result = runFeasibility(cargo, vessel, typedRules);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.hullIntegrityScore).toBeGreaterThanOrEqual(0);
    expect(result.data.hullIntegrityScore).toBeLessThanOrEqual(100);
    expect(result.data.thermalScore).toBeGreaterThanOrEqual(0);
    expect(result.data.thermalScore).toBeLessThanOrEqual(100);
    expect(result.data.ecaComplianceScore).toBeGreaterThanOrEqual(0);
    expect(result.data.ecaComplianceScore).toBeLessThanOrEqual(100);
    expect(result.data.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.data.overallScore).toBeLessThanOrEqual(100);
  });
});

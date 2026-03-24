import * as vesselRepository from "@/features/vessel/vesselRepository";
import * as cargoRepository from "@/features/cargo/cargoRepository";
import * as feasibilityRepository from "@/features/feasibility/feasibilityRepository";
import { runFeasibility } from "@/services/feasibilityService";
import type { FeasibilityRule } from "@/services/feasibilityService";
import rules from "./feasibilityRules.json";

const typedRules = rules as FeasibilityRule[];

export async function seedDemoData(): Promise<void> {
  // 1. Demo Vessel — MV Demo Star
  const vesselResult = await vesselRepository.createVessel(
    {
      vesselName: "MV Demo Star",
      imoNumber: "9876543",
      builtYear: 2018,
      dwtCapacity: 35000,
      lengthM: 190,
      beamM: 32.2,
      depthM: 18.5,
      grossTonnage: 22500,
      netTonnage: 12800,
      classificationSociety: "DNV GL",
      piClub: "Gard",
      vesselType: "Bulk Carrier",
      coatingType: "Epoxy",
    },
    true // isDemo
  );

  if (!vesselResult.success) {
    console.error("Failed to seed demo vessel:", vesselResult.error);
    return;
  }

  // 2. Demo Cargo — 5,000 MT Diesel
  const cargoResult = await cargoRepository.createCargo(
    {
      cargoName: "Diesel Fuel (Demo)",
      cargoType: "Liquid Bulk",
      weightMt: 5000,
      volumeCbm: 5950,
      hazardClass: "Non-Hazardous",
      temperatureControl: false,
      ventilation: false,
    },
    true // isDemo
  );

  if (!cargoResult.success) {
    console.error("Failed to seed demo cargo:", cargoResult.error);
    return;
  }

  const vessel = vesselResult.data;
  const cargo = cargoResult.data;

  // 3. Pre-calculate feasibility result using the engine
  const engineResult = runFeasibility(
    {
      id: cargo.id,
      cargoType: cargo.cargoType,
      hazardClass: cargo.hazardClass,
      temperatureControl: cargo.temperatureControl,
    },
    {
      id: vessel.id,
      vesselType: vessel.vesselType,
      coatingType: vessel.coatingType,
      builtYear: vessel.builtYear,
      dwtCapacity: vessel.dwtCapacity,
    },
    typedRules
  );

  if (!engineResult.success) {
    console.error("Failed to compute demo feasibility:", engineResult.error);
    return;
  }

  const saveResult = await feasibilityRepository.create(
    {
      ...engineResult.data,
      isDemo: true,
    },
    true // isDemo
  );

  if (!saveResult.success) {
    console.error(
      "Failed to seed demo feasibility result:",
      saveResult.error
    );
  }
}

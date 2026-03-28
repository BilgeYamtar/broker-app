/**
 * Voyage cost estimation — pure calculation, no side effects.
 */

export interface VoyageParams {
  distanceNm: number;
  speedKnots: number;
  dailyFuelTons: number;
  fuelPricePerTon: number;
  charterRatePerDay: number;
  portCosts: number;
}

export interface VoyageCostResult {
  distanceNm: number;
  durationHours: number;
  durationDays: number;
  fuelConsumptionTons: number;
  fuelCost: number;
  charterCost: number;
  portCosts: number;
  totalCost: number;
}

export const VOYAGE_DEFAULTS: VoyageParams = {
  distanceNm: 0,
  speedKnots: 12,
  dailyFuelTons: 25,
  fuelPricePerTon: 650,
  charterRatePerDay: 15000,
  portCosts: 5000,
};

export function calculateVoyageCost(params: VoyageParams): VoyageCostResult {
  const {
    distanceNm,
    speedKnots,
    dailyFuelTons,
    fuelPricePerTon,
    charterRatePerDay,
    portCosts,
  } = params;

  const durationHours = speedKnots > 0 ? distanceNm / speedKnots : 0;
  const durationDays = durationHours / 24;

  const fuelConsumptionTons = durationDays * dailyFuelTons;
  const fuelCost = fuelConsumptionTons * fuelPricePerTon;
  const charterCost = durationDays * charterRatePerDay;
  const totalCost = fuelCost + charterCost + portCosts;

  return {
    distanceNm,
    durationHours: Math.round(durationHours * 10) / 10,
    durationDays: Math.round(durationDays * 100) / 100,
    fuelConsumptionTons: Math.round(fuelConsumptionTons * 10) / 10,
    fuelCost: Math.round(fuelCost),
    charterCost: Math.round(charterCost),
    portCosts,
    totalCost: Math.round(totalCost),
  };
}

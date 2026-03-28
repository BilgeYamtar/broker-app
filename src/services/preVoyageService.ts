/**
 * Pre-voyage estimation — comprehensive cost/revenue calculator.
 * Pure calculation, no side effects.
 */

export interface PreVoyageParams {
  // Voyage
  distanceNm: number;
  speedKnots: number;

  // Fuel
  dailyFuelAtSea: number;
  dailyFuelInPort: number;
  fuelPriceIfo: number;
  fuelPriceLsmgo: number;
  portDays: number;
  ecaDistanceNm: number;

  // Charter
  charterRatePerDay: number;

  // Port costs
  loadingPortCosts: number;
  dischargePortCosts: number;
  canalFees: number;

  // Cargo & freight
  cargoQuantity: number;
  freightRate: number;
  brokerCommissionPct: number;

  // Insurance
  hmInsurancePerDay: number;
  piInsurancePerDay: number;
}

export interface PreVoyageResult {
  // Voyage
  seaDays: number;
  ecaDays: number;
  nonEcaSeaDays: number;
  totalDays: number;

  // Fuel breakdown
  seaFuelCostIfo: number;
  seaFuelCostLsmgo: number;
  portFuelCost: number;
  totalFuelCost: number;
  totalFuelTons: number;

  // Charter
  totalCharterCost: number;

  // Port
  totalPortCosts: number;

  // Insurance
  totalInsurance: number;

  // Revenue
  freightRevenue: number;
  commissionAmount: number;
  netRevenue: number;

  // Summary
  totalCosts: number;
  profitLoss: number;
  breakevenFreightRate: number;
}

export const PRE_VOYAGE_DEFAULTS: PreVoyageParams = {
  distanceNm: 0,
  speedKnots: 12,
  dailyFuelAtSea: 25,
  dailyFuelInPort: 5,
  fuelPriceIfo: 450,
  fuelPriceLsmgo: 650,
  portDays: 3,
  ecaDistanceNm: 0,
  charterRatePerDay: 15000,
  loadingPortCosts: 5000,
  dischargePortCosts: 5000,
  canalFees: 0,
  cargoQuantity: 10000,
  freightRate: 15,
  brokerCommissionPct: 2.5,
  hmInsurancePerDay: 500,
  piInsurancePerDay: 300,
};

export function calculatePreVoyage(params: PreVoyageParams): PreVoyageResult {
  const {
    distanceNm,
    speedKnots,
    dailyFuelAtSea,
    dailyFuelInPort,
    fuelPriceIfo,
    fuelPriceLsmgo,
    portDays,
    ecaDistanceNm,
    charterRatePerDay,
    loadingPortCosts,
    dischargePortCosts,
    canalFees,
    cargoQuantity,
    freightRate,
    brokerCommissionPct,
    hmInsurancePerDay,
    piInsurancePerDay,
  } = params;

  // Voyage duration
  const totalSeaHours = speedKnots > 0 ? distanceNm / speedKnots : 0;
  const seaDays = totalSeaHours / 24;

  const ecaHours = speedKnots > 0 ? ecaDistanceNm / speedKnots : 0;
  const ecaDays = ecaHours / 24;
  const nonEcaSeaDays = Math.max(0, seaDays - ecaDays);

  const totalDays = seaDays + portDays;

  // Fuel costs
  const seaFuelCostIfo = nonEcaSeaDays * dailyFuelAtSea * fuelPriceIfo;
  const seaFuelCostLsmgo = ecaDays * dailyFuelAtSea * fuelPriceLsmgo;
  const portFuelCost = portDays * dailyFuelInPort * fuelPriceIfo;
  const totalFuelCost = seaFuelCostIfo + seaFuelCostLsmgo + portFuelCost;
  const totalFuelTons =
    seaDays * dailyFuelAtSea + portDays * dailyFuelInPort;

  // Charter
  const totalCharterCost = totalDays * charterRatePerDay;

  // Port costs
  const totalPortCosts = loadingPortCosts + dischargePortCosts + canalFees;

  // Insurance
  const totalInsurance = totalDays * (hmInsurancePerDay + piInsurancePerDay);

  // Revenue
  const freightRevenue = cargoQuantity * freightRate;
  const commissionAmount = freightRevenue * (brokerCommissionPct / 100);
  const netRevenue = freightRevenue - commissionAmount;

  // Summary
  const totalCosts =
    totalFuelCost + totalCharterCost + totalPortCosts + totalInsurance;
  const profitLoss = netRevenue - totalCosts;
  const breakevenFreightRate =
    cargoQuantity > 0 ? totalCosts / cargoQuantity : 0;

  return {
    seaDays: round2(seaDays),
    ecaDays: round2(ecaDays),
    nonEcaSeaDays: round2(nonEcaSeaDays),
    totalDays: round2(totalDays),
    seaFuelCostIfo: Math.round(seaFuelCostIfo),
    seaFuelCostLsmgo: Math.round(seaFuelCostLsmgo),
    portFuelCost: Math.round(portFuelCost),
    totalFuelCost: Math.round(totalFuelCost),
    totalFuelTons: round1(totalFuelTons),
    totalCharterCost: Math.round(totalCharterCost),
    totalPortCosts: Math.round(totalPortCosts),
    totalInsurance: Math.round(totalInsurance),
    freightRevenue: Math.round(freightRevenue),
    commissionAmount: Math.round(commissionAmount),
    netRevenue: Math.round(netRevenue),
    totalCosts: Math.round(totalCosts),
    profitLoss: Math.round(profitLoss),
    breakevenFreightRate: round2(breakevenFreightRate),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Charter Party (C/P) templates — standard charter party forms
 * used in maritime shipping.
 */

export type CpStatus = "draft" | "active" | "completed";

export interface CpField {
  key: string;
  labelTr: string;
  labelEn: string;
  type: "text" | "number" | "datetime" | "multiline";
  autoFillSource?: "vessel" | "cargo";
  autoFillKey?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  section: "parties" | "vessel" | "cargo" | "commercial" | "laytime" | "terms";
}

export interface CpTemplate {
  id: string;
  code: string;
  nameTr: string;
  nameEn: string;
  descriptionTr: string;
  descriptionEn: string;
  usageTr: string;
  usageEn: string;
  fields: CpField[];
}

/** Common fields shared across all C/P types */
const COMMON_PARTIES: CpField[] = [
  { key: "ownerName", labelTr: "Armatör (Owner)", labelEn: "Owner", type: "text", section: "parties", required: true },
  { key: "ownerAddress", labelTr: "Armatör Adresi", labelEn: "Owner Address", type: "multiline", section: "parties" },
  { key: "chartererName", labelTr: "Kiracı (Charterer)", labelEn: "Charterer", type: "text", section: "parties", required: true },
  { key: "chartererAddress", labelTr: "Kiracı Adresi", labelEn: "Charterer Address", type: "multiline", section: "parties" },
];

const COMMON_VESSEL: CpField[] = [
  { key: "vesselName", labelTr: "Gemi Adı", labelEn: "Vessel Name", type: "text", section: "vessel", autoFillSource: "vessel", autoFillKey: "vesselName", required: true },
  { key: "imoNumber", labelTr: "IMO Numarası", labelEn: "IMO Number", type: "text", section: "vessel", autoFillSource: "vessel", autoFillKey: "imoNumber" },
  { key: "vesselType", labelTr: "Gemi Tipi", labelEn: "Vessel Type", type: "text", section: "vessel", autoFillSource: "vessel", autoFillKey: "vesselType" },
  { key: "dwtCapacity", labelTr: "DWT Kapasitesi", labelEn: "DWT Capacity", type: "number", section: "vessel", autoFillSource: "vessel", autoFillKey: "dwtCapacity" },
  { key: "flag", labelTr: "Bayrak", labelEn: "Flag", type: "text", section: "vessel", autoFillSource: "vessel", autoFillKey: "flag" },
  { key: "builtYear", labelTr: "Yapım Yılı", labelEn: "Built Year", type: "number", section: "vessel", autoFillSource: "vessel", autoFillKey: "builtYear" },
  { key: "classificationSociety", labelTr: "Klas Kuruluşu", labelEn: "Classification", type: "text", section: "vessel", autoFillSource: "vessel", autoFillKey: "classificationSociety" },
];

const COMMON_CARGO: CpField[] = [
  { key: "cargoDescription", labelTr: "Yük Tanımı", labelEn: "Cargo Description", type: "text", section: "cargo", autoFillSource: "cargo", autoFillKey: "cargoName", required: true },
  { key: "cargoWeight", labelTr: "Yük Miktarı (MT)", labelEn: "Cargo Quantity (MT)", type: "number", section: "cargo", autoFillSource: "cargo", autoFillKey: "weightMt", required: true },
  { key: "loadingPort", labelTr: "Yükleme Limanı", labelEn: "Loading Port", type: "text", section: "cargo", required: true },
  { key: "dischargePort", labelTr: "Boşaltma Limanı", labelEn: "Discharge Port", type: "text", section: "cargo", required: true },
];

const COMMON_COMMERCIAL_VOYAGE: CpField[] = [
  { key: "freightRate", labelTr: "Navlun ($/ton)", labelEn: "Freight Rate ($/ton)", type: "number", section: "commercial", defaultValue: "15", required: true },
  { key: "commissionPct", labelTr: "Komisyon (%)", labelEn: "Commission (%)", type: "number", section: "commercial", defaultValue: "3.75" },
  { key: "laycanFrom", labelTr: "Laycan Başlangıç", labelEn: "Laycan From", type: "datetime", section: "commercial", required: true },
  { key: "laycanTo", labelTr: "Laycan Bitiş", labelEn: "Laycan To", type: "datetime", section: "commercial", required: true },
];

const COMMON_COMMERCIAL_TIME: CpField[] = [
  { key: "hireRate", labelTr: "Günlük Kira ($/gün)", labelEn: "Daily Hire Rate ($/day)", type: "number", section: "commercial", defaultValue: "15000", required: true },
  { key: "commissionPct", labelTr: "Komisyon (%)", labelEn: "Commission (%)", type: "number", section: "commercial", defaultValue: "2.5" },
  { key: "deliveryDate", labelTr: "Teslim Tarihi (Delivery)", labelEn: "Delivery Date", type: "datetime", section: "commercial", required: true },
  { key: "redeliveryDate", labelTr: "İade Tarihi (Redelivery)", labelEn: "Redelivery Date", type: "datetime", section: "commercial" },
  { key: "deliveryPort", labelTr: "Teslim Limanı", labelEn: "Delivery Port", type: "text", section: "commercial" },
  { key: "redeliveryPort", labelTr: "İade Limanı", labelEn: "Redelivery Port", type: "text", section: "commercial" },
];

const COMMON_LAYTIME: CpField[] = [
  { key: "laytimeHours", labelTr: "İzin Verilen Laytime (saat)", labelEn: "Allowed Laytime (hours)", type: "number", section: "laytime", defaultValue: "72", required: true },
  { key: "demurrageRate", labelTr: "Sürastarya (Demurrage) ($/gün)", labelEn: "Demurrage Rate ($/day)", type: "number", section: "laytime", defaultValue: "15000", required: true },
  { key: "despatchRate", labelTr: "Sürat Primi (Despatch) ($/gün)", labelEn: "Despatch Rate ($/day)", type: "number", section: "laytime", defaultValue: "7500" },
  { key: "actualTimeUsed", labelTr: "Kullanılan Süre (saat)", labelEn: "Actual Time Used (hours)", type: "number", section: "laytime" },
];

const COMMON_TERMS: CpField[] = [
  { key: "governingLaw", labelTr: "Uygulanacak Hukuk", labelEn: "Governing Law", type: "text", section: "terms", defaultValue: "English Law" },
  { key: "arbitration", labelTr: "Tahkim (Arbitration)", labelEn: "Arbitration", type: "text", section: "terms", defaultValue: "London" },
  { key: "specialTerms", labelTr: "Özel Koşullar", labelEn: "Special Terms & Conditions", type: "multiline", section: "terms" },
];

export const charterPartyTemplates: CpTemplate[] = [
  {
    id: "gencon",
    code: "GENCON",
    nameTr: "Genel Sefer Sözleşmesi (GENCON)",
    nameEn: "General Charter (GENCON)",
    descriptionTr: "BIMCO tarafından yayımlanan en yaygın kuru dökme yük sefer kirası sözleşmesi",
    descriptionEn: "Most common dry bulk voyage charter, published by BIMCO",
    usageTr: "Kuru dökme yük (tahıl, kömür, demir cevheri vb.)",
    usageEn: "Dry bulk cargo (grain, coal, iron ore, etc.)",
    fields: [
      ...COMMON_PARTIES,
      ...COMMON_VESSEL,
      ...COMMON_CARGO,
      ...COMMON_COMMERCIAL_VOYAGE,
      ...COMMON_LAYTIME,
      ...COMMON_TERMS,
    ],
  },
  {
    id: "asbatankvoy",
    code: "ASBATANKVOY",
    nameTr: "Tanker Sefer Sözleşmesi (ASBATANKVOY)",
    nameEn: "Tanker Voyage Charter (ASBATANKVOY)",
    descriptionTr: "ASBA tarafından yayımlanan standart tanker sefer kirası sözleşmesi",
    descriptionEn: "Standard tanker voyage charter, published by ASBA",
    usageTr: "Ham petrol, petrol ürünleri, kimyasal yükler",
    usageEn: "Crude oil, petroleum products, chemicals",
    fields: [
      ...COMMON_PARTIES,
      ...COMMON_VESSEL,
      ...COMMON_CARGO,
      { key: "cargoGrade", labelTr: "Yük Sınıfı (Grade)", labelEn: "Cargo Grade", type: "text", section: "cargo" },
      { key: "tankCoating", labelTr: "Tank Kaplaması", labelEn: "Tank Coating", type: "text", section: "cargo" },
      ...COMMON_COMMERCIAL_VOYAGE,
      { key: "worldscaleRate", labelTr: "Worldscale Oranı", labelEn: "Worldscale Rate", type: "number", section: "commercial" },
      ...COMMON_LAYTIME,
      ...COMMON_TERMS,
    ],
  },
  {
    id: "nype",
    code: "NYPE",
    nameTr: "Zaman Kirası Sözleşmesi (NYPE)",
    nameEn: "Time Charter (NYPE)",
    descriptionTr: "New York Produce Exchange zaman kirası sözleşmesi — en yaygın TC formu",
    descriptionEn: "New York Produce Exchange time charter — most common TC form",
    usageTr: "Her tür yük için zaman kirası",
    usageEn: "Time charter for all cargo types",
    fields: [
      ...COMMON_PARTIES,
      ...COMMON_VESSEL,
      { key: "speedLaden", labelTr: "Yüklü Hız (knot)", labelEn: "Speed Laden (knots)", type: "number", section: "vessel", defaultValue: "12" },
      { key: "speedBallast", labelTr: "Boş Hız (knot)", labelEn: "Speed Ballast (knots)", type: "number", section: "vessel", defaultValue: "13" },
      { key: "fuelConsumption", labelTr: "Yakıt Tüketimi (ton/gün)", labelEn: "Fuel Consumption (t/day)", type: "number", section: "vessel", defaultValue: "25" },
      { key: "tradingArea", labelTr: "Ticaret Alanı", labelEn: "Trading Area", type: "text", section: "cargo", defaultValue: "Worldwide" },
      { key: "excludedCargoes", labelTr: "Hariç Tutulan Yükler", labelEn: "Excluded Cargoes", type: "multiline", section: "cargo" },
      ...COMMON_COMMERCIAL_TIME,
      ...COMMON_TERMS,
    ],
  },
  {
    id: "baltime",
    code: "BALTIME",
    nameTr: "Zaman Kirası Sözleşmesi (BALTIME)",
    nameEn: "Time Charter (BALTIME)",
    descriptionTr: "BIMCO tarafından yayımlanan zaman kirası sözleşmesi",
    descriptionEn: "Time charter published by BIMCO",
    usageTr: "Genel yük için zaman kirası",
    usageEn: "Time charter for general cargo",
    fields: [
      ...COMMON_PARTIES,
      ...COMMON_VESSEL,
      { key: "speedLaden", labelTr: "Yüklü Hız (knot)", labelEn: "Speed Laden (knots)", type: "number", section: "vessel", defaultValue: "12" },
      { key: "fuelConsumption", labelTr: "Yakıt Tüketimi (ton/gün)", labelEn: "Fuel Consumption (t/day)", type: "number", section: "vessel", defaultValue: "25" },
      { key: "tradingArea", labelTr: "Ticaret Alanı", labelEn: "Trading Area", type: "text", section: "cargo", defaultValue: "Worldwide" },
      ...COMMON_COMMERCIAL_TIME,
      ...COMMON_TERMS,
    ],
  },
  {
    id: "shellvoy",
    code: "SHELLVOY",
    nameTr: "Shell Tanker Sefer Sözleşmesi (SHELLVOY)",
    nameEn: "Shell Tanker Voyage Charter (SHELLVOY)",
    descriptionTr: "Shell tarafından kullanılan tanker sefer kirası sözleşmesi",
    descriptionEn: "Tanker voyage charter used by Shell",
    usageTr: "Shell tanker operasyonları",
    usageEn: "Shell tanker operations",
    fields: [
      ...COMMON_PARTIES,
      ...COMMON_VESSEL,
      ...COMMON_CARGO,
      { key: "cargoGrade", labelTr: "Yük Sınıfı (Grade)", labelEn: "Cargo Grade", type: "text", section: "cargo" },
      ...COMMON_COMMERCIAL_VOYAGE,
      { key: "worldscaleRate", labelTr: "Worldscale Oranı", labelEn: "Worldscale Rate", type: "number", section: "commercial" },
      ...COMMON_LAYTIME,
      ...COMMON_TERMS,
    ],
  },
];

export function getCpTemplateById(id: string): CpTemplate | undefined {
  return charterPartyTemplates.find((t) => t.id === id);
}

export interface DemurrageResult {
  laytimeHours: number;
  actualHours: number;
  differenceHours: number;
  isDemurrage: boolean;
  amount: number;
  ratePerDay: number;
}

export function calculateDemurrageDespatch(
  laytimeHours: number,
  actualHours: number,
  demurrageRate: number,
  despatchRate: number
): DemurrageResult {
  const diff = actualHours - laytimeHours;
  const isDemurrage = diff > 0;
  const rate = isDemurrage ? demurrageRate : despatchRate;
  const amount = Math.abs(diff) * (rate / 24);

  return {
    laytimeHours,
    actualHours,
    differenceHours: Math.round(Math.abs(diff) * 100) / 100,
    isDemurrage,
    amount: Math.round(amount),
    ratePerDay: rate,
  };
}

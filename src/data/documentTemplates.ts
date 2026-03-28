/**
 * Maritime document templates — professional documents brokers need
 * before and after port arrival.
 */

export type DocumentCategory = "pre-arrival" | "post-voyage" | "checklist";

export interface DocumentField {
  key: string;
  labelTr: string;
  labelEn: string;
  type: "text" | "datetime" | "multiline" | "number";
  /** If true, can be auto-filled from vessel/cargo data */
  autoFillSource?: "vessel" | "cargo";
  autoFillKey?: string;
  placeholder?: string;
  required?: boolean;
}

export interface ChecklistItem {
  key: string;
  labelTr: string;
  labelEn: string;
}

export interface DocumentTemplate {
  id: string;
  nameTr: string;
  nameEn: string;
  abbreviation: string;
  descriptionTr: string;
  descriptionEn: string;
  category: DocumentCategory;
  fields?: DocumentField[];
  checklist?: ChecklistItem[];
}

export const documentTemplates: DocumentTemplate[] = [
  // ── PRE-ARRIVAL ──────────────────────────────────────────
  {
    id: "nor",
    nameTr: "Yükleme/Boşaltma Hazırlık Bildirimi (NOR)",
    nameEn: "Notice of Readiness (NOR)",
    abbreviation: "NOR",
    descriptionTr: "Geminin yükleme veya boşaltma için hazır olduğunu bildiren resmi belge",
    descriptionEn: "Official notice that the vessel is ready to load or discharge",
    category: "pre-arrival",
    fields: [
      { key: "vesselName", labelTr: "Gemi Adı", labelEn: "Vessel Name", type: "text", autoFillSource: "vessel", autoFillKey: "vesselName", required: true },
      { key: "imoNumber", labelTr: "IMO Numarası", labelEn: "IMO Number", type: "text", autoFillSource: "vessel", autoFillKey: "imoNumber" },
      { key: "port", labelTr: "Liman", labelEn: "Port", type: "text", required: true },
      { key: "tenderedDate", labelTr: "Tebliğ Tarihi/Saati", labelEn: "Date/Time Tendered", type: "datetime", required: true },
      { key: "cargoDescription", labelTr: "Yük Tanımı", labelEn: "Cargo Description", type: "text", autoFillSource: "cargo", autoFillKey: "cargoName" },
      { key: "cargoWeight", labelTr: "Yük Ağırlığı (MT)", labelEn: "Cargo Weight (MT)", type: "number", autoFillSource: "cargo", autoFillKey: "weightMt" },
      { key: "masterName", labelTr: "Kaptan Adı", labelEn: "Master Name", type: "text", required: true },
      { key: "remarks", labelTr: "Notlar", labelEn: "Remarks", type: "multiline" },
    ],
  },
  {
    id: "sof",
    nameTr: "Operasyon Zaman Çizelgesi (SOF)",
    nameEn: "Statement of Facts (SOF)",
    abbreviation: "SOF",
    descriptionTr: "Limandaki tüm operasyonların kronolojik kaydı",
    descriptionEn: "Chronological record of all port operations",
    category: "pre-arrival",
    fields: [
      { key: "vesselName", labelTr: "Gemi Adı", labelEn: "Vessel Name", type: "text", autoFillSource: "vessel", autoFillKey: "vesselName", required: true },
      { key: "imoNumber", labelTr: "IMO Numarası", labelEn: "IMO Number", type: "text", autoFillSource: "vessel", autoFillKey: "imoNumber" },
      { key: "port", labelTr: "Liman", labelEn: "Port", type: "text", required: true },
      { key: "norTendered", labelTr: "NOR Tebliğ", labelEn: "NOR Tendered", type: "datetime" },
      { key: "berthAssigned", labelTr: "Rıhtım Tahsisi", labelEn: "Berth Assigned", type: "datetime" },
      { key: "allFast", labelTr: "Bağlama Tamamlandı", labelEn: "All Fast", type: "datetime" },
      { key: "commencedLoading", labelTr: "Yükleme Başladı", labelEn: "Commenced Loading", type: "datetime" },
      { key: "completedLoading", labelTr: "Yükleme Tamamlandı", labelEn: "Completed Loading", type: "datetime" },
      { key: "commencedDischarge", labelTr: "Boşaltma Başladı", labelEn: "Commenced Discharge", type: "datetime" },
      { key: "completedDischarge", labelTr: "Boşaltma Tamamlandı", labelEn: "Completed Discharge", type: "datetime" },
      { key: "hosesDisconnected", labelTr: "Hortumlar Söküldü", labelEn: "Hoses Disconnected", type: "datetime" },
      { key: "sailed", labelTr: "Demir Aldı", labelEn: "Sailed", type: "datetime" },
      { key: "remarks", labelTr: "Notlar", labelEn: "Remarks", type: "multiline" },
    ],
  },
  {
    id: "lor",
    nameTr: "Hazırlık Mektubu (LOR)",
    nameEn: "Letter of Readiness (LOR)",
    abbreviation: "LOR",
    descriptionTr: "Geminin yük almaya hazır olduğunu charterer'a bildiren mektup",
    descriptionEn: "Letter notifying charterer that the vessel is ready to receive cargo",
    category: "pre-arrival",
    fields: [
      { key: "vesselName", labelTr: "Gemi Adı", labelEn: "Vessel Name", type: "text", autoFillSource: "vessel", autoFillKey: "vesselName", required: true },
      { key: "imoNumber", labelTr: "IMO Numarası", labelEn: "IMO Number", type: "text", autoFillSource: "vessel", autoFillKey: "imoNumber" },
      { key: "chartererName", labelTr: "Kiracı (Charterer)", labelEn: "Charterer", type: "text", required: true },
      { key: "port", labelTr: "Liman", labelEn: "Port", type: "text", required: true },
      { key: "date", labelTr: "Tarih", labelEn: "Date", type: "datetime", required: true },
      { key: "cargoDescription", labelTr: "Yük Tanımı", labelEn: "Cargo Description", type: "text", autoFillSource: "cargo", autoFillKey: "cargoName" },
      { key: "cargoWeight", labelTr: "Yük Ağırlığı (MT)", labelEn: "Cargo Weight (MT)", type: "number", autoFillSource: "cargo", autoFillKey: "weightMt" },
      { key: "readyConfirmation", labelTr: "Hazırlık Onayı", labelEn: "Ready Confirmation", type: "multiline", required: true },
      { key: "masterName", labelTr: "Kaptan Adı", labelEn: "Master Name", type: "text", required: true },
    ],
  },

  // ── POST-VOYAGE ──────────────────────────────────────────
  {
    id: "bl",
    nameTr: "Konşimento (B/L)",
    nameEn: "Bill of Lading (B/L)",
    abbreviation: "B/L",
    descriptionTr: "Yükün teslim alındığını ve taşıma koşullarını belgeleyen temel denizcilik belgesi",
    descriptionEn: "Primary maritime document confirming receipt of cargo and transport terms",
    category: "post-voyage",
    fields: [
      { key: "blNumber", labelTr: "B/L Numarası", labelEn: "B/L Number", type: "text", required: true },
      { key: "shipper", labelTr: "Yükleyici (Shipper)", labelEn: "Shipper", type: "text", required: true },
      { key: "consignee", labelTr: "Alıcı (Consignee)", labelEn: "Consignee", type: "text", required: true },
      { key: "notifyParty", labelTr: "İhbar Tarafı (Notify Party)", labelEn: "Notify Party", type: "text" },
      { key: "vesselName", labelTr: "Gemi Adı", labelEn: "Vessel Name", type: "text", autoFillSource: "vessel", autoFillKey: "vesselName", required: true },
      { key: "imoNumber", labelTr: "IMO Numarası", labelEn: "IMO Number", type: "text", autoFillSource: "vessel", autoFillKey: "imoNumber" },
      { key: "portOfLoading", labelTr: "Yükleme Limanı", labelEn: "Port of Loading", type: "text", required: true },
      { key: "portOfDischarge", labelTr: "Boşaltma Limanı", labelEn: "Port of Discharge", type: "text", required: true },
      { key: "cargoDescription", labelTr: "Yük Tanımı", labelEn: "Cargo Description", type: "text", autoFillSource: "cargo", autoFillKey: "cargoName", required: true },
      { key: "weight", labelTr: "Ağırlık (MT)", labelEn: "Weight (MT)", type: "number", autoFillSource: "cargo", autoFillKey: "weightMt", required: true },
      { key: "measurement", labelTr: "Hacim (M³)", labelEn: "Measurement (M³)", type: "number", autoFillSource: "cargo", autoFillKey: "volumeCbm" },
      { key: "freightAmount", labelTr: "Navlun Tutarı", labelEn: "Freight Amount", type: "text" },
      { key: "dateOfIssue", labelTr: "Düzenleme Tarihi", labelEn: "Date of Issue", type: "datetime", required: true },
      { key: "remarks", labelTr: "Notlar", labelEn: "Remarks", type: "multiline" },
    ],
  },
  {
    id: "mr",
    nameTr: "Kaptan Makbuzu (Mate's Receipt)",
    nameEn: "Mate's Receipt (MR)",
    abbreviation: "MR",
    descriptionTr: "Yükün gemiye teslim alındığını ve durumunu belgeleyen makbuz",
    descriptionEn: "Receipt confirming cargo received on board and its condition",
    category: "post-voyage",
    fields: [
      { key: "vesselName", labelTr: "Gemi Adı", labelEn: "Vessel Name", type: "text", autoFillSource: "vessel", autoFillKey: "vesselName", required: true },
      { key: "imoNumber", labelTr: "IMO Numarası", labelEn: "IMO Number", type: "text", autoFillSource: "vessel", autoFillKey: "imoNumber" },
      { key: "port", labelTr: "Liman", labelEn: "Port", type: "text", required: true },
      { key: "date", labelTr: "Tarih", labelEn: "Date", type: "datetime", required: true },
      { key: "cargoDescription", labelTr: "Teslim Alınan Yük", labelEn: "Cargo Received", type: "text", autoFillSource: "cargo", autoFillKey: "cargoName", required: true },
      { key: "cargoWeight", labelTr: "Ağırlık (MT)", labelEn: "Weight (MT)", type: "number", autoFillSource: "cargo", autoFillKey: "weightMt" },
      { key: "conditionRemarks", labelTr: "Durum Notları", labelEn: "Condition Remarks", type: "multiline", required: true },
      { key: "chiefOfficerName", labelTr: "Baş Zabit Adı", labelEn: "Chief Officer Name", type: "text" },
    ],
  },
  {
    id: "manifest",
    nameTr: "Yük Manifestosu (Cargo Manifest)",
    nameEn: "Cargo Manifest",
    abbreviation: "MANIFEST",
    descriptionTr: "Gemideki tüm yüklerin özet listesi",
    descriptionEn: "Summary list of all cargo on board the vessel",
    category: "post-voyage",
    fields: [
      { key: "vesselName", labelTr: "Gemi Adı", labelEn: "Vessel Name", type: "text", autoFillSource: "vessel", autoFillKey: "vesselName", required: true },
      { key: "imoNumber", labelTr: "IMO Numarası", labelEn: "IMO Number", type: "text", autoFillSource: "vessel", autoFillKey: "imoNumber" },
      { key: "voyageNumber", labelTr: "Sefer Numarası", labelEn: "Voyage Number", type: "text" },
      { key: "blNumber", labelTr: "B/L Numarası", labelEn: "B/L Number", type: "text", required: true },
      { key: "shipper", labelTr: "Yükleyici (Shipper)", labelEn: "Shipper", type: "text", required: true },
      { key: "consignee", labelTr: "Alıcı (Consignee)", labelEn: "Consignee", type: "text", required: true },
      { key: "cargoDescription", labelTr: "Yük Tanımı", labelEn: "Cargo Description", type: "text", autoFillSource: "cargo", autoFillKey: "cargoName", required: true },
      { key: "weight", labelTr: "Ağırlık (MT)", labelEn: "Weight (MT)", type: "number", autoFillSource: "cargo", autoFillKey: "weightMt", required: true },
      { key: "measurement", labelTr: "Hacim (M³)", labelEn: "Measurement (M³)", type: "number", autoFillSource: "cargo", autoFillKey: "volumeCbm" },
      { key: "portOfLoading", labelTr: "Yükleme Limanı", labelEn: "Port of Loading", type: "text" },
      { key: "portOfDischarge", labelTr: "Boşaltma Limanı", labelEn: "Port of Discharge", type: "text" },
    ],
  },

  // ── CHECKLISTS ───────────────────────────────────────────
  {
    id: "port-entry",
    nameTr: "Liman Giriş Belgeleri Listesi",
    nameEn: "Port Entry Checklist",
    abbreviation: "ENTRY",
    descriptionTr: "Limana giriş için gerekli belgelerin kontrol listesi",
    descriptionEn: "Checklist of documents required for port entry",
    category: "checklist",
    checklist: [
      { key: "crewList", labelTr: "Mürettebat Listesi (Crew List)", labelEn: "Crew List" },
      { key: "shipCertificates", labelTr: "Gemi Sertifikaları (Ship Certificates)", labelEn: "Ship Certificates" },
      { key: "lastPortClearance", labelTr: "Son Liman Çıkış İzni (Last Port Clearance)", labelEn: "Last Port Clearance" },
      { key: "healthDeclaration", labelTr: "Sağlık Beyannamesi (Maritime Declaration of Health)", labelEn: "Health Declaration" },
      { key: "customsDeclaration", labelTr: "Gümrük Beyannamesi (Customs Declaration)", labelEn: "Customs Declaration" },
      { key: "cargoDocuments", labelTr: "Yük Belgeleri (Cargo Documents)", labelEn: "Cargo Documents" },
      { key: "ispsCertificate", labelTr: "ISPS Sertifikası (ISPS Certificate)", labelEn: "ISPS Certificate" },
      { key: "wasteDeclaration", labelTr: "Atık Beyannamesi (Waste Declaration)", labelEn: "Waste Declaration" },
      { key: "insuranceCertificate", labelTr: "Sigorta Sertifikası (Insurance Certificate)", labelEn: "Insurance Certificate" },
      { key: "tonnageCertificate", labelTr: "Tonaj Belgesi (Tonnage Certificate)", labelEn: "Tonnage Certificate" },
    ],
  },
  {
    id: "port-exit",
    nameTr: "Liman Çıkış Belgeleri Listesi",
    nameEn: "Port Exit Checklist",
    abbreviation: "EXIT",
    descriptionTr: "Limandan çıkış için gerekli belgelerin kontrol listesi",
    descriptionEn: "Checklist of documents required for port departure",
    category: "checklist",
    checklist: [
      { key: "portClearance", labelTr: "Liman Çıkış İzni (Port Clearance)", labelEn: "Port Clearance" },
      { key: "blCopies", labelTr: "B/L Kopyaları (B/L Copies)", labelEn: "B/L Copies" },
      { key: "sofSigned", labelTr: "İmzalı SOF (SOF Signed)", labelEn: "SOF Signed" },
      { key: "cargoDocuments", labelTr: "Yük Belgeleri (Cargo Documents)", labelEn: "Cargo Documents" },
      { key: "customsClearance", labelTr: "Gümrük Çıkışı (Customs Clearance)", labelEn: "Customs Clearance" },
      { key: "portDuesReceipt", labelTr: "Liman Harçları Makbuzu (Port Dues Receipt)", labelEn: "Port Dues Receipt" },
      { key: "bunkerReceipts", labelTr: "Yakıt İkmal Makbuzu (Bunker Receipts)", labelEn: "Bunker Receipts" },
      { key: "crewChangeDocs", labelTr: "Mürettebat Değişim Belgeleri (Crew Change Documents)", labelEn: "Crew Change Documents" },
    ],
  },
];

export function getTemplateById(id: string): DocumentTemplate | undefined {
  return documentTemplates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: DocumentCategory): DocumentTemplate[] {
  return documentTemplates.filter((t) => t.category === category);
}

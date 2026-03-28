/**
 * Feasibility report export.
 *
 * Two export modes:
 *  - shareReportAsText(): react-native Share API (pure JS, always works)
 *  - shareReportAsPdf():  expo-print → PDF, expo-sharing → share sheet
 */

import { Share } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { FeasibilityResult, FlagDetail } from "@/features/feasibility/feasibilitySchemas";

// ── Shared types ────────────────────────────────────────────────────────────

export interface ReportData {
  result: FeasibilityResult;
  vessel: {
    vesselName: string;
    imoNumber: string;
    vesselType: string;
    coatingType: string;
    flag: string | null;
    dwtCapacity: number;
  };
  cargo: {
    cargoName: string;
    cargoType: string;
    weightMt: number;
    hazardClass: string;
    temperatureControl: boolean;
  };
  labels: {
    reportTitle: string;
    dateLabel: string;
    reportIdLabel: string;
    vesselLabel: string;
    cargoLabel: string;
    vesselNameLabel: string;
    imoLabel: string;
    vesselTypeLabel: string;
    coatingLabel: string;
    flagLabel: string;
    dwtLabel: string;
    cargoNameLabel: string;
    cargoTypeLabel: string;
    weightLabel: string;
    hazardLabel: string;
    tempControlLabel: string;
    overallScoreLabel: string;
    ftsLabel: string;
    notFtsLabel: string;
    complianceLabel: string;
    hullLabel: string;
    thermalLabel: string;
    ecaLabel: string;
    findingsLabel: string;
    disclaimerText: string;
    yesLabel: string;
    noLabel: string;
  };
}

// ── Shared helpers ──────────────────────────────────────────────────────────

function formatDate(): string {
  return new Date().toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Text export (Share API) ─────────────────────────────────────────────────

function flagIcon(color: "green" | "yellow" | "red"): string {
  if (color === "green") return "\u2705";
  if (color === "yellow") return "\u26A0\uFE0F";
  return "\u274C";
}

function scoreBar(score: number): string {
  const filled = Math.round(score / 10);
  return "\u2588".repeat(filled) + "\u2591".repeat(10 - filled) + ` ${score}/100`;
}

function formatFindings(flagDetails: FlagDetail[]): string {
  if (flagDetails.length === 0) return "";
  return flagDetails
    .map((f) => `  ${flagIcon(f.color)} [${f.dimension}] ${f.message}`)
    .join("\n");
}

function buildTextReport(data: ReportData): string {
  const { result, vessel, cargo, labels } = data;
  const dateStr = formatDate();
  const reportId = result.id.substring(0, 8).toUpperCase();
  const isFts = result.ftsStatus === "FTS";
  const ftsText = isFts ? `\u2705 ${labels.ftsLabel}` : `\u274C ${labels.notFtsLabel}`;
  const sep = "\u2500".repeat(32);

  return [
    `\u2693 Y\u00FCK PORTF\u00D6Y\u00DC`,
    labels.reportTitle,
    `${labels.dateLabel}: ${dateStr}`,
    `${labels.reportIdLabel}: ${reportId}`,
    "",
    sep,
    `\u{1F6A2} ${labels.vesselLabel.toUpperCase()}`,
    sep,
    `${labels.vesselNameLabel}: ${vessel.vesselName}`,
    `${labels.imoLabel}: ${vessel.imoNumber}`,
    `${labels.vesselTypeLabel}: ${vessel.vesselType}`,
    `${labels.coatingLabel}: ${vessel.coatingType}`,
    `${labels.flagLabel}: ${vessel.flag || "\u2014"}`,
    `${labels.dwtLabel}: ${vessel.dwtCapacity.toLocaleString()} DWT`,
    "",
    sep,
    `\u{1F4E6} ${labels.cargoLabel.toUpperCase()}`,
    sep,
    `${labels.cargoNameLabel}: ${cargo.cargoName}`,
    `${labels.cargoTypeLabel}: ${cargo.cargoType}`,
    `${labels.weightLabel}: ${cargo.weightMt.toLocaleString()} MT`,
    `${labels.hazardLabel}: ${cargo.hazardClass}`,
    `${labels.tempControlLabel}: ${cargo.temperatureControl ? labels.yesLabel : labels.noLabel}`,
    "",
    sep,
    `\u{1F4CA} ${labels.overallScoreLabel.toUpperCase()}`,
    sep,
    "",
    `  ${result.overallScore}/100  ${ftsText}`,
    "",
    sep,
    labels.complianceLabel.toUpperCase(),
    sep,
    `${flagIcon(result.flags.hullIntegrity)} ${labels.hullLabel}: ${scoreBar(result.hullIntegrityScore)}`,
    `${flagIcon(result.flags.thermal)} ${labels.thermalLabel}: ${scoreBar(result.thermalScore)}`,
    `${flagIcon(result.flags.ecaCompliance)} ${labels.ecaLabel}: ${scoreBar(result.ecaComplianceScore)}`,
    "",
    sep,
    `\u{1F50D} ${labels.findingsLabel.toUpperCase()}`,
    sep,
    formatFindings(result.flagDetails),
    "",
    sep,
    `\u26A0\uFE0F ${labels.disclaimerText}`,
    sep,
    "",
    `Y\u00FCk Portf\u00F6y\u00FC \u00B7 ${dateStr}`,
  ].join("\n");
}

export async function shareReportAsText(data: ReportData): Promise<void> {
  const message = buildTextReport(data);
  await Share.share({ message, title: data.labels.reportTitle });
}

// ── PDF export (expo-print + expo-sharing) ──────────────────────────────────

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function scoreColor(score: number): string {
  if (score >= 75) return "#2dd4a8";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

function flagColorHex(color: "green" | "yellow" | "red"): string {
  if (color === "green") return "#2dd4a8";
  if (color === "yellow") return "#f59e0b";
  return "#ef4444";
}

function flagDot(color: "green" | "yellow" | "red"): string {
  return `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${flagColorHex(color)};margin-right:8px;"></span>`;
}

function buildComplianceRow(
  label: string,
  score: number,
  color: "green" | "yellow" | "red"
): string {
  return `<tr>
    <td style="padding:10px 12px;border-bottom:1px solid #1e3055;color:#f0f4f8;font-size:13px;">
      ${flagDot(color)}${escapeHtml(label)}
    </td>
    <td style="padding:10px 12px;border-bottom:1px solid #1e3055;text-align:right;">
      <span style="color:${scoreColor(score)};font-weight:700;font-size:16px;">${score}</span>
      <span style="color:#8899aa;font-size:11px;">/100</span>
    </td>
  </tr>`;
}

function buildFindingsHtml(flagDetails: FlagDetail[]): string {
  if (flagDetails.length === 0) return "";
  return flagDetails
    .map(
      (f) => `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #1e3055;vertical-align:top;">
          ${flagDot(f.color)}
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #1e3055;color:#8899aa;font-size:11px;white-space:nowrap;vertical-align:top;">
          ${escapeHtml(f.dimension)}
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #1e3055;color:#f0f4f8;font-size:12px;vertical-align:top;">
          ${escapeHtml(f.message)}
        </td>
      </tr>`
    )
    .join("");
}

function buildHtml(data: ReportData): string {
  const { result, vessel, cargo, labels } = data;
  const dateStr = formatDate();
  const reportId = result.id.substring(0, 8).toUpperCase();
  const isFts = result.ftsStatus === "FTS";
  const ftsColor = isFts ? "#2dd4a8" : "#ef4444";
  const ftsText = isFts ? labels.ftsLabel : labels.notFtsLabel;
  const flagDisplay = vessel.flag || "\u2014";

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    background: #0a1628;
    color: #f0f4f8;
    padding: 32px;
    font-size: 13px;
    line-height: 1.5;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #2dd4a8;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .header-left h1 { font-size: 20px; font-weight: 700; color: #f0f4f8; margin-bottom: 2px; }
  .header-left .subtitle { font-size: 12px; color: #2dd4a8; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
  .header-right { text-align: right; color: #8899aa; font-size: 11px; }
  .header-right .report-id { font-family: monospace; color: #f0f4f8; font-size: 12px; }
  .card {
    background: #152040;
    border: 1px solid #1e3055;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
  }
  .card-title {
    font-size: 10px; color: #8899aa; text-transform: uppercase;
    letter-spacing: 1.5px; margin-bottom: 12px; font-weight: 600;
  }
  .info-item { display: flex; justify-content: space-between; padding: 4px 0; }
  .info-label { color: #8899aa; font-size: 12px; }
  .info-value { color: #f0f4f8; font-size: 12px; font-weight: 600; text-align: right; }
  .score-section { text-align: center; padding: 20px; }
  .score-number { font-size: 56px; font-weight: 800; line-height: 1; }
  .score-label { font-size: 11px; color: #8899aa; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
  .fts-badge {
    display: inline-block; padding: 6px 20px; border-radius: 4px;
    font-size: 13px; font-weight: 700; letter-spacing: 1px; margin-top: 12px;
  }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  table { width: 100%; border-collapse: collapse; }
  .disclaimer {
    margin-top: 24px; padding: 12px 16px;
    border-left: 3px solid #f59e0b;
    background: rgba(245, 158, 11, 0.08);
    border-radius: 0 4px 4px 0;
    color: #8899aa; font-size: 11px; line-height: 1.6;
  }
  .footer {
    margin-top: 24px; text-align: center; color: #8899aa;
    font-size: 10px; border-top: 1px solid #1e3055; padding-top: 12px;
  }
</style>
</head>
<body>

<div class="header">
  <div class="header-left">
    <h1>Y\u00FCk Portf\u00F6y\u00FC</h1>
    <div class="subtitle">${escapeHtml(labels.reportTitle)}</div>
  </div>
  <div class="header-right">
    <div>${escapeHtml(labels.dateLabel)}: ${dateStr}</div>
    <div>${escapeHtml(labels.reportIdLabel)}: <span class="report-id">${reportId}</span></div>
  </div>
</div>

<div class="two-col">
  <div class="card">
    <div class="card-title">${escapeHtml(labels.vesselLabel)}</div>
    <div class="info-item"><span class="info-label">${escapeHtml(labels.vesselNameLabel)}</span><span class="info-value">${escapeHtml(vessel.vesselName)}</span></div>
    <div class="info-item"><span class="info-label">${escapeHtml(labels.imoLabel)}</span><span class="info-value">${escapeHtml(vessel.imoNumber)}</span></div>
    <div class="info-item"><span class="info-label">${escapeHtml(labels.vesselTypeLabel)}</span><span class="info-value">${escapeHtml(vessel.vesselType)}</span></div>
    <div class="info-item"><span class="info-label">${escapeHtml(labels.coatingLabel)}</span><span class="info-value">${escapeHtml(vessel.coatingType)}</span></div>
    <div class="info-item"><span class="info-label">${escapeHtml(labels.flagLabel)}</span><span class="info-value">${escapeHtml(flagDisplay)}</span></div>
    <div class="info-item"><span class="info-label">${escapeHtml(labels.dwtLabel)}</span><span class="info-value">${vessel.dwtCapacity.toLocaleString()} DWT</span></div>
  </div>
  <div class="card">
    <div class="card-title">${escapeHtml(labels.cargoLabel)}</div>
    <div class="info-item"><span class="info-label">${escapeHtml(labels.cargoNameLabel)}</span><span class="info-value">${escapeHtml(cargo.cargoName)}</span></div>
    <div class="info-item"><span class="info-label">${escapeHtml(labels.cargoTypeLabel)}</span><span class="info-value">${escapeHtml(cargo.cargoType)}</span></div>
    <div class="info-item"><span class="info-label">${escapeHtml(labels.weightLabel)}</span><span class="info-value">${cargo.weightMt.toLocaleString()} MT</span></div>
    <div class="info-item"><span class="info-label">${escapeHtml(labels.hazardLabel)}</span><span class="info-value">${escapeHtml(cargo.hazardClass)}</span></div>
    <div class="info-item"><span class="info-label">${escapeHtml(labels.tempControlLabel)}</span><span class="info-value">${cargo.temperatureControl ? labels.yesLabel : labels.noLabel}</span></div>
  </div>
</div>

<div class="card">
  <div class="score-section">
    <div class="score-number" style="color:${scoreColor(result.overallScore)}">${result.overallScore}</div>
    <div class="score-label">${escapeHtml(labels.overallScoreLabel)}</div>
    <div class="fts-badge" style="background:${ftsColor}22;color:${ftsColor};border:1px solid ${ftsColor}">
      ${escapeHtml(ftsText)}
    </div>
  </div>
</div>

<div class="card">
  <div class="card-title">${escapeHtml(labels.complianceLabel)}</div>
  <table>
    ${buildComplianceRow(labels.hullLabel, result.hullIntegrityScore, result.flags.hullIntegrity)}
    ${buildComplianceRow(labels.thermalLabel, result.thermalScore, result.flags.thermal)}
    ${buildComplianceRow(labels.ecaLabel, result.ecaComplianceScore, result.flags.ecaCompliance)}
  </table>
</div>

<div class="card">
  <div class="card-title">${escapeHtml(labels.findingsLabel)}</div>
  <table>${buildFindingsHtml(result.flagDetails)}</table>
</div>

<div class="disclaimer">${escapeHtml(labels.disclaimerText)}</div>

<div class="footer">Y\u00FCk Portf\u00F6y\u00FC \u00B7 ${dateStr}</div>

</body>
</html>`;
}

export async function shareReportAsPdf(data: ReportData): Promise<void> {
  const html = buildHtml(data);
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: data.labels.reportTitle,
    UTI: "com.adobe.pdf",
  });
}

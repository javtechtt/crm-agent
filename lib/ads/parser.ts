import * as XLSX from "xlsx";

import { classifyProductAngle } from "@/lib/ads/classification";
import type {
  NormalizedAdRow,
  ParseReportResult,
  RawAdRow,
} from "@/lib/ads/types";

const aliases = {
  campaignName: ["campaignname"],
  adSetName: ["adsetname"],
  adName: ["adname"],
  spend: ["amountspent", "spend"],
  results: ["results"],
  costPerResult: ["costperresult"],
  impressions: ["impressions"],
  reach: ["reach"],
  frequency: ["frequency"],
  clicks: ["linkclicks", "clicks"],
  ctr: ["linkctr", "ctr"],
  cpc: ["cpc"],
  cpm: ["cpm"],
  date: ["date", "day", "reportingstarts", "reportingstart"],
  reportingEnd: ["reportingends", "reportingend"],
} as const;

function keyName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findValue(row: RawAdRow, names: readonly string[]) {
  const entry = Object.entries(row).find(([key]) => names.includes(keyName(key)));
  return entry?.[1];
}

function asText(value: unknown) {
  const text = value == null ? "" : String(value).trim();
  return text || null;
}

function asNumber(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value == null || value === "") return 0;
  const normalized = String(value).replace(/[$,%\s,]/g, "");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function asDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value;
  if (value == null || value === "") return null;
  const date = new Date(String(value));
  return Number.isNaN(date.valueOf()) ? null : date;
}

function jsonSafeRow(row: RawAdRow): RawAdRow {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [
      key,
      value instanceof Date ? value.toISOString() : value,
    ]),
  );
}

function normalizeRow(row: RawAdRow): NormalizedAdRow | null {
  const campaignName = asText(findValue(row, aliases.campaignName));
  const adSetName = asText(findValue(row, aliases.adSetName));
  const adName = asText(findValue(row, aliases.adName));

  if (!campaignName && !adSetName && !adName) return null;

  const spend = asNumber(findValue(row, aliases.spend));
  const results = asNumber(findValue(row, aliases.results));
  const impressions = Math.round(asNumber(findValue(row, aliases.impressions)));
  const reach = Math.round(asNumber(findValue(row, aliases.reach)));
  const clicks = Math.round(asNumber(findValue(row, aliases.clicks)));
  const importedCost = asNumber(findValue(row, aliases.costPerResult));

  return {
    date: asDate(findValue(row, aliases.date)),
    reportingEnd: asDate(findValue(row, aliases.reportingEnd)),
    campaignName,
    adSetName,
    adName,
    productAngle: classifyProductAngle(campaignName, adSetName, adName),
    spend,
    impressions,
    reach,
    frequency: asNumber(findValue(row, aliases.frequency)),
    clicks,
    ctr: asNumber(findValue(row, aliases.ctr)),
    cpc: asNumber(findValue(row, aliases.cpc)) || (clicks ? spend / clicks : 0),
    cpm:
      asNumber(findValue(row, aliases.cpm)) ||
      (impressions ? (spend / impressions) * 1000 : 0),
    results,
    costPerResult: importedCost || (results ? spend / results : 0),
    rawDataJson: jsonSafeRow(row),
  };
}

export function parseAdsReport(
  buffer: ArrayBuffer,
  fileName: string,
): ParseReportResult {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (extension !== "csv" && extension !== "xlsx") {
    throw new Error("Only CSV and XLSX Meta Ads reports are supported.");
  }

  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
    raw: extension === "xlsx",
  });
  const firstSheet = workbook.SheetNames[0];
  if (!firstSheet) throw new Error("The uploaded report does not contain a worksheet.");

  const rawRows = XLSX.utils.sheet_to_json<RawAdRow>(workbook.Sheets[firstSheet], {
    defval: null,
    raw: false,
  });
  const rows: NormalizedAdRow[] = [];
  const errors: string[] = [];
  let skippedRows = 0;

  rawRows.forEach((row, index) => {
    try {
      const normalized = normalizeRow(row);
      if (normalized) rows.push(normalized);
      else skippedRows += 1;
    } catch (error) {
      skippedRows += 1;
      if (errors.length < 10) {
        errors.push(
          `Row ${index + 2}: ${error instanceof Error ? error.message : "Unable to parse row"}`,
        );
      }
    }
  });

  if (rows.length === 0) {
    throw new Error("No ad rows with campaign, ad set, or ad names were found.");
  }

  return { rows, skippedRows, errors };
}

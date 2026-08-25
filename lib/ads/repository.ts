import { desc, eq, inArray } from "drizzle-orm";

import { buildAdsAnalysis } from "@/lib/ads/analysis";
import { createDatabaseConnection } from "@/lib/db/client";
import { adInsightRows, aiAnalyses, uploadedReports } from "@/lib/db/schema";
import type { NormalizedAdRow } from "@/lib/ads/types";

function toDatabaseRow(row: NormalizedAdRow) {
  return {
    date: row.date,
    campaignName: row.campaignName,
    adSetName: row.adSetName,
    adName: row.adName,
    productAngle: row.productAngle,
    spend: row.spend,
    impressions: row.impressions,
    reach: row.reach,
    frequency: row.frequency,
    clicks: row.clicks,
    ctr: row.ctr,
    cpc: row.cpc,
    cpm: row.cpm,
    results: row.results,
    costPerResult: row.costPerResult,
    rawDataJson: row.rawDataJson,
  };
}

export async function importAdsReport(input: {
  fileName: string;
  rows: NormalizedAdRow[];
  notes?: string;
}) {
  const { db, pool } = createDatabaseConnection();
  try {
    return await db.transaction(async (tx) => {
      const startDates = input.rows.flatMap((row) => (row.date ? [row.date.valueOf()] : []));
      const endDates = input.rows.flatMap((row) =>
        row.reportingEnd || row.date ? [(row.reportingEnd || row.date)!.valueOf()] : [],
      );
      const [report] = await tx
        .insert(uploadedReports)
        .values({
          fileName: input.fileName,
          rowCount: input.rows.length,
          dateStart: startDates.length ? new Date(Math.min(...startDates)) : null,
          dateEnd: endDates.length ? new Date(Math.max(...endDates)) : null,
          notes: input.notes || null,
        })
        .returning();

      for (let index = 0; index < input.rows.length; index += 500) {
        await tx.insert(adInsightRows).values(
          input.rows.slice(index, index + 500).map((row) => ({
            uploadedReportId: report.id,
            ...toDatabaseRow(row),
          })),
        );
      }
      return report;
    });
  } finally {
    await pool.end();
  }
}

export async function getReports(limit = 20) {
  const { db, pool } = createDatabaseConnection();
  try {
    return await db
      .select()
      .from(uploadedReports)
      .orderBy(desc(uploadedReports.uploadedAt))
      .limit(limit);
  } finally {
    await pool.end();
  }
}

export async function getRecentAnalyses(limit = 10) {
  const { db, pool } = createDatabaseConnection();
  try {
    return await db
      .select()
      .from(aiAnalyses)
      .orderBy(desc(aiAnalyses.createdAt))
      .limit(limit);
  } finally {
    await pool.end();
  }
}

export async function getInsightRows(reportIds?: string[]) {
  const { db, pool } = createDatabaseConnection();
  try {
    const query = db.select().from(adInsightRows);
    return reportIds?.length
      ? await query.where(inArray(adInsightRows.uploadedReportId, reportIds))
      : await query;
  } finally {
    await pool.end();
  }
}

export async function getReport(reportId: string) {
  const { db, pool } = createDatabaseConnection();
  try {
    const [report] = await db
      .select()
      .from(uploadedReports)
      .where(eq(uploadedReports.id, reportId))
      .limit(1);
    return report ?? null;
  } finally {
    await pool.end();
  }
}

export async function getAdsDashboardData() {
  const [reports, analyses, rows] = await Promise.all([
    getReports(8),
    getRecentAnalyses(6),
    getInsightRows(),
  ]);
  return { reports, analyses, summary: buildAdsAnalysis(rows) };
}

export async function saveAnalysis(input: {
  reportId?: string;
  question: string;
  answer: string;
  summary: ReturnType<typeof buildAdsAnalysis>;
  userId: string;
}) {
  const { db, pool } = createDatabaseConnection();
  try {
    const [analysis] = await db
      .insert(aiAnalyses)
      .values({
        uploadedReportId: input.reportId || null,
        question: input.question,
        answer: input.answer,
        summaryJson: input.summary,
        createdByUserId: input.userId,
      })
      .returning();
    return analysis;
  } finally {
    await pool.end();
  }
}

import { notFound } from "next/navigation";

import { CampaignTable } from "@/components/ads/campaign-table";
import { money, number, shortDate } from "@/components/ads/format";
import { MetricCard } from "@/components/ads/metric-card";
import { PageHeading } from "@/components/ads/page-heading";
import { buildAdsAnalysis } from "@/lib/ads/analysis";
import { getInsightRows, getReport } from "@/lib/ads/repository";

export const dynamic = "force-dynamic";

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [report, rows] = await Promise.all([getReport(id), getInsightRows([id])]);
  if (!report) notFound();
  const summary = buildAdsAnalysis(rows);
  return <><PageHeading eyebrow="Imported report" title={report.fileName} description={`${report.rowCount} rows · ${shortDate(report.dateStart)} to ${shortDate(report.dateEnd)} · Meta Ads upload`} action={<a href={`/dashboard?reportId=${report.id}`} className="rounded-xl bg-[#173f2a] px-5 py-2.5 text-sm font-semibold text-white">Analyze this report</a>} />
    <div className="grid gap-4 sm:grid-cols-3"><MetricCard label="Spend" value={money(summary.totals.spend)} /><MetricCard label="Results" value={number(summary.totals.results)} /><MetricCard label="Average CPR" value={money(summary.totals.costPerResult)} /></div>
    <section className="mt-8 overflow-hidden rounded-2xl border border-emerald-950/10 bg-white"><CampaignTable campaigns={summary.campaigns} /></section>
  </>;
}

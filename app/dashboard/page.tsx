import { CommandCenter } from "@/components/ads/command-center";
import { MetricCard } from "@/components/ads/metric-card";
import { PageHeading } from "@/components/ads/page-heading";
import { money, number } from "@/components/ads/format";
import { getAdsDashboardData } from "@/lib/ads/repository";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ reportId?: string }> }) {
  const { reportId } = await searchParams;
  const { reports, analyses, summary } = await getAdsDashboardData();

  return (
    <>
      <PageHeading eyebrow="AI-first business operations" title="AI Command Center" description="Ask practical questions across imported Meta Ads performance. CRM Agent balances efficiency, response volume, product variety, support activity, and creative fatigue." />
      <CommandCenter reports={reports} initialReportId={reportId} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Spend analyzed" value={money(summary.totals.spend)} detail={`${reports.length} recent imports`} />
        <MetricCard label="Total results" value={number(summary.totals.results)} detail="Lead/message results" />
        <MetricCard label="Average CPR" value={money(summary.totals.costPerResult)} detail="Not confirmed profitability" />
        <MetricCard label="Strongest angle" value={summary.bestProductByCost?.displayName ?? "No data"} detail={summary.bestProductByCost ? `${money(summary.bestProductByCost.costPerResult)} per result` : "Upload a report to begin"} />
      </div>
      {analyses.length ? <section className="mt-8 rounded-2xl border border-emerald-950/10 bg-white p-6"><h2 className="text-lg font-semibold">Recent AI analyses</h2><div className="mt-4 space-y-4">{analyses.map((analysis) => <article key={analysis.id} className="border-l-2 border-lime-500 pl-4"><p className="font-medium">{analysis.question}</p><p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-600">{analysis.answer}</p></article>)}</div></section> : null}
    </>
  );
}

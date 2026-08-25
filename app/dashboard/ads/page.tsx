import { CampaignTable } from "@/components/ads/campaign-table";
import { money, number } from "@/components/ads/format";
import { MetricCard } from "@/components/ads/metric-card";
import { PageHeading } from "@/components/ads/page-heading";
import { ProductChart } from "@/components/ads/product-chart";
import { getAdsDashboardData } from "@/lib/ads/repository";

export const dynamic = "force-dynamic";

export default async function AdsIntelligencePage() {
  const { reports, analyses, summary } = await getAdsDashboardData();
  return <>
    <PageHeading eyebrow="Uploaded Meta reports" title="Ads Intelligence" description="A practical view of response efficiency, volume, plant-based product demand, and campaign health. No live Meta Ads API is connected yet." />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <MetricCard label="Total spend" value={money(summary.totals.spend)} />
      <MetricCard label="Total results" value={number(summary.totals.results)} />
      <MetricCard label="Average CPR" value={money(summary.totals.costPerResult)} />
      <MetricCard label="Best angle" value={summary.bestProductByCost?.displayName ?? "No data"} />
      <MetricCard label="Weakest angle" value={summary.weakestProductByCost?.displayName ?? "No data"} />
    </div>
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.7fr]">
      <section className="rounded-2xl border border-emerald-950/10 bg-white p-6"><h2 className="text-lg font-semibold">Plant-based product comparison</h2><div className="mt-6"><ProductChart products={summary.products} /></div></section>
      <section className="rounded-2xl border border-emerald-950/10 bg-[#e8f0e8] p-6"><h2 className="text-lg font-semibold">Operator recommendations</h2><div className="mt-4 space-y-3">{summary.recommendations.map((item) => <p key={item} className="rounded-xl bg-white/70 p-4 text-sm leading-6">{item}</p>)}</div><p className="mt-4 text-xs leading-5 text-zinc-600">{summary.dataNotice}</p></section>
    </div>
    <section className="mt-8 rounded-2xl border border-emerald-950/10 bg-white"><div className="flex items-center justify-between p-6"><h2 className="text-lg font-semibold">Campaign performance</h2><span className="text-sm text-zinc-500">{reports.length} imports · {analyses.length} analyses</span></div><CampaignTable campaigns={summary.campaigns.slice(0, 10)} /></section>
  </>;
}

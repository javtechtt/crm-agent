import { money, number, percent } from "@/components/ads/format";
import { PageHeading } from "@/components/ads/page-heading";
import { ProductChart } from "@/components/ads/product-chart";
import { getInsightRows } from "@/lib/ads/repository";
import { buildAdsAnalysis } from "@/lib/ads/analysis";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const summary = buildAdsAnalysis(await getInsightRows());
  return <><PageHeading eyebrow="Plant-based portfolio" title="Product Performance" description="Compare how each plant-based product angle contributes to response volume and efficiency." />
    <section className="rounded-2xl border border-emerald-950/10 bg-white p-6"><ProductChart products={summary.products} /></section>
    <div className="mt-6 grid gap-4 xl:grid-cols-2">{summary.products.map((product) => <article key={product.productAngle} className="rounded-2xl border border-emerald-950/10 bg-white p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Product angle</p><h2 className="mt-1 text-xl font-semibold">{product.displayName}</h2></div><p className="text-2xl font-semibold text-emerald-800">{money(product.costPerResult)} <span className="text-xs font-normal text-zinc-500">CPR</span></p></div><dl className="mt-6 grid grid-cols-3 gap-4 text-sm"><div><dt className="text-zinc-500">Spend</dt><dd className="mt-1 font-semibold">{money(product.spend)}</dd></div><div><dt className="text-zinc-500">Results</dt><dd className="mt-1 font-semibold">{number(product.results)}</dd></div><div><dt className="text-zinc-500">Impressions</dt><dd className="mt-1 font-semibold">{number(product.impressions)}</dd></div><div><dt className="text-zinc-500">Reach</dt><dd className="mt-1 font-semibold">{number(product.reach)}</dd></div><div><dt className="text-zinc-500">Frequency</dt><dd className="mt-1 font-semibold">{number(product.frequency)}</dd></div><div><dt className="text-zinc-500">Clicks</dt><dd className="mt-1 font-semibold">{number(product.clicks)}</dd></div><div><dt className="text-zinc-500">CTR</dt><dd className="mt-1 font-semibold">{percent(product.ctr)}</dd></div><div><dt className="text-zinc-500">CPC</dt><dd className="mt-1 font-semibold">{money(product.cpc)}</dd></div><div><dt className="text-zinc-500">CPM</dt><dd className="mt-1 font-semibold">{money(product.cpm)}</dd></div></dl></article>)}</div>
  </>;
}

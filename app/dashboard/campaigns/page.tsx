import { CampaignTable } from "@/components/ads/campaign-table";
import { PageHeading } from "@/components/ads/page-heading";
import { buildAdsAnalysis } from "@/lib/ads/analysis";
import { getInsightRows } from "@/lib/ads/repository";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const summary = buildAdsAnalysis(await getInsightRows());
  return <><PageHeading eyebrow="Campaign-level decisions" title="Campaign Performance" description="Use AI status labels as decision support—not automatic budget instructions. Review response volume alongside cost." /><section className="overflow-hidden rounded-2xl border border-emerald-950/10 bg-white"><CampaignTable campaigns={summary.campaigns} /></section></>;
}

import type { CampaignPerformance } from "@/lib/ads/types";
import { productAngleLabel } from "@/lib/ads/classification";

import { money, number, percent } from "./format";

const statusColor: Record<CampaignPerformance["status"], string> = {
  "Scale Candidate": "bg-emerald-100 text-emerald-800",
  "Efficient but Limited": "bg-blue-100 text-blue-800",
  "Support Campaign": "bg-violet-100 text-violet-800",
  "Needs Refresh": "bg-amber-100 text-amber-800",
  Watch: "bg-zinc-100 text-zinc-700",
  "Pause Candidate": "bg-red-100 text-red-800",
  "Test More": "bg-cyan-100 text-cyan-800",
};

export function CampaignTable({ campaigns }: { campaigns: CampaignPerformance[] }) {
  if (!campaigns.length) {
    return <p className="py-10 text-center text-sm text-zinc-500">No campaign data imported yet.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] text-left text-sm">
        <thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3">Campaign</th><th className="px-4 py-3">Angle</th>
            <th className="px-4 py-3">Spend</th><th className="px-4 py-3">Results</th>
            <th className="px-4 py-3">CPR</th><th className="px-4 py-3">Impressions</th>
            <th className="px-4 py-3">CTR</th><th className="px-4 py-3">CPC</th>
            <th className="px-4 py-3">CPM</th><th className="px-4 py-3">AI status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {campaigns.map((campaign) => (
            <tr key={`${campaign.campaignName}-${campaign.productAngle}`} className="align-top hover:bg-zinc-50">
              <td className="max-w-xs px-4 py-4 font-medium">
                {campaign.campaignName}
                <p className="mt-1 text-xs font-normal leading-5 text-zinc-500">{campaign.recommendation}</p>
              </td>
              <td className="px-4 py-4">{productAngleLabel(campaign.productAngle)}</td>
              <td className="px-4 py-4">{money(campaign.spend)}</td>
              <td className="px-4 py-4">{number(campaign.results)}</td>
              <td className="px-4 py-4">{money(campaign.costPerResult)}</td>
              <td className="px-4 py-4">{number(campaign.impressions)}</td>
              <td className="px-4 py-4">{percent(campaign.ctr)}</td>
              <td className="px-4 py-4">{money(campaign.cpc)}</td>
              <td className="px-4 py-4">{money(campaign.cpm)}</td>
              <td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor[campaign.status]}`}>{campaign.status}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

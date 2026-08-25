import { productAngleLabel } from "@/lib/ads/classification";
import type {
  AdsAnalysisSummary,
  CampaignPerformance,
  CampaignStatus,
  NormalizedAdRow,
  PerformanceMetrics,
  ProductAngle,
} from "@/lib/ads/types";
import { PRODUCT_ANGLES } from "@/lib/ads/types";

type AnalysisRow = Pick<
  NormalizedAdRow,
  | "campaignName"
  | "productAngle"
  | "spend"
  | "results"
  | "impressions"
  | "reach"
  | "frequency"
  | "clicks"
  | "ctr"
  | "cpc"
  | "cpm"
>;

function round(value: number, places = 2) {
  const factor = 10 ** places;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function metrics(rows: AnalysisRow[]): PerformanceMetrics {
  const spend = rows.reduce((sum, row) => sum + Number(row.spend || 0), 0);
  const results = rows.reduce((sum, row) => sum + Number(row.results || 0), 0);
  const impressions = rows.reduce(
    (sum, row) => sum + Number(row.impressions || 0),
    0,
  );
  const reach = rows.reduce((sum, row) => sum + Number(row.reach || 0), 0);
  const clicks = rows.reduce((sum, row) => sum + Number(row.clicks || 0), 0);

  return {
    spend: round(spend),
    results: round(results),
    costPerResult: round(results ? spend / results : 0),
    impressions,
    reach,
    frequency: round(reach ? impressions / reach : 0),
    clicks,
    ctr: round(impressions ? (clicks / impressions) * 100 : 0),
    cpc: round(clicks ? spend / clicks : 0),
    cpm: round(impressions ? (spend / impressions) * 1000 : 0),
  };
}

function campaignStatus(
  performance: PerformanceMetrics,
  averages: { spend: number; results: number; ctr: number; cpr: number },
): { status: CampaignStatus; recommendation: string } {
  if (
    performance.spend > averages.spend * 1.25 &&
    (performance.results === 0 || performance.costPerResult > averages.cpr * 1.35)
  ) {
    return {
      status: "Pause Candidate",
      recommendation: "Reduce or pause spend while the offer and creative are reviewed.",
    };
  }
  if (
    performance.results > 0 &&
    performance.costPerResult <= averages.cpr * 0.8 &&
    performance.results < Math.max(averages.results * 0.75, 2)
  ) {
    return {
      status: "Efficient but Limited",
      recommendation: "Keep it active, but do not expect this campaign to carry total volume alone.",
    };
  }
  if (
    performance.results > 0 &&
    performance.costPerResult <= averages.cpr * 0.85 &&
    performance.results >= averages.results
  ) {
    return {
      status: "Scale Candidate",
      recommendation: "Increase cautiously while monitoring cost per result and frequency.",
    };
  }
  if (
    performance.frequency >= 3 ||
    (performance.impressions > 0 && performance.ctr < averages.ctr * 0.65)
  ) {
    return {
      status: "Needs Refresh",
      recommendation: "Test new creative or a refreshed hook before adding spend.",
    };
  }
  if (
    performance.spend <= averages.spend &&
    performance.results > 0 &&
    performance.results < averages.results
  ) {
    return {
      status: "Support Campaign",
      recommendation: "Use at a controlled budget to broaden product interest and response volume.",
    };
  }
  if (performance.results === 0 && performance.spend <= averages.spend * 0.5) {
    return {
      status: "Test More",
      recommendation: "The sample is small; collect more data before making a firm decision.",
    };
  }
  return {
    status: "Watch",
    recommendation: "Hold budget steady and review again after more results accumulate.",
  };
}

export function buildAdsAnalysis(rows: AnalysisRow[]): AdsAnalysisSummary {
  const totals = metrics(rows);
  const products = PRODUCT_ANGLES.map((productAngle) => ({
    productAngle,
    displayName: productAngleLabel(productAngle),
    ...metrics(rows.filter((row) => row.productAngle === productAngle)),
  }));
  const activeProducts = products.filter((product) => product.spend > 0);
  const efficientProducts = activeProducts.filter((product) => product.results > 0);
  const campaignGroups = new Map<string, AnalysisRow[]>();

  for (const row of rows) {
    const name = row.campaignName || "Unnamed campaign";
    campaignGroups.set(name, [...(campaignGroups.get(name) ?? []), row]);
  }

  const baseCampaigns = [...campaignGroups.entries()].map(([campaignName, data]) => ({
    campaignName,
    productAngle: data[0]?.productAngle ?? ("Other" as ProductAngle),
    ...metrics(data),
  }));
  const count = Math.max(baseCampaigns.length, 1);
  const averages = {
    spend: totals.spend / count,
    results: totals.results / count,
    ctr: totals.ctr,
    cpr: totals.costPerResult || Number.POSITIVE_INFINITY,
  };
  const campaigns: CampaignPerformance[] = baseCampaigns
    .map((campaign) => ({
      ...campaign,
      ...campaignStatus(campaign, averages),
    }))
    .sort((a, b) => b.spend - a.spend);

  const bestProductByCost =
    [...efficientProducts].sort((a, b) => a.costPerResult - b.costPerResult)[0] ??
    null;
  const bestProductByResults =
    [...activeProducts].sort((a, b) => b.results - a.results)[0] ?? null;
  const weakestProductByCost =
    [...efficientProducts].sort((a, b) => b.costPerResult - a.costPerResult)[0] ??
    null;
  const recommendations: string[] = [];

  if (bestProductByCost) {
    const limited =
      bestProductByResults &&
      bestProductByCost.productAngle !== bestProductByResults.productAngle;
    recommendations.push(
      limited
        ? `${bestProductByCost.displayName} is the most efficient angle, but it is not producing the most responses. Keep it as a lead campaign and retain smaller support campaigns for product variety and total volume.`
        : `${bestProductByCost.displayName} is currently the strongest efficiency signal. Scale carefully rather than making it the only active product angle.`,
    );
  }
  const pauseCandidates = campaigns.filter(
    (campaign) => campaign.status === "Pause Candidate",
  );
  if (pauseCandidates.length) {
    recommendations.push(
      `Review or pause ${pauseCandidates.map((campaign) => campaign.campaignName).join(", ")}; spend is high relative to response volume.`,
    );
  }
  const refreshCandidates = campaigns.filter(
    (campaign) => campaign.status === "Needs Refresh",
  );
  if (refreshCandidates.length) {
    recommendations.push(
      `Refresh creative for ${refreshCandidates.map((campaign) => campaign.campaignName).join(", ")} before increasing budget.`,
    );
  }
  if (!recommendations.length) {
    recommendations.push(
      "Keep budgets steady, gather more response data, and test one new creative or product angle at a time.",
    );
  }

  return {
    totals,
    products,
    campaigns,
    bestProductByCost,
    bestProductByResults,
    weakestProductByCost,
    recommendations,
    dataNotice:
      "This analysis measures Meta lead/message efficiency, not confirmed profitability. Order and revenue data are not included yet.",
  };
}

export function answerAdsQuestion(
  question: string,
  summary: AdsAnalysisSummary,
): string {
  if (summary.totals.spend === 0) {
    return "There is not enough spend data in the selected reports to make a reliable recommendation yet.";
  }

  const lead = summary.bestProductByCost;
  const volume = summary.bestProductByResults;
  const questionText = question.toLowerCase();
  const context = lead
    ? `${lead.displayName} has the lowest observed cost per result at $${lead.costPerResult.toFixed(2)} with ${lead.results} results.`
    : "No product angle has recorded a result yet.";
  let focused = summary.recommendations[0];

  if (questionText.includes("pause")) {
    const candidates = summary.campaigns.filter(
      (campaign) => campaign.status === "Pause Candidate",
    );
    focused = candidates.length
      ? `The clearest pause candidates are ${candidates.map((campaign) => campaign.campaignName).join(", ")}. They are using above-average spend without enough response volume.`
      : "There is no decisive pause candidate yet. Hold budgets steady and collect more results before cutting campaigns solely on a small sample.";
  } else if (questionText.includes("push") || questionText.includes("strongest")) {
    focused = lead
      ? `Lead with ${lead.displayName}, but keep controlled support activity across other plant-based product angles. Efficiency alone does not prove that one campaign can sustain total response volume.`
      : focused;
  } else if (
    questionText.includes("drop") ||
    questionText.includes("hotdog") ||
    questionText.includes("only")
  ) {
    focused =
      "A single efficient Plant-based Hotdog ad can still be volume-limited. Pausing the other plant-based product angles removes additional audiences, creative variety, and support demand, so total responses can fall even while Hotdog keeps the best unit cost.";
  } else if (questionText.includes("week") || questionText.includes("test next")) {
    focused = `${summary.recommendations.join(" ")} Run changes as controlled tests so the next report can separate creative impact from budget and audience changes.`;
  } else if (volume && lead && volume.productAngle !== lead.productAngle) {
    focused = `${lead.displayName} leads on efficiency, while ${volume.displayName} leads on total responses. Use the first as the efficiency anchor and the second as a volume/support campaign.`;
  }

  return `${context} ${focused} ${summary.dataNotice}`;
}

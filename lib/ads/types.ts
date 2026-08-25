export const PRODUCT_ANGLES = [
  "Hotdog",
  "Pepperoni",
  "Mince",
  "Parmesan",
  "Cashew Cheese",
  "Other",
] as const;

export type ProductAngle = (typeof PRODUCT_ANGLES)[number];

export type RawAdRow = Record<string, unknown>;

export interface NormalizedAdRow {
  date: Date | null;
  reportingEnd: Date | null;
  campaignName: string | null;
  adSetName: string | null;
  adName: string | null;
  productAngle: ProductAngle;
  spend: number;
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  results: number;
  costPerResult: number;
  rawDataJson: RawAdRow;
}

export interface ParseReportResult {
  rows: NormalizedAdRow[];
  skippedRows: number;
  errors: string[];
}

export interface PerformanceMetrics {
  spend: number;
  results: number;
  costPerResult: number;
  impressions: number;
  reach: number;
  frequency: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
}

export interface ProductPerformance extends PerformanceMetrics {
  productAngle: ProductAngle;
  displayName: string;
}

export type CampaignStatus =
  | "Scale Candidate"
  | "Efficient but Limited"
  | "Support Campaign"
  | "Needs Refresh"
  | "Watch"
  | "Pause Candidate"
  | "Test More";

export interface CampaignPerformance extends PerformanceMetrics {
  campaignName: string;
  productAngle: ProductAngle;
  status: CampaignStatus;
  recommendation: string;
}

export interface AdsAnalysisSummary {
  totals: PerformanceMetrics;
  products: ProductPerformance[];
  campaigns: CampaignPerformance[];
  bestProductByCost: ProductPerformance | null;
  bestProductByResults: ProductPerformance | null;
  weakestProductByCost: ProductPerformance | null;
  recommendations: string[];
  dataNotice: string;
}

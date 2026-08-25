import Link from "next/link";

import { shortDate } from "@/components/ads/format";
import { PageHeading } from "@/components/ads/page-heading";
import { UploadForm } from "@/components/ads/upload-form";
import { getReports } from "@/lib/ads/repository";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const reports = await getReports();
  return <>
    <PageHeading eyebrow="Source data" title="Imported Reports" description="Upload exported Meta Ads reports. CRM Agent normalizes common headers, preserves each original row, and classifies plant-based product angles." />
    <UploadForm />
    <section className="mt-8 overflow-hidden rounded-2xl border border-emerald-950/10 bg-white">
      <div className="border-b border-zinc-100 p-6"><h2 className="text-lg font-semibold">Import history</h2></div>
      {reports.length ? <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500"><tr><th className="px-5 py-3">File</th><th className="px-5 py-3">Uploaded</th><th className="px-5 py-3">Rows</th><th className="px-5 py-3">Date range</th><th className="px-5 py-3">Source</th><th className="px-5 py-3">Actions</th></tr></thead><tbody className="divide-y divide-zinc-100">{reports.map((report) => <tr key={report.id}><td className="px-5 py-4 font-medium">{report.fileName}</td><td className="px-5 py-4">{shortDate(report.uploadedAt)}</td><td className="px-5 py-4">{report.rowCount}</td><td className="px-5 py-4">{shortDate(report.dateStart)} – {shortDate(report.dateEnd)}</td><td className="px-5 py-4">Meta Ads upload</td><td className="px-5 py-4"><div className="flex gap-2"><Link href={`/dashboard/reports/${report.id}`} className="rounded-lg border border-zinc-200 px-3 py-1.5 font-medium">View</Link><Link href={`/dashboard?reportId=${report.id}`} className="rounded-lg bg-emerald-100 px-3 py-1.5 font-medium text-emerald-900">Analyze</Link></div></td></tr>)}</tbody></table></div> : <p className="p-8 text-center text-sm text-zinc-500">No reports imported yet.</p>}
    </section>
  </>;
}

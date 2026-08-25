"use client";

import { useState } from "react";

import type { AdsAnalysisSummary } from "@/lib/ads/types";
import { money, number } from "@/components/ads/format";

const prompts = ["What is working?", "What should I pause?", "Which product should I push?", "What should I run this week?"];

export function CommandCenter({ reports, initialReportId = "" }: { reports: Array<{ id: string; fileName: string }>; initialReportId?: string }) {
  const [question, setQuestion] = useState("");
  const [reportId, setReportId] = useState(initialReportId);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ answer: string; summary: AdsAnalysisSummary } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ask() {
    setLoading(true); setError(null);
    try {
      const response = await fetch("/api/admin/analysis", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question, reportId }) });
      const data = (await response.json()) as { analysis?: { answer: string }; summary?: AdsAnalysisSummary; error?: string };
      if (!response.ok || !data.analysis || !data.summary) throw new Error(data.error || "Analysis failed.");
      setResult({ answer: data.analysis.answer, summary: data.summary });
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Analysis failed."); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-[#10261a] p-6 text-white shadow-xl md:p-9">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-lime-300">Ask CRM Agent</p>
          <h2 className="mt-3 text-2xl font-semibold md:text-3xl">What should Kirvans Kitchen do next?</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-50/70">Ask about campaign efficiency, response volume, plant-based product angles, support campaigns, or what to test next.</p>
        </div>
        <div className="mt-6 rounded-2xl bg-white p-2 text-zinc-900">
          <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Example: Why did responses drop when I only ran the best Hotdog ad?" rows={3} className="w-full resize-none px-3 py-2 outline-none" />
          <div className="flex flex-col gap-2 border-t border-zinc-100 p-2 sm:flex-row sm:items-center sm:justify-between">
            <select value={reportId} onChange={(event) => setReportId(event.target.value)} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm">
              <option value="">All imported reports</option>
              {reports.map((report) => <option key={report.id} value={report.id}>{report.fileName}</option>)}
            </select>
            <button onClick={ask} disabled={loading || question.trim().length < 3} className="rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-semibold text-emerald-950 disabled:opacity-40">{loading ? "Analyzing…" : "Analyze business data"}</button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{prompts.map((prompt) => <button key={prompt} onClick={() => setQuestion(prompt)} className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-emerald-50 hover:bg-white/10">{prompt}</button>)}</div>
      </section>
      {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
      {result ? (
        <section className="rounded-3xl border border-emerald-950/10 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">CRM Agent recommendation</p>
          <p className="mt-4 max-w-4xl text-lg leading-8 text-zinc-700">{result.answer}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-zinc-50 p-4"><p className="text-xs text-zinc-500">Spend analyzed</p><p className="mt-1 text-xl font-semibold">{money(result.summary.totals.spend)}</p></div>
            <div className="rounded-xl bg-zinc-50 p-4"><p className="text-xs text-zinc-500">Results</p><p className="mt-1 text-xl font-semibold">{number(result.summary.totals.results)}</p></div>
            <div className="rounded-xl bg-zinc-50 p-4"><p className="text-xs text-zinc-500">Average CPR</p><p className="mt-1 text-xl font-semibold">{money(result.summary.totals.costPerResult)}</p></div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

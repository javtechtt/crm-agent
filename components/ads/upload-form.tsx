"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UploadForm() {
  const router = useRouter();
  const [state, setState] = useState<{ loading: boolean; message?: string; error?: string }>({ loading: false });

  async function submit(formData: FormData) {
    setState({ loading: true });
    try {
      const response = await fetch("/api/admin/reports", { method: "POST", body: formData });
      const result = (await response.json()) as { importedRows?: number; skippedRows?: number; error?: string };
      if (!response.ok) throw new Error(result.error || "Import failed.");
      setState({ loading: false, message: `Imported ${result.importedRows} rows; ${result.skippedRows} skipped.` });
      router.refresh();
    } catch (error) {
      setState({ loading: false, error: error instanceof Error ? error.message : "Import failed." });
    }
  }

  return (
    <form action={submit} className="rounded-2xl border border-emerald-950/10 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Upload Meta Ads report</h2>
      <p className="mt-1 text-sm text-zinc-500">CSV or XLSX, up to 15 MB. Original row data is preserved.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="text-sm font-medium">Report file
          <input name="file" type="file" accept=".csv,.xlsx" required className="mt-2 block w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-3 file:py-1.5 file:text-emerald-900" />
        </label>
        <label className="text-sm font-medium">Notes
          <input name="notes" placeholder="Optional context for this import" className="mt-2 block w-full rounded-xl border border-zinc-200 px-3 py-2.5 outline-none focus:border-emerald-600" />
        </label>
        <button disabled={state.loading} className="rounded-xl bg-[#173f2a] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{state.loading ? "Importing…" : "Import report"}</button>
      </div>
      {state.message ? <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{state.message}</p> : null}
      {state.error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{state.error}</p> : null}
    </form>
  );
}

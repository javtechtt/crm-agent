export function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <article className="rounded-2xl border border-emerald-950/10 bg-white p-5 shadow-[0_8px_30px_rgba(16,38,26,0.05)]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-[#143c28]">{value}</p>
      {detail ? <p className="mt-2 text-sm text-zinc-500">{detail}</p> : null}
    </article>
  );
}

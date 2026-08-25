import { SignOut } from "@neondatabase/auth-ui";

import { PageHeading } from "@/components/ads/page-heading";
import { requireAuthenticatedUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireAuthenticatedUser();
  return <><PageHeading eyebrow="Connections and access" title="Settings" description="Connection placeholders for upcoming phases. No live Meta Ads API or budget automation is enabled." />
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-emerald-950/10 bg-white p-6"><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Future connection</p><h2 className="mt-2 text-xl font-semibold">Meta Ads API</h2><p className="mt-3 text-sm leading-6 text-zinc-600">Report upload is active. Direct campaign sync, budget changes, and automation remain intentionally disconnected.</p><button disabled className="mt-5 rounded-xl bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-400">Connect Meta Ads (coming later)</button></section>
      <section className="rounded-2xl border border-emerald-950/10 bg-white p-6"><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Neon Auth account</p><h2 className="mt-2 text-xl font-semibold">Authenticated user</h2><p className="mt-3 text-sm text-zinc-600">{user.email || user.name || user.id}</p><p className="mt-1 font-mono text-xs text-zinc-400">User ID: {user.id}</p><div className="mt-5"><SignOut redirectTo="/login" /></div></section>
    </div>
  </>;
}

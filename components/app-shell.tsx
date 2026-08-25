import Link from "next/link";
import type { ReactNode } from "react";

const navigation = [
  ["AI Command Center", "/dashboard"],
  ["Ads Intelligence", "/dashboard/ads"],
  ["Campaigns", "/dashboard/campaigns"],
  ["Products", "/dashboard/products"],
  ["Reports", "/dashboard/reports"],
  ["Settings", "/dashboard/settings"],
] as const;

export function AppShell({
  children,
  userLabel,
}: {
  children: ReactNode;
  userLabel: string;
}) {
  return (
    <div className="min-h-screen bg-[#f4f5f1] text-[#172019]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-emerald-950/10 bg-[#10261a] px-5 py-7 text-white lg:block">
        <Link href="/dashboard" className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
            Kirvans Kitchen
          </span>
          <span className="mt-2 block text-2xl font-semibold">CRM Agent</span>
        </Link>
        <nav className="mt-10 space-y-1">
          {navigation.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="block rounded-xl px-3 py-2.5 text-sm text-emerald-50/80 transition hover:bg-white/10 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="absolute inset-x-5 bottom-6 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-emerald-50/70">
          <p className="font-medium text-white">Signed in</p>
          <p className="mt-1 truncate">{userLabel}</p>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="border-b border-emerald-950/10 bg-white/80 px-5 py-4 backdrop-blur lg:hidden">
          <div className="font-semibold">Kirvans Kitchen · CRM Agent</div>
          <nav className="mt-3 flex gap-4 overflow-x-auto text-sm">
            {navigation.map(([label, href]) => (
              <Link key={href} href={href} className="whitespace-nowrap text-emerald-800">
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto max-w-[1500px] p-5 md:p-8 lg:p-10">{children}</main>
      </div>
    </div>
  );
}

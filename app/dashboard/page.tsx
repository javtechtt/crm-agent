import { SignOut } from "@neondatabase/auth-ui";

import { requireAuthenticatedUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireAuthenticatedUser();

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
      <section className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-3xl font-semibold tracking-tight">CRM Dashboard</h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          Authenticated Neon user ID: {user.id}
        </p>
        <div className="mt-6">
          <SignOut redirectTo="/login" />
        </div>
      </section>
    </main>
  );
}

import { AuthView } from "@neondatabase/auth-ui";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const { data: session } = await auth.getSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
      <AuthView path="sign-in" redirectTo="/dashboard" />
    </main>
  );
}

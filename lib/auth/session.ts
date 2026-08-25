import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/server";

export async function requireAuthenticatedUser() {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return session.user;
}

export async function getAuthenticatedUser() {
  const { data: session } = await auth.getSession();
  return session?.user ?? null;
}

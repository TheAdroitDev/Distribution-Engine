import { cache } from "react";
import { headers } from "next/headers";
import { auth } from "./auth";
import { env } from "@/lib/validation/env";

// Request-scoped cached session lookup.
// Uses React cache() to ensure Better Auth lookup executes only once per request.
export const getCachedSession = cache(async () => {
  return await auth.api.getSession({
    headers: await headers(),
  });
});

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email || !env.ADMIN_EMAIL) return false;
  return email.trim().toLowerCase() === env.ADMIN_EMAIL.trim().toLowerCase();
};

export const getAdminSession = cache(async () => {
  const session = await getCachedSession();
  if (!session?.user?.email) return null;
  if (!isAdminEmail(session.user.email)) return null;
  return session;
});

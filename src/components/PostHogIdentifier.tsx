"use client";

import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

interface PostHogUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

export function PostHogIdentifier({ user }: { user?: PostHogUser | null }) {
  const posthog = usePostHog();

  useEffect(() => {
    if (posthog && user?.id) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.name ?? undefined,
      });
    }
  }, [posthog, user?.id, user?.email, user?.name]);

  return null;
}

"use client";

import posthog from "posthog-js";
import { env } from "~/env";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import dynamicLoader from "next/dynamic";

posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
  api_host: "/ph",
  ui_host: "https://us.posthog.com",
});

const SuspendedPostHogPageView = dynamicLoader(
  () => import("./pageview-tracker"),
  {
    ssr: false,
  },
);

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PHProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PHProvider>
  );
}

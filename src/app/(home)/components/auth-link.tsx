"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

/**
 * Link into the app whose label and target follow the visitor's auth state.
 *
 * Resolved on the client so the landing page can stay static and outside the
 * Clerk middleware. Until Clerk loads it renders the signed-out version,
 * which is also what crawlers see. Signed-in visitors go to /drive, which
 * redirects to their root folder or to onboarding.
 */
export function AuthLink({
  signedInLabel,
  signedOutLabel,
  icon,
  className,
}: {
  signedInLabel: string;
  signedOutLabel: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  const { isSignedIn } = useAuth();

  return (
    <Link href={isSignedIn ? "/drive" : "/sign-in"} className={className}>
      {isSignedIn ? signedInLabel : signedOutLabel}
      {icon}
    </Link>
  );
}

import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { BrandMark } from "~/components/brand-mark";
import { GridBackground } from "~/components/grid-background";

export const metadata = {
  title: "Sign in",
  // Signed-in surface: never index, and don't follow into it.
  robots: { index: false, follow: false },
};

export default async function SignInPage() {
  const session = await auth();
  if (session.userId) {
    return redirect("/drive");
  }

  return (
    <GridBackground className="flex flex-col items-center justify-center px-6 py-16">
      <div className="mb-10">
        <BrandMark />
      </div>

      <div className="w-full max-w-[400px]">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to pick up where you left off.
          </p>
        </div>

        {/* Gradient hairline: a 1px padded wrapper whose gradient shows
            through around the inner surface, bright at the top edge and
            fading toward the bottom. */}
        <div className="rounded-2xl bg-linear-to-b from-white/25 via-white/8 to-white/[0.03] p-px shadow-2xl shadow-black/70">
          <div className="overflow-hidden rounded-2xl bg-gray-950/85 backdrop-blur-xl">
        {/* Rendered in-page rather than on Clerk's hosted domain, so the
            form inherits the app's own surface and typography. */}
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-in"
          forceRedirectUrl="/drive"
          appearance={{
            variables: {
              colorPrimary: "#10b981",
              colorBackground: "transparent",
              colorForeground: "#f3f4f6",
              colorMutedForeground: "#9ca3af",
              colorInput: "rgba(17, 24, 39, 0.6)",
              colorInputForeground: "#f3f4f6",
              colorBorder: "rgba(31, 41, 55, 0.9)",
              colorNeutral: "#9ca3af",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
            },
            elements: {
              rootBox: "w-full",
              cardBox: "w-full border-0 bg-transparent shadow-none ring-0",
              card: "bg-transparent shadow-none px-7 pt-8 pb-6",
              header: "hidden",
              socialButtons: "gap-2",
              // Fill and hover live in globals.css; Clerk's own rule wins
              // over utility classes for background-color here.
              socialButtonsBlockButton:
                "border border-gray-700/70 text-gray-200 transition-colors",
              socialButtonsBlockButtonText: "font-medium",
              dividerLine: "bg-gray-800",
              dividerText: "text-gray-500",
              formFieldLabel: "text-gray-300",
              formFieldInput:
                "border border-gray-800 bg-gray-900/60 text-gray-100 placeholder:text-gray-600 focus:border-emerald-500/60",
              formButtonPrimary:
                "bg-white! text-gray-950! hover:bg-gray-100! font-semibold shadow-none normal-case",
              footer:
                "bg-gray-900/40 border-t border-gray-800/60 px-7 py-4 gap-2",
              footerAction: "bg-transparent",
              footerActionText: "text-gray-500",
              footerActionLink: "text-emerald-400 hover:text-emerald-300",
              identityPreview: "border border-gray-800 bg-gray-900/60",
              formResendCodeLink: "text-emerald-400",
            },
          }}
        />
          </div>
        </div>
      </div>
    </GridBackground>
  );
}

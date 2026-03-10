import { SignInButton } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-700 p-4 text-white">
      <main className="text-center">
        <SignInButton forceRedirectUrl={"/drive"}>
          <Button className="cursor-pointer rounded-lg border border-gray-700 bg-gray-600 text-white transition-colors hover:bg-gray-700">
            Sign In
          </Button>
        </SignInButton>
      </main>
      <footer className="mt-16 text-sm text-gray-500">
        © {new Date().getFullYear()} t-drive. All rights reserved.
      </footer>
    </div>
  );
}

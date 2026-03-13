"use client";

import { Button } from "~/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-gray-950 via-gray-900 to-gray-800 p-4 text-white">
      <main className="flex max-w-md flex-col items-center text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gray-800/50 shadow-inner ring-1 ring-gray-700/50">
          <AlertTriangle className="h-12 w-12 text-gray-400" />
        </div>
        <h1 className="mb-3 bg-linear-to-r from-gray-200 to-gray-400 bg-clip-text text-3xl font-bold text-transparent">
          {error.message}
        </h1>
        <p className="mb-8 text-gray-400">
          Something went wrong. Please try again.
        </p>
        <Button
          onClick={reset}
          className="cursor-pointer rounded-lg border border-gray-700 bg-gray-700 px-6 text-white transition-colors hover:bg-gray-800"
        >
          Try again
        </Button>
        <footer className="mt-16 text-sm text-gray-500">
          © {new Date().getFullYear()} t-drive. All rights reserved.
        </footer>
      </main>
    </div>
  );
}

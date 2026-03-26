"use client";

import { ChevronRight } from "lucide-react";
import { useViewPreference } from "~/hooks/use-view-preference";

export default function Loading() {
  const [view] = useViewPreference();

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-800 p-4 font-sans text-gray-100 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between rounded-xl bg-gray-800/50 p-4 px-6 shadow-xl ring-1 ring-gray-700/50 backdrop-blur-md">
          <div className="flex items-center">
            <div className="mr-2 flex items-center gap-2">
              <div className="h-6 w-6 animate-pulse rounded-md bg-gray-700" />
              <div className="h-5 w-16 animate-pulse rounded-md bg-gray-700" />
            </div>
            <div className="flex items-center">
              <ChevronRight className="mx-2 text-gray-500" size={16} />
              <div className="h-5 w-20 animate-pulse rounded-md bg-gray-700" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-700" />
          </div>
        </div>

        <div className="mb-6 flex justify-center">
          <div className="h-9 w-[138px] animate-pulse rounded-lg bg-gray-800/50 ring-1 ring-gray-700/50" />
        </div>

        {view === "list" ? (
          <div className="overflow-hidden rounded-xl bg-gray-800/50 shadow-xl ring-1 ring-gray-700/50 backdrop-blur-md">
            <div className="border-t-0 border-r-0 border-b border-l-0 border-gray-700/50 bg-gray-800/30 px-6 py-4">
              <div className="grid grid-cols-12 items-center gap-4 text-xs font-medium text-gray-400 md:text-sm">
                <div className="col-span-7 md:col-span-7">Name</div>
                <div className="max-md:hidden md:col-span-2">Created at</div>
                <div className="col-span-3 md:col-span-2">Size</div>
                <div className="col-span-2 flex justify-end md:col-span-1">
                  Actions
                </div>
              </div>
            </div>
            <ul>
              {[...Array<number>(5)].map((_, i) => (
                <li
                  key={i}
                  className="border-b border-gray-700/50 px-6 py-5 last:border-b-0"
                >
                  <div className="grid grid-cols-12 items-center gap-4">
                    <div className="col-span-7 flex items-center md:col-span-7">
                      <div className="mr-3 h-5 w-5 shrink-0 animate-pulse rounded-md bg-gray-700" />
                      <div className="h-4 w-48 animate-pulse rounded-md bg-gray-700" />
                    </div>
                    <div className="max-md:hidden md:col-span-2">
                      <div className="h-4 w-24 animate-pulse rounded-md bg-gray-700" />
                    </div>
                    <div className="col-span-3 md:col-span-2">
                      <div className="h-4 w-12 animate-pulse rounded-md bg-gray-700" />
                    </div>
                    <div className="col-span-2 flex justify-end md:col-span-1">
                      <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-700" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[...Array<number>(10)].map((_, i) => (
              <div
                key={i}
                className="flex min-h-[140px] flex-col items-center justify-center gap-4 rounded-xl border border-gray-700/50 bg-gray-800/30 p-6"
              >
                <div className="h-12 w-12 animate-pulse rounded-lg bg-gray-700" />
                <div className="h-4 w-24 animate-pulse rounded-md bg-gray-700" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex w-full flex-col items-center justify-center gap-4">
          <div className="h-12 w-32 animate-pulse rounded-lg bg-gray-700" />
        </div>
      </div>
    </div>
  );
}

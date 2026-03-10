import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "~/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-700 p-4 text-white">
      <main className="text-center">
        <h1 className="mb-4 bg-linear-to-r from-gray-200 to-gray-400 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
          t-drive
        </h1>
        <p className="mx-auto mb-8 max-w-md text-xl text-gray-400 md:text-2xl">
          Secure, fast, and easy file storage for the modern web
        </p>
        <form
          action={async () => {
            "use server";

            const session = await auth();

            if (!session.userId) {
              return redirect("/sign-in");
            }

            return redirect("/drive");
          }}
        >
          <Button
            size="lg"
            type="submit"
            className="cursor-pointer rounded-lg border border-gray-700 bg-gray-600 text-white transition-colors hover:bg-gray-700"
          >
            Get Started
          </Button>
        </form>
      </main>
      <footer className="mt-16 text-sm text-gray-500">
        © {new Date().getFullYear()} t-drive. All rights reserved.
      </footer>
    </div>
  );
}

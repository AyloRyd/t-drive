import "~/styles/globals.css";
import "@uploadthing/react/styles.css";

import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "~/components/query-provider";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { cn } from "~/lib/utils";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "t-drive",
    template: "%s | t-drive",
  },
  description: "Secure, fast, and easy file storage for the modern web",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider
          appearance={{
            theme: "simple",
            cssLayerName: "clerk",
          }}
        >
          <QueryProvider>{children}</QueryProvider>
        </ClerkProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

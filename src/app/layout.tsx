import "~/styles/globals.css";
import "@uploadthing/react/styles.css";

import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "~/components/query-provider";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { cn } from "~/lib/utils";
import { siteDescription, siteName, siteUrl } from "~/lib/site";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GlobalProgress } from "~/components/global-progress";
import { UploadErrorDialog } from "~/components/upload-error-dialog";

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
  // Resolves every relative URL below (and any canonical) against the real
  // origin, which Open Graph and canonical tags require to be absolute.
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — file storage for the modern web`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "file storage",
    "cloud drive",
    "file sharing",
    "folder upload",
    "file preview",
  ],
  alternates: { canonical: "/" },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    type: "website",
    url: "/",
    siteName,
    title: `${siteName} — file storage for the modern web`,
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — file storage for the modern web`,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
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
          <QueryProvider>
            <GlobalProgress />
            <UploadErrorDialog />
            {children}
          </QueryProvider>
        </ClerkProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

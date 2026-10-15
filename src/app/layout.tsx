import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { OfflineBanner } from "./components/offline-banner";
import { ServiceWorkerRegister } from "./components/service-worker-register";
import { Toaster } from "./components/toaster";
import { TopLoadingBar } from "./components/top-loading-bar";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "classcutcheyaamo?",
  description: "Attendance percentage tracker",
  applicationName: "classcutcheyaamo?",
  // ios ignores the manifest for most of this, so it needs its own tags
  appleWebApp: { capable: true, title: "classcut?", statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

// colours match the --background tokens in globals.css so the browser chrome
// blends in with the page in both light and dark
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7ee" },
    { media: "(prefers-color-scheme: dark)", color: "#121714" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <TopLoadingBar />
        </Suspense>
        <OfflineBanner />
        {children}
        <Toaster />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

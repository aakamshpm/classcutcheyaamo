import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { OfflineBanner } from "./components/offline-banner";
import { ServiceWorkerRegister } from "./components/service-worker-register";
import { TopLoadingBar } from "./components/top-loading-bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
    { media: "(prefers-color-scheme: light)", color: "#fdfcfb" },
    { media: "(prefers-color-scheme: dark)", color: "#171310" },
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <TopLoadingBar />
        </Suspense>
        <OfflineBanner />
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

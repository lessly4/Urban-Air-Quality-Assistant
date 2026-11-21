import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Urban Air Quality Assistant | Winter Smog & Inversion Guide",
  description:
    "GenAI-powered guidance with deterministic impact calculation to help families navigate severe winter smog, temperature inversions, and high PM2.5 pollution.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}

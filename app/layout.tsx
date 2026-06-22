import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider, THEME_NO_FLASH_SCRIPT } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Self-hosted (not next/font/google) — official Geist variable font, OFL licensed.
// Single variable axis (wght) covers every weight; a separate italic variable file
// covers italic across the same weight range. No new npm dependency: next/font/local
// ships with Next.js itself.
const geistSans = localFont({
  src: [
    { path: "./fonts/Geist-VariableFont_wght.ttf", weight: "100 900", style: "normal" },
    { path: "./fonts/Geist-Italic-VariableFont_wght.ttf", weight: "100 900", style: "italic" },
  ],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Krane Design System",
  description: "Enterprise design system for Krane products",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // The no-flash script below sets `.dark` before hydration based on a
      // preference the server can't know — this is the one, narrow, expected
      // mismatch suppressHydrationWarning exists for (THEME_SWITCHER_FOUNDATION.md §6).
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_NO_FLASH_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

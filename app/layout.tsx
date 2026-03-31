import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TickerVisibilityProvider } from "@/components/ticker-visibility";
import { AIProvider } from "@/contexts/ai-context";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});


export const metadata: Metadata = {
  title: "US Equity",
  description: "Trade US Stocks, ETFs & Options",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0f11",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("light", "font-sans", inter.variable)} suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <TickerVisibilityProvider>
            <AIProvider>
              {children}
            </AIProvider>
          </TickerVisibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Roboto_Mono, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TickerVisibilityProvider } from "@/components/ticker-visibility";
import { AIProvider } from "@/contexts/ai-context";
import { AIOverlay } from "@/components/ai-overlay";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600", "700"],
});

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
        className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <TickerVisibilityProvider>
            <AIProvider>
              {children}
              <AIOverlay />
            </AIProvider>
          </TickerVisibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

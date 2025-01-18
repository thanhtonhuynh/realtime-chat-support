import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TailwindScreenSizeIndicator } from "@/components/TailwindScreenSizeIndicator";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/providers/ThemeProvider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Realtime Chat Customer Support",
  description: "Realtime Chat Customer Support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-geist-sans antialiased`}>
        <ThemeProvider>
          <Header />

          <div className="relative mx-auto flex min-h-screen w-full max-w-screen-2xl flex-col bg-background">
            <main className="flex-1">{children}</main>
            <Footer />
          </div>

          <Toaster closeButton duration={10000} />
          <TailwindScreenSizeIndicator />
        </ThemeProvider>
      </body>
    </html>
  );
}

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TailwindScreenSizeIndicator } from "@/components/TailwindScreenSizeIndicator";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentSession } from "@/lib/auth/session";
import { SessionProvider } from "@/providers/SessionProvider";
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
  const session = getCurrentSession();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-geist-sans antialiased`}>
        <ThemeProvider>
          <SessionProvider sessionPromise={session}>
            <Header />

            <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-screen-2xl flex-col bg-background">
              <main className="flex flex-1 flex-col">{children}</main>
              <Footer />
            </div>

            <Toaster closeButton duration={10000} />
            <TailwindScreenSizeIndicator />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

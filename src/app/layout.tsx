import type { Metadata } from "next";
import { inter, urbanist, outfit } from "@/app/fonts";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "Ministry Organizer",
  description: "Organización de ministerio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${urbanist.variable} ${outfit.variable}`}>
      <body className="antialiased min-h-screen flex flex-col bg-[#1A1A1A]" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

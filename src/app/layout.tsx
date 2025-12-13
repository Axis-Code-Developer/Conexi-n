import type { Metadata } from "next";
import { inter, urbanist, outfit } from "@/app/fonts";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "Punto Conexión",
  description: "Organización de ministerio",
  icons: {
    icon: "/images/logo.png",
  },
};

import { ScrollArea } from "@/components/ui/scroll-area";

// ... (existing imports)

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${urbanist.variable} ${outfit.variable}`}>
      <body className="antialiased h-screen overflow-hidden flex flex-col bg-[#1A1A1A]" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <ScrollArea className="h-full w-full">
            <main className="flex-1">
              {children}
            </main>
          </ScrollArea>
        </Providers>
      </body>
    </html>
  );
}

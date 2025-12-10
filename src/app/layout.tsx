import type { Metadata } from "next";
import { inter, urbanist } from "@/assets/fonts";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

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
    <html lang="es" className={`${inter.variable} ${urbanist.variable}`}>
      <body className="antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}

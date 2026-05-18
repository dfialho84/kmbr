import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { InstallBanner } from "@/presentation/components/InstallBanner";
import { UpdateBanner } from "@/presentation/components/UpdateBanner";
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
  title: "Kmbr",
  description: "Gerenciamento de corridas para taxistas e motoristas de aplicativo",
  manifest: "/manifest.json",
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
      <body
        className="min-h-full flex flex-col"
        data-version={process.env.NEXT_PUBLIC_BUILD_VERSION ?? "dev"}
      >
        <InstallBanner />
        <UpdateBanner />
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/app/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Namdhari Swaich Sweets",
    template: "%s | Namdhari Swaich Sweets"
  },
  description:
    "Personalized business management suite for sweets, dairy, billing, ledgers, inventory, salaries, and reports.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Namdhari Swaich Sweets",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1c5a3e"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}

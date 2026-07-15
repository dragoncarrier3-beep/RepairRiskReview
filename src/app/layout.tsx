import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repair Risk Review | Powered by My Road Armor",
  description:
    "Know your repair risk. Get a personalized analysis of your vehicle's reliability and potential repair costs.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

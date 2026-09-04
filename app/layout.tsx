import type { Metadata } from "next";
import "./globals.css";
import "./evidence-hover.css";

export const metadata: Metadata = {
  title: "The Morrowfield Archive",
  description: "Investigate a university experiment about a town that never existed.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

const appName = process.env.NEXT_PUBLIC_DASHBOARD_NAME ?? "Daily Dashboard";

export const metadata: Metadata = {
  title: appName,
  description: "A self-hosted daily dashboard for a wall monitor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "❉ put it in a walnut",
  description: "put your message in a walnut",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-mono bg-black text-white">{children}</body>
    </html>
  );
}

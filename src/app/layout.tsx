import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Image Production Machine",
  description: "Create striped art from images",
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

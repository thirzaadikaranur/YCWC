import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReverseTutor",
  description: "Belajar dengan menemukan bagian yang benar-benar kamu pahami.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

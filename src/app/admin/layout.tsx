import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Admin · JCI Phnom Penh",
  robots: { index: false, follow: false },
};

// Separate root layout from `src/app/[locale]/layout.tsx` (Next's
// "multiple root layouts" pattern) since the admin panel is an internal
// English-only tool, not part of the public bilingual site. Covers both
// /admin/login (public) and the (dashboard) route group (auth-guarded,
// adds its own sidebar in src/app/admin/(dashboard)/layout.tsx).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  );
}

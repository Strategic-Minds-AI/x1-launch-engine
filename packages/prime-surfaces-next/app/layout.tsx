import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Prime Surfaces | Epoxy & Decorative Concrete | Design Demo",
  description: "Nonproduction premium flooring design template. Fictional sample brand and illustrative visual references.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  applicationName: "Prime Surfaces Template 05"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="prime">{children}</body></html>;
}

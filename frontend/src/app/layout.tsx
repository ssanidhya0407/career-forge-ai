import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerForge.ai | AI Interview Coach",
  description: "Master your next interview with an intelligent AI agent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased bg-slate-950 text-slate-100`}>
        {children}
      </body>
    </html>
  );
}

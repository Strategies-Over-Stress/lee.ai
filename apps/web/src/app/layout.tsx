import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rich Lee — AI-First Technical Partner",
  description:
    "Senior software engineer who transforms businesses with AI-augmented development. Rapid feature delivery, production-grade architecture, and scalable systems.",
  openGraph: {
    title: "Rich Lee — AI-First Technical Partner",
    description:
      "I don't apply for jobs. I transform businesses with AI-augmented development.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}

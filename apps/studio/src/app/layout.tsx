import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studio — lee.ai",
  description: "Internal content studio",
};

const nav = [
  { href: "/research", label: "Research" },
  { href: "/generate", label: "Generate" },
  { href: "/queue", label: "Queue" },
  { href: "/sources", label: "Sources" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-56 flex-shrink-0 border-r border-surface-light bg-surface p-4 flex flex-col gap-1">
            <Link
              href="/"
              className="text-lg font-bold text-accent-bright mb-6 px-3"
            >
              studio
            </Link>
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </aside>

          {/* Main content */}
          <main className="flex-1 p-8 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}

"use client";

import ReactMarkdown from "react-markdown";

export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="text-lg font-bold mt-4 mb-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-semibold mt-3 mb-1.5 text-text-primary">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-semibold mt-2 mb-1 text-text-primary">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="text-sm text-text-secondary mb-2 leading-relaxed">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-outside ml-4 mb-2 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-outside ml-4 mb-2 space-y-1">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-sm text-text-secondary leading-relaxed">{children}</li>
        ),
        strong: ({ children }) => (
          <strong className="text-text-primary font-semibold">{children}</strong>
        ),
        code: ({ children }) => (
          <code className="px-1 py-0.5 rounded bg-surface-light text-accent-bright text-xs font-mono">
            {children}
          </code>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-bright underline"
          >
            {children}
          </a>
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

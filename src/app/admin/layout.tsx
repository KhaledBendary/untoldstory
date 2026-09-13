import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../globals.css";

/**
 * The dashboard shell. Arabic, right-to-left, and kept out of search engines —
 * it is a private tool, never a page to index. Its own visual language (calm,
 * utilitarian, high-contrast) is deliberately unlike the cinematic public site:
 * this is a workspace, read and operated, not a page to be impressed by.
 */
export const metadata: Metadata = {
  title: "لوحة تحكم | Global Untold Story",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="admin-root">
        {children}
        <style>{`
          .admin-root {
            --bg: #0e1113;
            --panel: #171b1e;
            --panel-2: #1e2327;
            --line: #2b3237;
            --ink: #eef1f2;
            --muted: #9aa4ab;
            --faint: #6b757c;
            --accent: #4a9ea8;
            --accent-ink: #0e1113;
            --ok: #4fae6b;
            --warn: #c9a227;
            --danger: #d0553f;
            margin: 0;
            min-height: 100vh;
            background: var(--bg);
            color: var(--ink);
            font-family: "IBM Plex Sans Arabic", "Segoe UI", Tahoma, system-ui, sans-serif;
            font-size: 15px;
            line-height: 1.6;
          }
          .admin-root * { box-sizing: border-box; }
          .admin-root a { color: var(--accent); text-decoration: none; }
          .admin-root input, .admin-root textarea, .admin-root select {
            font-family: inherit; font-size: 14px;
            background: var(--bg); color: var(--ink);
            border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; width: 100%;
          }
          .admin-root input:focus, .admin-root textarea:focus, .admin-root select:focus {
            outline: 2px solid var(--accent); outline-offset: 1px; border-color: var(--accent);
          }
          .admin-root button {
            font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer;
            border: 1px solid var(--line); border-radius: 8px; padding: 10px 16px;
            background: var(--panel-2); color: var(--ink); transition: background .15s, border-color .15s;
          }
          .admin-root button:hover { border-color: var(--accent); }
          .admin-root button.primary { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
          .admin-root button.primary:hover { filter: brightness(1.08); }
          .admin-root button:disabled { opacity: .55; cursor: default; }
        `}</style>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "../globals.css";
import { currentSession } from "@/lib/admin-session";
import { deployConfigured } from "@/lib/deploy";
import { newMessageCount } from "@/lib/db/repo";
import AdminShell from "./AdminShell";

/**
 * The dashboard shell. Arabic, right-to-left, and kept out of search engines —
 * a private workspace. Its visual language is a calm, professional dark console:
 * a fixed sidebar, a quiet topbar, layered panels, and one accent colour used
 * sparingly. Deliberately unlike the cinematic public site — this is a tool.
 */
// Self-hosted by next/font (served from our own origin, so the strict CSP needs
// no third-party font origin). Exposed as a CSS variable the admin theme reads.
const plex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-plex",
});

export const metadata: Metadata = {
  title: "لوحة تحكم | Global Untold Story",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await currentSession();
  const newMessages = session ? await newMessageCount().catch(() => 0) : 0;

  return (
    <html lang="ar" dir="rtl">
      <body className={`admin-root ${plex.variable}`}>
        <AdminShell email={session?.email ?? null} canPublish={deployConfigured()} newMessages={newMessages}>
          {children}
        </AdminShell>

        <style>{`
          .admin-root {
            /* palette */
            --bg: #0b0e11;
            --bg-2: #0f1317;
            --panel: #151a1f;
            --panel-2: #1b222833;
            --panel-hover: #1c2329;
            --line: #262e35;
            --line-soft: #1e252b;
            --ink: #eaeef1;
            --muted: #9aa6ae;
            --faint: #6a757d;
            --accent: #48b0b8;
            --accent-2: #3a949b;
            --accent-ink: #04191b;
            --accent-soft: #48b0b81f;
            --ok: #56b979;
            --ok-soft: #56b9791f;
            --warn: #d3a933;
            --warn-soft: #d3a9331f;
            --danger: #e05d46;
            --danger-soft: #e05d461f;
            --radius: 12px;
            --radius-sm: 9px;
            --shadow: 0 1px 2px rgba(0,0,0,.3), 0 8px 24px rgba(0,0,0,.28);
            --shadow-sm: 0 1px 2px rgba(0,0,0,.25);
            --sidebar-w: 250px;

            margin: 0; min-height: 100vh;
            background: var(--bg); color: var(--ink);
            font-family: "IBM Plex Sans Arabic", "Segoe UI", Tahoma, system-ui, sans-serif;
            font-size: 15px; line-height: 1.6;
            -webkit-font-smoothing: antialiased;
          }
          /* beat the public site's Tailwind base font (set on <html>, inherited) */
          body.admin-root, body.admin-root * {
            font-family: var(--font-plex), "Segoe UI", Tahoma, system-ui, sans-serif !important;
          }
          .admin-root * { box-sizing: border-box; }
          .admin-root ::selection { background: var(--accent-soft); }
          .admin-root a { color: var(--accent); text-decoration: none; }

          /* scrollbars */
          .admin-root *::-webkit-scrollbar { width: 10px; height: 10px; }
          .admin-root *::-webkit-scrollbar-thumb { background: #2a333a; border-radius: 20px; border: 2px solid var(--bg); }
          .admin-root *::-webkit-scrollbar-thumb:hover { background: #37434c; }

          /* form controls */
          .admin-root input, .admin-root textarea, .admin-root select {
            font-family: inherit; font-size: 14px;
            background: var(--bg-2); color: var(--ink);
            border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 10px 12px; width: 100%;
            transition: border-color .15s, box-shadow .15s, background .15s;
          }
          .admin-root input::placeholder, .admin-root textarea::placeholder { color: var(--faint); }
          .admin-root input:focus, .admin-root textarea:focus, .admin-root select:focus {
            outline: none; border-color: var(--accent);
            box-shadow: 0 0 0 3px var(--accent-soft); background: var(--bg);
          }
          .admin-root textarea { resize: vertical; }

          /* buttons */
          .admin-root button {
            font-family: inherit; font-size: 14px; font-weight: 600; cursor: pointer;
            border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 9px 15px;
            background: var(--panel); color: var(--ink);
            transition: background .15s, border-color .15s, transform .05s, box-shadow .15s;
          }
          .admin-root button:hover { background: var(--panel-hover); border-color: #33404a; }
          .admin-root button:active { transform: translateY(1px); }
          .admin-root button:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--accent-soft); }
          .admin-root button.primary {
            background: linear-gradient(180deg, var(--accent), var(--accent-2));
            color: var(--accent-ink); border-color: var(--accent-2); box-shadow: var(--shadow-sm);
          }
          .admin-root button.primary:hover { filter: brightness(1.06); border-color: var(--accent); }
          .admin-root button:disabled { opacity: .5; cursor: default; transform: none; }

          h1, h2, h3 { letter-spacing: -0.01em; }

          /* ---------- shell ---------- */
          .admin-shell { display: flex; min-height: 100vh; }
          .admin-sidebar {
            width: var(--sidebar-w); flex-shrink: 0; position: sticky; top: 0; height: 100vh;
            background: linear-gradient(180deg, var(--bg-2), var(--bg));
            border-inline-start: 1px solid var(--line-soft);
            display: flex; flex-direction: column; padding: 18px 14px; gap: 6px;
          }
          .admin-brand { display: flex; align-items: center; gap: 11px; padding: 6px 8px 16px; }
          .admin-brand-mark {
            width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
            background: linear-gradient(140deg, var(--accent), var(--accent-2));
            color: var(--accent-ink); display: grid; place-items: center; font-weight: 800; font-size: 16px;
            box-shadow: var(--shadow-sm);
          }
          .admin-brand-name { font-size: 14px; font-weight: 700; line-height: 1.2; }
          .admin-brand-sub { font-size: 11px; color: var(--faint); letter-spacing: .18em; }
          .admin-navlabel { font-size: 10.5px; letter-spacing: .2em; color: var(--faint); padding: 12px 10px 6px; }
          .admin-nav { display: flex; flex-direction: column; gap: 2px; }
          .admin-nav a {
            display: flex; align-items: center; gap: 11px; padding: 9px 11px; border-radius: var(--radius-sm);
            color: var(--muted); font-size: 14px; font-weight: 500; position: relative; transition: background .12s, color .12s;
          }
          .admin-nav a:hover { background: var(--panel); color: var(--ink); }
          .admin-nav a.active { background: var(--accent-soft); color: var(--accent); font-weight: 600; }
          .admin-nav a.active::before {
            content: ""; position: absolute; inset-inline-start: -14px; top: 50%; transform: translateY(-50%);
            width: 3px; height: 20px; border-radius: 3px; background: var(--accent);
          }
          .admin-nav a svg { width: 17px; height: 17px; flex-shrink: 0; opacity: .9; }
          .admin-nav .count {
            margin-inline-start: auto; font-size: 11px; font-weight: 700; min-width: 20px; text-align: center;
            background: var(--accent); color: var(--accent-ink); border-radius: 20px; padding: 1px 7px;
          }
          .admin-sidebar-foot { margin-top: auto; padding-top: 12px; border-top: 1px solid var(--line-soft); display: grid; gap: 8px; }
          .admin-user { display: flex; align-items: center; gap: 9px; padding: 4px 6px; font-size: 12px; color: var(--muted); }
          .admin-user .avatar {
            width: 26px; height: 26px; border-radius: 50%; background: var(--panel-2); border: 1px solid var(--line);
            display: grid; place-items: center; font-weight: 700; color: var(--accent); font-size: 12px; flex-shrink: 0;
          }

          .admin-content { flex: 1; min-width: 0; display: flex; flex-direction: column; }
          .admin-topbar {
            position: sticky; top: 0; z-index: 20; height: 58px; flex-shrink: 0;
            display: flex; align-items: center; gap: 12px; padding: 0 22px;
            background: color-mix(in srgb, var(--bg) 82%, transparent);
            backdrop-filter: blur(10px); border-bottom: 1px solid var(--line-soft);
          }
          .admin-topbar h2 { font-size: 15px; font-weight: 600; margin: 0; }
          .admin-hamburger { display: none; }
          .admin-page { padding: 4px 0 40px; }

          /* generic surfaces some pages can opt into */
          .admin-root .card { background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow-sm); }
          .admin-root .badge { font-size: 11px; font-weight: 600; border-radius: 20px; padding: 2px 9px; border: 1px solid var(--line); }

          .admin-bare { min-height: 100vh; display: grid; place-items: center; padding: 24px; }

          /* backdrop for mobile drawer */
          .admin-backdrop { display: none; }

          @media (max-width: 860px) {
            .admin-sidebar {
              position: fixed; z-index: 40; inset-inline-start: 0; top: 0; transform: translateX(100%);
              transition: transform .22s ease; box-shadow: var(--shadow);
            }
            .admin-shell.nav-open .admin-sidebar { transform: translateX(0); }
            .admin-backdrop { display: block; position: fixed; inset: 0; z-index: 30; background: rgba(0,0,0,.5); opacity: 0; pointer-events: none; transition: opacity .2s; }
            .admin-shell.nav-open .admin-backdrop { opacity: 1; pointer-events: auto; }
            .admin-hamburger { display: inline-grid; place-items: center; width: 38px; height: 38px; padding: 0; }
          }
        `}</style>
      </body>
    </html>
  );
}

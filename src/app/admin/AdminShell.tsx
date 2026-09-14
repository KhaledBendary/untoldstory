"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import PublishButton from "./PublishButton";
import LogoutButton from "./LogoutButton";

type NavItem = { href: string; label: string; icon: keyof typeof ICONS; exact?: boolean; badge?: number };

const ICONS = {
  grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  layers: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5",
  image: "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5",
  file: "M6 3h8l4 4v14H6zM14 3v4h4M9 13h6M9 17h6",
  layout: "M4 5h16v14H4zM4 9h16M9 9v10",
  columns: "M5 4h5v16H5zM14 4h5v16h-5z",
  mail: "M4 6h16v12H4zM4 7l8 6 8-6",
  photo: "M4 5h16v14H4zM8 11a2 2 0 100-4 2 2 0 000 4zM4 17l5-5 4 4 3-3 4 4",
  chart: "M4 20V4M4 20h16M8 20v-6M13 20V9M18 20v-9",
  globe: "M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.6 2.7 2.6 15.3 0 18M12 3c-2.6 2.7-2.6 15.3 0 18",
  clock: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 7v5l4 2",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-4.3-4.3",
} as const;

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={ICONS[name]} />
    </svg>
  );
}

/**
 * The dashboard chrome: a fixed sidebar with the primary navigation and a quiet
 * topbar. Hidden on the login screen (and whenever there is no session), where
 * the page renders on its own, centered.
 */
export default function AdminShell({
  email, canPublish, newMessages, children,
}: {
  email: string | null; canPublish: boolean; newMessages: number; children: ReactNode;
}) {
  const pathname = usePathname() || "";
  const [navOpen, setNavOpen] = useState(false);

  if (!email || pathname === "/admin/login") {
    return <div className="admin-bare">{children}</div>;
  }

  const nav: NavItem[] = [
    { href: "/admin", label: "اللوحة", icon: "grid", exact: true },
    { href: "/admin/services", label: "الخدمات", icon: "layers" },
    { href: "/admin/projects", label: "الأعمال", icon: "image" },
    { href: "/admin/posts", label: "المقالات", icon: "file" },
    { href: "/admin/pages", label: "الصفحات", icon: "layout" },
    { href: "/admin/translations", label: "الترجمة", icon: "globe" },
    { href: "/admin/seo", label: "السيو والفهرسة", icon: "search" },
    { href: "/admin/messages", label: "الرسائل", icon: "mail", badge: newMessages },
    { href: "/admin/visits", label: "الزيارات", icon: "chart" },
    { href: "/admin/activity", label: "سجل النشاط", icon: "clock" },
    { href: "/admin/media", label: "الصور", icon: "photo" },
  ];

  const isActive = (i: NavItem) => (i.exact ? pathname === i.href : pathname === i.href || pathname.startsWith(i.href + "/"));
  const active = nav.find((i) => (i.exact ? pathname === i.href : pathname.startsWith(i.href)) && (i.exact || i.href !== "/admin"));
  const title = active ? active.label : "لوحة التحكم";

  return (
    <div className={`admin-shell${navOpen ? " nav-open" : ""}`}>
      <div className="admin-backdrop" onClick={() => setNavOpen(false)} />

      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">GU</span>
          <span>
            <span className="admin-brand-name">Global Untold Story</span>
            <span className="admin-brand-sub" style={{ display: "block" }}>لوحة التحكم</span>
          </span>
        </div>

        <div className="admin-navlabel">الإدارة</div>
        <nav className="admin-nav" onClick={() => setNavOpen(false)}>
          {nav.map((i) => (
            <Link key={i.href} href={i.href} className={isActive(i) ? "active" : ""}>
              <Icon name={i.icon} />
              <span>{i.label}</span>
              {typeof i.badge === "number" && i.badge > 0 && <span className="count">{i.badge}</span>}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          {canPublish && <PublishButton />}
          <div className="admin-user">
            <span className="avatar">{email[0]?.toUpperCase()}</span>
            <span dir="ltr" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email}</span>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="admin-content">
        <header className="admin-topbar">
          <button className="admin-hamburger" onClick={() => setNavOpen((v) => !v)} aria-label="القائمة">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2>{title}</h2>
        </header>
        <main className="admin-page">{children}</main>
      </div>
    </div>
  );
}

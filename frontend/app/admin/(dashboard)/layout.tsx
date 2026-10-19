"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { adminLogout, adminMe, getAdminToken } from "@/lib/admin-api";
import type { AdminUser } from "@/types/cms";

import "../admin.css";

const NAV: Array<{ href: string; label: string; exact?: boolean }> = [
  { href: "/admin", label: "Home", exact: true },
  { href: "/admin/settings", label: "Logo & contact" },
  { href: "/admin/hero-story", label: "Homepage text" },
  { href: "/admin/services", label: "Services & prices" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/testimonials", label: "Reviews" },
  { href: "/admin/hours", label: "Opening hours" },
  { href: "/admin/locales", label: "Other website text" },
  { href: "/admin/media", label: "All uploads" },
];

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function AdminDashboardLayout({
  children,
}: DashboardLayoutProps): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    adminMe()
      .then((data) => {
        setAdmin(data.admin);
        setReady(true);
      })
      .catch(() => {
        router.replace("/admin/login");
      });
  }, [router]);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [navOpen]);

  const onLogout = async (): Promise<void> => {
    await adminLogout();
    router.replace("/admin/login");
  };

  if (!ready) {
    return (
      <div className="admin-root">
        <div className="admin-loading">Loading admin…</div>
      </div>
    );
  }

  const pageTitle =
    NAV.find((item) =>
      item.exact
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
    )?.label || "Admin";

  return (
    <div className={`admin-root${navOpen ? " is-nav-open" : ""}`}>
      <div className="admin-shell">
        <header className="admin-mobile-bar">
          <button
            type="button"
            className="admin-menu-btn"
            aria-expanded={navOpen}
            aria-controls="admin-sidebar"
            onClick={() => setNavOpen((open) => !open)}
          >
            <span className="admin-menu-icon" aria-hidden="true" />
            <span className="admin-sr-only">
              {navOpen ? "Close menu" : "Open menu"}
            </span>
          </button>
          <div className="admin-mobile-bar-title">
            <strong>The Butler Barber</strong>
            <span>{pageTitle}</span>
          </div>
          <a
            className="admin-mobile-view-site"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Site
          </a>
        </header>

        <button
          type="button"
          className="admin-nav-backdrop"
          aria-label="Close menu"
          tabIndex={navOpen ? 0 : -1}
          onClick={() => setNavOpen(false)}
        />

        <aside className="admin-sidebar" id="admin-sidebar">
          <div className="admin-brand">
            <strong>The Butler Barber</strong>
            <span>Easy website editor</span>
          </div>
          <nav className="admin-nav" aria-label="Admin">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={active ? "is-active" : undefined}
                  onClick={() => setNavOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="admin-sidebar-foot">
            <span
              className="admin-muted"
              style={{ color: "rgba(245,245,244,0.55)" }}
            >
              {admin?.email}
            </span>
            <a href="/" target="_blank" rel="noopener noreferrer">
              View site
            </a>
            <button type="button" onClick={onLogout}>
              Sign out
            </button>
          </div>
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}

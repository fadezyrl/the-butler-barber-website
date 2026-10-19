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
  { href: "/admin/publish", label: "Publish live" },
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

  return (
    <div className="admin-root">
      <div className="admin-shell">
        <aside className="admin-sidebar">
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
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="admin-sidebar-foot">
            <span className="admin-muted" style={{ color: "rgba(245,245,244,0.55)" }}>
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

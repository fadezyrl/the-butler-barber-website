"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { AdminApiError, getDashboard } from "@/lib/admin-api";
import { HOW_TO_PUBLISH, mediaHint } from "@/lib/admin-media-guide";
import type { AdminDashboard } from "@/types/cms";

const QUICK = [
  {
    href: "/admin/settings",
    title: "Logo & contact",
    blurb: "Phone, WhatsApp, address, logo, hero video",
  },
  {
    href: "/admin/hero-story",
    title: "Homepage text",
    blurb: "Hero, story and booking button text",
  },
  {
    href: "/admin/services",
    title: "Prices & services",
    blurb: "Names, prices, categories",
  },
  {
    href: "/admin/gallery",
    title: "Gallery photos",
    blurb: "Add or replace work photos / videos",
  },
  {
    href: "/admin/team",
    title: "Our Team",
    blurb: "Team photos, names, roles and bios",
  },
  {
    href: "/admin/testimonials",
    title: "Reviews",
    blurb: "Customer quotes on the site",
  },
  {
    href: "/admin/hours",
    title: "Opening hours",
    blurb: "Open / closed times for each day",
  },
] as const;

export default function AdminOverviewPage(): React.JSX.Element {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) =>
        setError(
          err instanceof AdminApiError
            ? err.message
            : "Could not load overview. Try refresh.",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="admin-loading">Loading…</div>;
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Welcome</h1>
          <p>
            Change website text, photos and videos here. No coding needed.
          </p>
        </div>
      </div>

      <AdminGuide
        title="Simple workflow"
        steps={[
          "Open the section you want to change (buttons below).",
          "Edit text or upload a new photo / video.",
          "Click Save & publish — the live website updates.",
        ]}
      >
        <p>{HOW_TO_PUBLISH}</p>
        <p>
          <strong>Uploads:</strong> {mediaHint("both")}
        </p>
      </AdminGuide>

      <AdminStatus type="error" message={error} />

      <div className="admin-quick-links">
        {QUICK.map((item) => (
          <Link key={item.href} className="admin-quick-link" href={item.href}>
            <strong>{item.title}</strong>
            <span>{item.blurb}</span>
          </Link>
        ))}
      </div>

      {data ? (
        <>
          <div className="admin-stats">
            <div className="admin-stat">
              <span>Services</span>
              <strong>{data.counts.services}</strong>
            </div>
            <div className="admin-stat">
              <span>Gallery items</span>
              <strong>{data.counts.gallery}</strong>
            </div>
            <div className="admin-stat">
              <span>Reviews</span>
              <strong>{data.counts.testimonials}</strong>
            </div>
          </div>

          <div className="admin-card">
            <h2>Signed in as</h2>
            <p>
              {data.admin.name} · {data.admin.email}
            </p>
          </div>
        </>
      ) : null}
    </>
  );
}

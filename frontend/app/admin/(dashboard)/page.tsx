"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AdminStatus } from "@/components/admin/AdminStatus";
import { AdminApiError, getDashboard } from "@/lib/admin-api";
import type { AdminDashboard } from "@/types/cms";

export default function AdminOverviewPage(): React.JSX.Element {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) =>
        setError(
          err instanceof AdminApiError ? err.message : "Failed to load dashboard",
        ),
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="admin-loading">Loading overview…</div>;
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Overview</h1>
          <p>Draft content status and recent publishes.</p>
        </div>
        <div className="admin-actions">
          <Link className="admin-btn" href="/admin/publish">
            Publish
          </Link>
        </div>
      </div>

      <AdminStatus type="error" message={error} />

      {data ? (
        <>
          <div className="admin-stats">
            <div className="admin-stat">
              <span>Services</span>
              <strong>{data.counts.services}</strong>
            </div>
            <div className="admin-stat">
              <span>Gallery</span>
              <strong>{data.counts.gallery}</strong>
            </div>
            <div className="admin-stat">
              <span>Testimonials</span>
              <strong>{data.counts.testimonials}</strong>
            </div>
          </div>

          <div className="admin-card">
            <h2>Signed in</h2>
            <p>
              {data.admin.name} · {data.admin.email}
            </p>
            <p className="admin-muted">
              Settings updated:{" "}
              {data.updatedAt
                ? new Date(data.updatedAt).toLocaleString()
                : "—"}
            </p>
          </div>

          <div className="admin-card">
            <h2>Recent publishes</h2>
            {data.recentPublishes.length === 0 ? (
              <p className="admin-muted">No publish history yet.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentPublishes.map((row) => (
                    <tr key={row.id}>
                      <td>{row.section}</td>
                      <td>
                        {new Date(
                          row.published_at || row.created_at || "",
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      ) : null}
    </>
  );
}

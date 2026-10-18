"use client";

import { useEffect, useState } from "react";

import { AdminStatus } from "@/components/admin/AdminStatus";
import { useAdminForm } from "@/components/admin/useAdminForm";
import { getPublishLog, publishSection } from "@/lib/admin-api";
import type { PublishSection } from "@/types/cms";

const SECTIONS: Array<{ id: PublishSection; label: string; hint: string }> = [
  {
    id: "all",
    label: "Publish everything",
    hint: "Settings, locales, services, gallery, testimonials, and hours.",
  },
  { id: "settings", label: "Settings", hint: "Brand, contact, SEO, media slots." },
  { id: "locales", label: "Locales", hint: "English and Arabic dictionary copy." },
  { id: "services", label: "Services", hint: "Categories, items, and prices." },
  { id: "gallery", label: "Gallery", hint: "Homepage work gallery." },
  { id: "testimonials", label: "Testimonials", hint: "Reviews carousel." },
  { id: "hours", label: "Hours", hint: "Opening hours schedule." },
];

type LogRow = {
  id: string;
  section: string;
  published_at?: string;
  created_at?: string;
};

export default function AdminPublishPage(): React.JSX.Element {
  const [log, setLog] = useState<LogRow[]>([]);
  const form = useAdminForm();

  const reloadLog = async (): Promise<void> => {
    try {
      const rows = await getPublishLog();
      setLog(Array.isArray(rows) ? (rows as LogRow[]) : []);
    } catch {
      // non-blocking
    }
  };

  useEffect(() => {
    void reloadLog();
  }, []);

  const onPublish = async (section: PublishSection): Promise<void> => {
    const label =
      SECTIONS.find((s) => s.id === section)?.label || section;
    if (
      !window.confirm(
        `Publish “${label}” to the live site? This will also trigger cache revalidation.`,
      )
    ) {
      return;
    }
    await form.run(async () => {
      await publishSection(section);
      await reloadLog();
    }, `${label} published.`);
  };

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Publish</h1>
          <p>
            Promote draft content to the live website. Prefer section publishes
            when iterating; use “Publish everything” before a full release.
          </p>
        </div>
      </div>

      <AdminStatus type="error" message={form.error} />
      <AdminStatus type="success" message={form.success} />

      <div className="admin-list">
        {SECTIONS.map((section) => (
          <div className="admin-item" key={section.id}>
            <div className="admin-item-head">
              <div>
                <strong>{section.label}</strong>
                <p className="admin-muted" style={{ margin: "4px 0 0" }}>
                  {section.hint}
                </p>
              </div>
              <button
                className="admin-btn"
                type="button"
                disabled={form.loading}
                onClick={() => onPublish(section.id)}
              >
                {form.loading ? "Publishing…" : "Publish"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card">
        <h2>Publish log</h2>
        {log.length === 0 ? (
          <p className="admin-muted">No publishes recorded yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Section</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {log.map((row) => (
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
  );
}

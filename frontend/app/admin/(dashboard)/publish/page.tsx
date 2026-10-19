"use client";

import { useEffect, useState } from "react";

import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { useAdminForm } from "@/components/admin/useAdminForm";
import { getPublishLog, publishSection } from "@/lib/admin-api";
import type { PublishSection } from "@/types/cms";

const SECTIONS: Array<{ id: PublishSection; label: string; hint: string }> = [
  {
    id: "all",
    label: "Publish everything",
    hint: "Safest choice if you edited many sections — updates the whole site.",
  },
  {
    id: "settings",
    label: "Logo & contact",
    hint: "Logo, phone, maps, hero / story / CTA media.",
  },
  {
    id: "locales",
    label: "Website text",
    hint: "Homepage text and other English / Arabic labels.",
  },
  {
    id: "services",
    label: "Services & prices",
    hint: "Menu names and prices.",
  },
  {
    id: "gallery",
    label: "Gallery",
    hint: "Work photos and videos.",
  },
  {
    id: "testimonials",
    label: "Reviews",
    hint: "Customer quotes.",
  },
  {
    id: "hours",
    label: "Opening hours",
    hint: "Daily open / closed times.",
  },
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
          <h1>Publish to live site</h1>
          <p>
            Saved drafts stay private until you publish. Publishing updates{" "}
            <strong>www.thebutlerbarber.com</strong> for visitors.
          </p>
        </div>
      </div>

      <AdminGuide
        title="When should I publish?"
        steps={[
          "Edit a section and click Save draft.",
          "Preview the public site if you want (open View site).",
          "Come here and publish that section — or Publish everything.",
          "Wait a few seconds, then refresh the public website.",
        ]}
      />

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

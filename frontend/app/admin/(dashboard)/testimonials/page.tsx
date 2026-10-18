"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminStatus } from "@/components/admin/AdminStatus";
import { useAdminForm } from "@/components/admin/useAdminForm";
import {
  deleteTestimonial,
  getAdminContent,
  publishSection,
  upsertTestimonial,
} from "@/lib/admin-api";

type TestimonialRow = {
  id: string;
  draft_name: string;
  draft_quote_en: string;
  draft_quote_ar: string;
  draft_source: string;
  draft_sort_order: number;
  draft_is_visible: boolean;
};

export default function AdminTestimonialsPage(): React.JSX.Element {
  const [items, setItems] = useState<TestimonialRow[]>([]);
  const [booting, setBooting] = useState(true);
  const form = useAdminForm();

  const reload = useCallback(async (): Promise<void> => {
    const content = await getAdminContent();
    setItems(content.testimonials as unknown as TestimonialRow[]);
  }, []);

  useEffect(() => {
    reload()
      .catch((err) =>
        form.setStatus({
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load",
          success: null,
        }),
      )
      .finally(() => setBooting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload]);

  const saveItem = async (item: TestimonialRow): Promise<void> => {
    await form.run(async () => {
      await upsertTestimonial({
        id: item.id,
        name: item.draft_name,
        quoteEn: item.draft_quote_en,
        quoteAr: item.draft_quote_ar,
        source: item.draft_source,
        sortOrder: item.draft_sort_order,
        isVisible: item.draft_is_visible,
      });
      await reload();
    }, "Testimonial saved.");
  };

  const addItem = async (): Promise<void> => {
    await form.run(async () => {
      await upsertTestimonial({
        name: "New guest",
        quoteEn: "",
        quoteAr: "",
        source: "Google Review",
        sortOrder: items.length,
        isVisible: true,
      });
      await reload();
    }, "Testimonial created.");
  };

  const removeItem = async (id: string): Promise<void> => {
    if (!window.confirm("Delete this testimonial?")) return;
    await form.run(async () => {
      await deleteTestimonial(id);
      await reload();
    }, "Testimonial deleted.");
  };

  const onPublish = async (): Promise<void> => {
    await form.run(
      () => publishSection("testimonials"),
      "Testimonials published.",
    );
  };

  if (booting) {
    return <div className="admin-loading">Loading testimonials…</div>;
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Testimonials</h1>
          <p>Guest quotes shown in the reviews carousel.</p>
        </div>
        <div className="admin-actions">
          <button
            className="admin-btn admin-btn-secondary"
            type="button"
            onClick={addItem}
            disabled={form.loading}
          >
            Add testimonial
          </button>
          <button
            className="admin-btn"
            type="button"
            onClick={onPublish}
            disabled={form.loading}
          >
            Publish testimonials
          </button>
        </div>
      </div>

      <AdminStatus type="error" message={form.error} />
      <AdminStatus type="success" message={form.success} />

      <div className="admin-list">
        {items
          .slice()
          .sort((a, b) => a.draft_sort_order - b.draft_sort_order)
          .map((item) => (
            <div className="admin-item" key={item.id}>
              <div className="admin-item-head">
                <strong>{item.draft_name || "Untitled"}</strong>
                <div className="admin-row-actions">
                  <button
                    className="admin-btn admin-btn-secondary"
                    type="button"
                    onClick={() => saveItem(item)}
                    disabled={form.loading}
                  >
                    Save
                  </button>
                  <button
                    className="admin-btn admin-btn-danger"
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={form.loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="admin-grid admin-grid-2">
                <div className="admin-field">
                  <label>Name</label>
                  <input
                    value={item.draft_name}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((t) =>
                          t.id === item.id
                            ? { ...t, draft_name: e.target.value }
                            : t,
                        ),
                      )
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>Source</label>
                  <input
                    value={item.draft_source}
                    onChange={(e) =>
                      setItems((prev) =>
                        prev.map((t) =>
                          t.id === item.id
                            ? { ...t, draft_source: e.target.value }
                            : t,
                        ),
                      )
                    }
                  />
                </div>
              </div>
              <div className="admin-field">
                <label>Quote (EN)</label>
                <textarea
                  value={item.draft_quote_en}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((t) =>
                        t.id === item.id
                          ? { ...t, draft_quote_en: e.target.value }
                          : t,
                      ),
                    )
                  }
                />
              </div>
              <div className="admin-field">
                <label>Quote (AR)</label>
                <textarea
                  value={item.draft_quote_ar}
                  dir="rtl"
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((t) =>
                        t.id === item.id
                          ? { ...t, draft_quote_ar: e.target.value }
                          : t,
                      ),
                    )
                  }
                />
              </div>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={item.draft_is_visible}
                  onChange={(e) =>
                    setItems((prev) =>
                      prev.map((t) =>
                        t.id === item.id
                          ? { ...t, draft_is_visible: e.target.checked }
                          : t,
                      ),
                    )
                  }
                />
                Visible
              </label>
            </div>
          ))}
      </div>
    </>
  );
}

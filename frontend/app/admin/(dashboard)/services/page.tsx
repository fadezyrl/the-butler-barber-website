"use client";

import { useCallback, useEffect, useState } from "react";

import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { useAdminForm } from "@/components/admin/useAdminForm";
import { HOW_TO_PUBLISH } from "@/lib/admin-media-guide";
import {
  deleteServiceCategory,
  deleteServiceItem,
  getAdminContent,
  publishSection,
  upsertServiceCategory,
  upsertServiceItem,
} from "@/lib/admin-api";

type CategoryRow = {
  id: string;
  slug: string;
  sort_order: number;
  draft_is_visible: boolean;
  draft_name_en: string;
  draft_name_ar: string;
};

type ItemRow = {
  id: string;
  category_id: string;
  slug: string;
  draft_price: string;
  draft_currency: string;
  draft_sort_order: number;
  draft_is_visible: boolean;
  draft_name_en: string;
  draft_name_ar: string;
};

export default function AdminServicesPage(): React.JSX.Element {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [booting, setBooting] = useState(true);
  const form = useAdminForm();

  const reload = useCallback(async (): Promise<void> => {
    const content = await getAdminContent();
    setCategories(content.services.categories as unknown as CategoryRow[]);
    setItems(content.services.items as unknown as ItemRow[]);
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

  const saveCategory = async (cat: CategoryRow): Promise<void> => {
    await form.run(async () => {
      await upsertServiceCategory({
        id: cat.id,
        slug: cat.slug,
        sortOrder: cat.sort_order,
        isVisible: cat.draft_is_visible,
        nameEn: cat.draft_name_en,
        nameAr: cat.draft_name_ar,
      });
      await reload();
    }, "Category saved.");
  };

  const addCategory = async (): Promise<void> => {
    const slug = window.prompt("New category slug (e.g. hair)");
    if (!slug) return;
    await form.run(async () => {
      await upsertServiceCategory({
        slug: slug.trim(),
        sortOrder: categories.length,
        isVisible: true,
        nameEn: slug,
        nameAr: slug,
      });
      await reload();
    }, "Category created.");
  };

  const removeCategory = async (id: string): Promise<void> => {
    if (!window.confirm("Delete this category and its items?")) return;
    await form.run(async () => {
      await deleteServiceCategory(id);
      await reload();
    }, "Category deleted.");
  };

  const saveItem = async (item: ItemRow): Promise<void> => {
    await form.run(async () => {
      await upsertServiceItem({
        id: item.id,
        categoryId: item.category_id,
        slug: item.slug,
        price: item.draft_price,
        currency: item.draft_currency,
        sortOrder: item.draft_sort_order,
        isVisible: item.draft_is_visible,
        nameEn: item.draft_name_en,
        nameAr: item.draft_name_ar,
      });
      await reload();
    }, "Service item saved.");
  };

  const addItem = async (categoryId: string): Promise<void> => {
    const slug = window.prompt("New service slug (e.g. classicCut)");
    if (!slug) return;
    await form.run(async () => {
      await upsertServiceItem({
        categoryId,
        slug: slug.trim(),
        price: "0.000 BD",
        currency: "BD",
        sortOrder: items.filter((i) => i.category_id === categoryId).length,
        isVisible: true,
        nameEn: slug,
        nameAr: slug,
      });
      await reload();
    }, "Service item created.");
  };

  const removeItem = async (id: string): Promise<void> => {
    if (!window.confirm("Delete this service item?")) return;
    await form.run(async () => {
      await deleteServiceItem(id);
      await reload();
    }, "Service item deleted.");
  };

  const onPublish = async (): Promise<void> => {
    await form.run(() => publishSection("services"), "Services published.");
  };

  if (booting) {
    return <div className="admin-loading">Loading services…</div>;
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Services & prices</h1>
          <p>Change service names and prices shown on the website menu.</p>
        </div>
        <div className="admin-actions">
          <button
            className="admin-btn admin-btn-secondary"
            type="button"
            onClick={addCategory}
            disabled={form.loading}
          >
            Add category
          </button>
          <button
            className="admin-btn"
            type="button"
            onClick={onPublish}
            disabled={form.loading}
          >
            Publish services
          </button>
        </div>
      </div>

      <AdminGuide
        title="How to update a price"
        steps={[
          "Find the service in the list below.",
          "Edit the English / Arabic name if needed.",
          "Change the price (example: 2.500 BD).",
          "Click Save on that row, then Publish services.",
        ]}
      >
        <p>{HOW_TO_PUBLISH}</p>
      </AdminGuide>

      <AdminStatus type="error" message={form.error} />
      <AdminStatus type="success" message={form.success} />

      <div className="admin-list">
        {categories
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((cat) => (
            <div className="admin-item" key={cat.id}>
              <div className="admin-item-head">
                <strong>{cat.draft_name_en || cat.slug}</strong>
                <div className="admin-row-actions">
                  <button
                    className="admin-btn admin-btn-secondary"
                    type="button"
                    onClick={() => saveCategory(cat)}
                    disabled={form.loading}
                  >
                    Save category
                  </button>
                  <button
                    className="admin-btn admin-btn-secondary"
                    type="button"
                    onClick={() => addItem(cat.id)}
                    disabled={form.loading}
                  >
                    Add item
                  </button>
                  <button
                    className="admin-btn admin-btn-danger"
                    type="button"
                    onClick={() => removeCategory(cat.id)}
                    disabled={form.loading}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="admin-grid admin-grid-2">
                <div className="admin-field">
                  <label>Slug</label>
                  <input
                    value={cat.slug}
                    onChange={(e) =>
                      setCategories((prev) =>
                        prev.map((c) =>
                          c.id === cat.id ? { ...c, slug: e.target.value } : c,
                        ),
                      )
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>Sort order</label>
                  <input
                    type="number"
                    value={cat.sort_order}
                    onChange={(e) =>
                      setCategories((prev) =>
                        prev.map((c) =>
                          c.id === cat.id
                            ? { ...c, sort_order: Number(e.target.value) }
                            : c,
                        ),
                      )
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>Name (EN)</label>
                  <input
                    value={cat.draft_name_en}
                    onChange={(e) =>
                      setCategories((prev) =>
                        prev.map((c) =>
                          c.id === cat.id
                            ? { ...c, draft_name_en: e.target.value }
                            : c,
                        ),
                      )
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>Name (AR)</label>
                  <input
                    value={cat.draft_name_ar}
                    dir="rtl"
                    onChange={(e) =>
                      setCategories((prev) =>
                        prev.map((c) =>
                          c.id === cat.id
                            ? { ...c, draft_name_ar: e.target.value }
                            : c,
                        ),
                      )
                    }
                  />
                </div>
              </div>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={cat.draft_is_visible}
                  onChange={(e) =>
                    setCategories((prev) =>
                      prev.map((c) =>
                        c.id === cat.id
                          ? { ...c, draft_is_visible: e.target.checked }
                          : c,
                      ),
                    )
                  }
                />
                Visible
              </label>

              {items
                .filter((i) => i.category_id === cat.id)
                .sort((a, b) => a.draft_sort_order - b.draft_sort_order)
                .map((item) => (
                  <div
                    key={item.id}
                    className="admin-card"
                    style={{ marginTop: 12, marginBottom: 0 }}
                  >
                    <div className="admin-item-head">
                      <strong>{item.draft_name_en || item.slug}</strong>
                      <div className="admin-row-actions">
                        <button
                          className="admin-btn admin-btn-secondary"
                          type="button"
                          onClick={() => saveItem(item)}
                          disabled={form.loading}
                        >
                          Save item
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
                        <label>Slug</label>
                        <input
                          value={item.slug}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((i) =>
                                i.id === item.id
                                  ? { ...i, slug: e.target.value }
                                  : i,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Price</label>
                        <input
                          value={item.draft_price}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((i) =>
                                i.id === item.id
                                  ? { ...i, draft_price: e.target.value }
                                  : i,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Name (EN)</label>
                        <input
                          value={item.draft_name_en}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((i) =>
                                i.id === item.id
                                  ? { ...i, draft_name_en: e.target.value }
                                  : i,
                              ),
                            )
                          }
                        />
                      </div>
                      <div className="admin-field">
                        <label>Name (AR)</label>
                        <input
                          value={item.draft_name_ar}
                          dir="rtl"
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((i) =>
                                i.id === item.id
                                  ? { ...i, draft_name_ar: e.target.value }
                                  : i,
                              ),
                            )
                          }
                        />
                      </div>
                    </div>
                    <label className="admin-check">
                      <input
                        type="checkbox"
                        checked={item.draft_is_visible}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((i) =>
                              i.id === item.id
                                ? { ...i, draft_is_visible: e.target.checked }
                                : i,
                            ),
                          )
                        }
                      />
                      Visible
                    </label>
                  </div>
                ))}
            </div>
          ))}
      </div>
    </>
  );
}

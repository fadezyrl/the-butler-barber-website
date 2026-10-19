"use client";

import { useEffect, useState, type FormEvent } from "react";

import { AdminGuide } from "@/components/admin/AdminGuide";
import { AdminStatus } from "@/components/admin/AdminStatus";
import { useAdminForm } from "@/components/admin/useAdminForm";
import { HOW_TO_PUBLISH } from "@/lib/admin-media-guide";
import {
  getAdminContent,
  publishSection,
  saveHoursDraft,
} from "@/lib/admin-api";

type HourDraft = {
  day: "sat" | "sun" | "mon" | "tue" | "wed" | "thu" | "fri";
  isClosed: boolean;
  opens: string;
  closes: string;
  displayOverride: string | null;
};

const DAY_ORDER = ["sat", "sun", "mon", "tue", "wed", "thu", "fri"] as const;

const DAY_LABEL: Record<(typeof DAY_ORDER)[number], string> = {
  sat: "Saturday",
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
};

export default function AdminHoursPage(): React.JSX.Element {
  const [days, setDays] = useState<HourDraft[]>([]);
  const [booting, setBooting] = useState(true);
  const form = useAdminForm();

  useEffect(() => {
    getAdminContent()
      .then((content) => {
        const mapped = DAY_ORDER.map((day) => {
          const row = content.hours.find(
            (h) => (h as { day?: string }).day === day,
          ) as
            | {
                day: HourDraft["day"];
                draft_is_closed?: boolean;
                draft_opens?: string;
                draft_closes?: string;
                draft_display_override?: string | null;
              }
            | undefined;
          return {
            day,
            isClosed: row?.draft_is_closed ?? false,
            opens: row?.draft_opens ?? "09:00",
            closes: row?.draft_closes ?? "23:30",
            displayOverride: row?.draft_display_override ?? null,
          };
        });
        setDays(mapped);
      })
      .catch((err) =>
        form.setStatus({
          loading: false,
          error: err instanceof Error ? err.message : "Failed to load",
          success: null,
        }),
      )
      .finally(() => setBooting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patchDay = (
    day: HourDraft["day"],
    next: Partial<HourDraft>,
  ): void => {
    setDays((prev) =>
      prev.map((d) => (d.day === day ? { ...d, ...next } : d)),
    );
  };

  const onSaveAndPublish = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    await form.run(async () => {
      await saveHoursDraft(
        days.map((d) => ({
          day: d.day,
          isClosed: d.isClosed,
          opens: d.opens,
          closes: d.closes,
          displayOverride: d.displayOverride || null,
        })),
      );
      await publishSection("hours");
    }, "Saved and published to the live site.");
  };

  if (booting) {
    return <div className="admin-loading">Loading hours…</div>;
  }

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Opening hours</h1>
          <p>Set open and close times for each day (or mark a day closed).</p>
        </div>
        <div className="admin-actions">
          <button
            className="admin-btn"
            type="submit"
            form="hours-form"
            disabled={form.loading}
          >
            {form.loading ? "Saving…" : "Save & publish"}
          </button>
        </div>
      </div>

      <AdminGuide
        title="Tips"
        steps={[
          "Use 24-hour time like 09:00 and 23:30.",
          "Tick Closed if the shop is shut that day.",
          "Optional display text can override what visitors see (e.g. 9 AM – 11:30 PM).",
          "Click Save & publish when done.",
        ]}
      >
        <p>{HOW_TO_PUBLISH}</p>
      </AdminGuide>

      <AdminStatus type="error" message={form.error} />
      <AdminStatus type="success" message={form.success} />

      <form id="hours-form" onSubmit={onSaveAndPublish}>
        <div className="admin-list">
          {days.map((day) => (
            <div className="admin-item" key={day.day}>
              <div className="admin-item-head">
                <strong>{DAY_LABEL[day.day]}</strong>
                <label className="admin-check" style={{ marginBottom: 0 }}>
                  <input
                    type="checkbox"
                    checked={day.isClosed}
                    onChange={(e) =>
                      patchDay(day.day, { isClosed: e.target.checked })
                    }
                  />
                  Closed
                </label>
              </div>
              <div className="admin-grid admin-grid-3">
                <div className="admin-field">
                  <label>Opens</label>
                  <input
                    type="time"
                    value={day.opens}
                    disabled={day.isClosed}
                    onChange={(e) =>
                      patchDay(day.day, { opens: e.target.value })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>Closes</label>
                  <input
                    type="time"
                    value={day.closes}
                    disabled={day.isClosed}
                    onChange={(e) =>
                      patchDay(day.day, { closes: e.target.value })
                    }
                  />
                </div>
                <div className="admin-field">
                  <label>Display override</label>
                  <input
                    value={day.displayOverride || ""}
                    placeholder="e.g. 9:00 AM – 11:30 PM"
                    onChange={(e) =>
                      patchDay(day.day, {
                        displayOverride: e.target.value || null,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </form>
    </>
  );
}

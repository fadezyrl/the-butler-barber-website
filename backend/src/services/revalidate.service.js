import { env } from "../config/env.js";

export const triggerRevalidate = async (tags = ["cms", "cms-home"]) => {
  try {
    const res = await fetch(env.NEXT_REVALIDATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": env.REVALIDATE_SECRET,
      },
      body: JSON.stringify({ tags }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Revalidate failed:", res.status, text);
      return { ok: false, status: res.status, body: text };
    }

    const data = await res.json().catch(() => ({}));
    return { ok: true, data };
  } catch (err) {
    console.error("Revalidate request error:", err.message);
    return { ok: false, error: err.message };
  }
};

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { AdminStatus } from "@/components/admin/AdminStatus";
import {
  AdminApiError,
  adminLogin,
  adminMe,
  getAdminToken,
} from "@/lib/admin-api";

import "../admin.css";

export default function AdminLoginPage(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setChecking(false);
      return;
    }
    adminMe()
      .then(() => router.replace("/admin"))
      .catch(() => setChecking(false));
  }, [router]);

  const onSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await adminLogin(email.trim(), password);
      router.replace("/admin");
    } catch (err) {
      setError(
        err instanceof AdminApiError
          ? err.message
          : "Unable to sign in. Check your credentials.",
      );
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="admin-root">
        <div className="admin-login">
          <p className="admin-muted">Checking session…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-root">
      <div className="admin-login">
        <form className="admin-login-card" onSubmit={onSubmit}>
          <h1>Butler CMS</h1>
          <p>Sign in to manage The Butler Barber website content.</p>
          <AdminStatus type="error" message={error} />
          <div className="admin-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="admin-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="admin-btn" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

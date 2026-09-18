"use client";

import { useEffect, useState } from "react";

/**
 * One page, two modes. It asks the server whether an account exists yet: if not,
 * it offers first-run setup (create the single admin); if so, it offers sign-in.
 * The password is typed here in the browser and posted straight to the server —
 * it is never shown to anyone or written anywhere but the hashed column.
 */
export default function LoginPage() {
  const [mode, setMode] = useState<"loading" | "setup" | "login">("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((s) => {
        if (s.authenticated) { window.location.href = "/admin"; return; }
        setMode(s.hasAdmin ? "login" : "setup");
      })
      .catch(() => setMode("login"));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (mode === "setup" && password !== confirm) {
      setError("كلمتا السر مش متطابقتين");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "حصل خطأ، حاول تاني"); return; }
      window.location.href = "/admin";
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setBusy(false);
    }
  }

  if (mode === "loading") {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", color: "var(--muted)" }}>…</div>;
  }

  const isSetup = mode === "setup";

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <div style={{ fontSize: 13, letterSpacing: ".25em", color: "var(--accent)", marginBottom: 8 }}>
            GLOBAL UNTOLD STORY
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>
            {isSetup ? "إنشاء حساب المدير" : "تسجيل الدخول"}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 8 }}>
            {isSetup
              ? "أول مرة — اختار بريدك وكلمة سر للوحة التحكم"
              : "لوحة تحكم الموقع"}
          </p>
        </div>

        <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>البريد الإلكتروني</span>
            <input type="email" required autoComplete="username" dir="ltr"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>كلمة السر</span>
            <input type="password" required dir="ltr"
              autoComplete={isSetup ? "new-password" : "current-password"}
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          {isSetup && (
            <label style={{ display: "grid", gap: 6 }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>تأكيد كلمة السر</span>
              <input type="password" required dir="ltr" autoComplete="new-password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </label>
          )}

          {error && (
            <div style={{ background: "color-mix(in srgb, var(--danger) 18%, transparent)",
              color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: 8,
              padding: "9px 12px", fontSize: 13 }}>
              {error}
            </div>
          )}

          <button type="submit" className="primary" disabled={busy} style={{ marginTop: 4 }}>
            {busy ? "…" : isSetup ? "إنشاء الحساب والدخول" : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }
  return (
    <button onClick={logout} style={{ fontSize: 13, padding: "7px 12px" }}>
      خروج
    </button>
  );
}

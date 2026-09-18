import "server-only";

/**
 * Trigger a production rebuild through the Vercel Deploy Hook.
 *
 * The public site is static, so a content change only reaches visitors after a
 * rebuild. Saving in the dashboard fires this (best-effort) so edits publish on
 * their own, and the "publish now" button forces it. A short cooldown coalesces
 * a burst of saves into one build instead of one build per keystroke-save; the
 * force path (the button) ignores the cooldown, so the editor can always make
 * sure the very latest state is building.
 *
 * Set VERCEL_DEPLOY_HOOK_URL to the hook's URL (Vercel → Settings → Git → Deploy
 * Hooks). Without it, nothing is triggered and the dashboard simply says so.
 */
const COOLDOWN_MS = 60_000;
const KEY = Symbol.for("globaluntoldstory.deploy.state");
const state = ((globalThis as unknown as Record<symbol, { lastAt: number }>)[KEY] ??= { lastAt: 0 });

export const deployConfigured = (): boolean => Boolean(process.env.VERCEL_DEPLOY_HOOK_URL);

export type DeployResult = { triggered: boolean; reason?: "not-configured" | "cooldown" | "network" | string };

export async function triggerDeploy(opts?: { force?: boolean }): Promise<DeployResult> {
  const url = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!url) return { triggered: false, reason: "not-configured" };

  const now = Date.now();
  if (!opts?.force && now - state.lastAt < COOLDOWN_MS) return { triggered: false, reason: "cooldown" };

  state.lastAt = now;
  try {
    const res = await fetch(url, { method: "POST" });
    if (!res.ok) { state.lastAt = 0; return { triggered: false, reason: `http-${res.status}` }; }
    return { triggered: true };
  } catch {
    state.lastAt = 0;
    return { triggered: false, reason: "network" };
  }
}

/*
 * Ported from src/svcGreeting.js (formerly window.svcFetchFirstName). Same
 * fetch + alias/first-name parsing logic, now Promise-based instead of a
 * `window.*` global bridged via setInterval polling for script.js's load
 * order.
 */

interface CurrentUserResponse {
  user?: {
    name?: string;
    details?: { name?: string };
    user_fields?: {
      full_name?: string;
      preferred_name?: string;
      first_name?: string;
    };
  };
}

function looksLikeAlias(value: unknown): boolean {
  if (!value) return true;
  const s = String(value).trim();
  if (!s) return true;
  if (s.indexOf("@") !== -1) return true;
  if (/^[a-z0-9._-]+$/.test(s) && s.indexOf(" ") === -1) return true;
  return false;
}

function firstNameOf(name: unknown): string {
  const s = String(name || "").trim();
  if (!s) return "";
  if (s.indexOf(",") !== -1) {
    const parts = s
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    const lastFirst = parts.length >= 2 ? parts[1] : undefined;
    if (lastFirst) return lastFirst.split(/\s+/)[0] ?? "";
  }
  return s.split(/\s+/)[0] ?? "";
}

// Fetches the signed-in user and resolves their display first name (or ""
// if unavailable/anonymous/alias-only). Never rejects — network or parsing
// failures resolve to "" so callers don't need their own try/catch.
export function fetchDisplayFirstName(): Promise<string> {
  return fetch("/api/v2/users/me.json", {
    headers: { Accept: "application/json" },
    credentials: "same-origin",
  })
    .then((r) => (r.ok ? (r.json() as Promise<CurrentUserResponse>) : null))
    .then((d) => {
      const u = d?.user;
      if (!u) return "";
      const candidates = [
        u.name,
        u.details?.name,
        u.user_fields?.full_name ||
          u.user_fields?.preferred_name ||
          u.user_fields?.first_name,
      ];
      const realName = candidates.find((c) => !looksLikeAlias(c)) || u.name;
      return firstNameOf(realName);
    })
    .catch(() => "");
}

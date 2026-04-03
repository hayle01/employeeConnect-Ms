export function getPublicAppUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }

  const fromEnv = import.meta.env.VITE_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  return "";
}
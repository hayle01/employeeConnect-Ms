export function getPublicAppUrl(): string {
  const fromEnv = import.meta.env.VITE_PUBLIC_APP_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

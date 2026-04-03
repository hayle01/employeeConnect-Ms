const SUFFIX = "@employeeconnect.com";

export function usernameToEmail(username: string): string {
  const normalized = username.trim().toLowerCase();
  return `${normalized}${SUFFIX}`;
}

export function emailToUsername(email: string): string {
  return email.replace(SUFFIX, "").toLowerCase();
}

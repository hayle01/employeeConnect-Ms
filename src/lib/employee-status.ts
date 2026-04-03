export type EmployeeStatus = "Active" | "Expired";

export function computeStatus(expireDate: string): EmployeeStatus {
  const exp = new Date(expireDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return exp >= today ? "Active" : "Expired";
}

export function formatDateDisplay(isoDate: string): string {
  const d = new Date(isoDate + "T00:00:00");
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

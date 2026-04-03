import { nanoid } from "nanoid";
import { supabase } from "@/lib/supabase/client";
import { computeStatus } from "@/lib/employee-status";
import { getPublicAppUrl } from "@/lib/env";
import { dataUrlToBlob, generateQrDataUrl } from "@/lib/qr/generate";
import type { Employee, EmployeeHistory } from "@/types/database";

export function historyPayloadFromEmployee(
  e: Employee,
  action: "update" | "renew",
): Omit<EmployeeHistory, "id" | "recorded_at"> {
  return {
    employee_id: e.id,
    action_type: action,
    emp_no: e.emp_no,
    name: e.name,
    title_en: e.title_en,
    title_local: e.title_local,
    department: e.department,
    mobile: e.mobile,
    email: e.email,
    national_id: e.national_id,
    address: e.address,
    district: e.district,
    issue_date: e.issue_date,
    expire_date: e.expire_date,
    profile_image_url: e.profile_image_url,
    qr_image_url: e.qr_image_url,
    public_slug: e.public_slug,
    status_at_that_time: computeStatus(e.expire_date),
  };
}

export async function insertEmployeeHistory(row: Omit<EmployeeHistory, "id" | "recorded_at">) {
  const { error } = await supabase.from("employee_history").insert(row);
  if (error) throw error;
}

export async function uploadProfileImage(employeeId: string, file: File): Promise<{ path: string; publicUrl: string }> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${employeeId}/${nanoid()}.${ext}`;
  const { error } = await supabase.storage.from("employee-profiles").upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("employee-profiles").getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function uploadQrPng(employeeId: string, slug: string, dataUrl: string): Promise<{ path: string; publicUrl: string }> {
  const blob = await dataUrlToBlob(dataUrl);
  const path = `${employeeId}/${slug}.png`;
  const { error } = await supabase.storage.from("employee-qrcodes").upload(path, blob, { upsert: true, contentType: "image/png" });
  if (error) throw error;
  const { data } = supabase.storage.from("employee-qrcodes").getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export function verificationUrlForSlug(slug: string): string {
  const base = getPublicAppUrl();
  return `${base}/employee-public/${slug}`;
}

export async function ensureQrForEmployee(employee: Employee): Promise<Pick<Employee, "qr_image_url" | "qr_image_path">> {
  const url = verificationUrlForSlug(employee.public_slug);
  const dataUrl = await generateQrDataUrl(url);
  const { path, publicUrl } = await uploadQrPng(employee.id, employee.public_slug, dataUrl);
  return { qr_image_path: path, qr_image_url: publicUrl };
}

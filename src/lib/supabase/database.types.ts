export type UserRole = "admin" | "staff";

export interface Profile {
  id: string;
  username: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  emp_no: string;
  name: string;
  title_en: string;
  title_local: string;
  department: string;
  mobile: string;
  email: string | null;
  national_id: string;
  address: string;
  district: string;
  issue_date: string;
  expire_date: string;
  profile_image_url: string | null;
  profile_image_path: string | null;
  qr_image_url: string | null;
  qr_image_path: string | null;
  public_slug: string;
  created_at: string;
  updated_at: string;
}

export interface EmployeeHistory {
  id: string;
  employee_id: string;
  action_type: "update" | "renew";
  emp_no: string;
  name: string;
  title_en: string;
  title_local: string;
  department: string;
  mobile: string;
  email: string | null;
  national_id: string;
  address: string;
  district: string;
  issue_date: string;
  expire_date: string;
  profile_image_url: string | null;
  qr_image_url: string | null;
  public_slug: string;
  status_at_that_time: "Active" | "Expired";
  recorded_at: string;
}

export interface PublicEmployeePayload {
  name: string;
  title_en: string;
  title_local: string;
  department: string;
  national_id: string;
  address: string;
  district: string;
  issue_date: string;
  expire_date: string;
  profile_image_url: string | null;
  status: "Active" | "Expired";
}
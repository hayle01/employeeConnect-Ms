import { z } from "zod";

export const employeeFormSchema = z
  .object({
    emp_no: z.string().min(1, "Employee number is required"),
    name: z.string().min(1, "Full name is required"),
    title_en: z.string().min(1, "English title is required"),
    title_local: z.string().min(1, "Local title is required"),
    department: z.string().min(1, "Department is required"),
    mobile: z.string().min(1, "Mobile number is required"),
    email: z
      .string()
      .optional()
      .transform((v) => (v === "" || v === undefined ? undefined : v))
      .pipe(z.union([z.undefined(), z.string().email("Invalid email")])),
    national_id: z.string().min(1, "National ID is required"),
    address: z.string().min(1, "Address is required"),
    district: z.string().min(1, "District is required"),
    issue_date: z.string().min(1, "Issue date is required"),
    expire_date: z.string().min(1, "Expiry date is required"),
  })
  .refine(
    (data) => {
      const issue = new Date(data.issue_date + "T00:00:00");
      const exp = new Date(data.expire_date + "T00:00:00");
      return exp >= issue;
    },
    { message: "Expiry date cannot be before issue date", path: ["expire_date"] },
  );

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export const createUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Minimum 6 characters"),
  role: z.enum(["admin", "staff"]),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Minimum 6 characters"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

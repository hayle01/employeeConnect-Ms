import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { supabase } from "@/lib/supabase/client";
import { employeeFormSchema, type EmployeeFormValues } from "@/lib/validations/employee";
import {
  ensureQrForEmployee,
  historyPayloadFromEmployee,
  insertEmployeeHistory,
  uploadProfileImage,
} from "@/lib/employees/service";
import { useEmployeeQuery } from "@/hooks/use-employees";
import type { Employee } from "@/types/database";

export function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: row, isLoading, error } = useEmployeeQuery(id);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
  });

  useEffect(() => {
    if (!row) return;
    form.reset({
      emp_no: row.emp_no,
      name: row.name,
      title_en: row.title_en,
      title_local: row.title_local,
      department: row.department,
      mobile: row.mobile,
      email: row.email ?? "",
      national_id: row.national_id,
      address: row.address,
      district: row.district,
      issue_date: row.issue_date,
      expire_date: row.expire_date,
    });
  }, [row, form]);

  const onFileChange = (f: File | null) => {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (!row || !id) return;
    if (file && file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2MB or smaller");
      return;
    }
    setSubmitting(true);

    await insertEmployeeHistory(historyPayloadFromEmployee(row, "update"));

    let profile_image_url = row.profile_image_url;
    let profile_image_path = row.profile_image_path;
    if (file) {
      const up = await uploadProfileImage(row.id, file);
      profile_image_path = up.path;
      profile_image_url = up.publicUrl;
    }

    const updatePayload = {
      emp_no: values.emp_no.trim(),
      name: values.name.trim(),
      title_en: values.title_en.trim(),
      title_local: values.title_local.trim(),
      department: values.department.trim(),
      mobile: values.mobile.trim(),
      email: values.email?.trim() || null,
      national_id: values.national_id.trim(),
      address: values.address.trim(),
      district: values.district.trim(),
      issue_date: values.issue_date,
      expire_date: values.expire_date,
      profile_image_url,
      profile_image_path,
    };

    const { data: updated, error: uerr } = await supabase
      .from("employees")
      .update(updatePayload)
      .eq("id", id)
      .select("*")
      .single();

    if (uerr || !updated) {
      toast.error(uerr?.message ?? "Update failed");
      setSubmitting(false);
      return;
    }

    let emp = updated as Employee;
    try {
      const qr = await ensureQrForEmployee(emp);
      const { data: fin } = await supabase
        .from("employees")
        .update({ qr_image_path: qr.qr_image_path, qr_image_url: qr.qr_image_url })
        .eq("id", emp.id)
        .select("*")
        .single();
      if (fin) emp = fin as Employee;
    } catch (e) {
      console.error(e);
    }

    toast.success("Employee updated");
    void qc.invalidateQueries({ queryKey: ["employees"] });
    void qc.invalidateQueries({ queryKey: ["employee", id] });
    void qc.invalidateQueries({ queryKey: ["employee-history", id] });
    setSubmitting(false);
    navigate(`/employees/${id}`);
  });

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (error || !row) return <div className="text-destructive">Employee not found.</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to="/employees" className="inline-flex items-center gap-2 text-sm font-medium text-[#0099CC] hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to List
      </Link>
      <h1 className="text-2xl font-semibold text-slate-900">Edit Employee</h1>

      <form onSubmit={onSubmit} className="space-y-8">
        <EmployeeForm
          register={form.register}
          errors={form.formState.errors}
          previewUrl={preview}
          onFileChange={onFileChange}
          existingImageUrl={row.profile_image_url}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Fields marked with * are mandatory.</p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(`/employees/${id}`)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[#0099CC] hover:bg-[#0099CC]/90" disabled={submitting}>
              {submitting ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

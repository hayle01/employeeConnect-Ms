import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { nanoid } from "nanoid";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { supabase } from "@/lib/supabase/client";
import { employeeFormSchema, type EmployeeFormValues } from "@/lib/validations/employee";
import { ensureQrForEmployee, uploadProfileImage } from "@/lib/employees/service";
import type { Employee } from "@/types/database";

export function EmployeeNewPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      emp_no: "",
      name: "",
      title_en: "",
      title_local: "",
      department: "",
      mobile: "",
      email: "",
      national_id: "",
      address: "",
      district: "",
      issue_date: "",
      expire_date: "",
    },
  });

  const onFileChange = (f: File | null) => {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (file && file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2MB or smaller");
      return;
    }
    setSubmitting(true);
    const public_slug = nanoid(12);
    const insertPayload = {
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
      public_slug,
      profile_image_url: null as string | null,
      profile_image_path: null as string | null,
      qr_image_url: null as string | null,
      qr_image_path: null as string | null,
    };

    const { data: created, error } = await supabase.from("employees").insert(insertPayload).select("*").single();
    if (error || !created) {
      toast.error(error?.message ?? "Could not create employee");
      setSubmitting(false);
      return;
    }

    let emp = created as Employee;

    try {
      if (file) {
        const { path, publicUrl } = await uploadProfileImage(emp.id, file);
        const { data: upd, error: uerr } = await supabase
          .from("employees")
          .update({ profile_image_path: path, profile_image_url: publicUrl })
          .eq("id", emp.id)
          .select("*")
          .single();
        if (!uerr && upd) emp = upd as Employee;
      }

      const qr = await ensureQrForEmployee(emp);
      const { data: final } = await supabase
        .from("employees")
        .update({ qr_image_path: qr.qr_image_path, qr_image_url: qr.qr_image_url })
        .eq("id", emp.id)
        .select("*")
        .single();
      if (final) emp = final as Employee;
    } catch (e) {
      console.error(e);
      toast.error("Employee saved but QR upload had an issue");
    }

    toast.success("Employee created");
    void qc.invalidateQueries({ queryKey: ["employees"] });
    setSubmitting(false);
    navigate(`/employees/${emp.id}`);
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to="/employees" className="inline-flex items-center gap-2 text-sm font-medium text-[#0099CC] hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to List
      </Link>
      <h1 className="text-2xl font-semibold text-slate-900">Add Employee</h1>

      <form onSubmit={onSubmit} className="space-y-8">
        <EmployeeForm
          register={form.register}
          errors={form.formState.errors}
          previewUrl={preview}
          onFileChange={onFileChange}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Fields marked with * are mandatory.</p>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate("/employees")}>
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

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import {
  ensureQrForEmployee,
  historyPayloadFromEmployee,
  insertEmployeeHistory,
  uploadProfileImage,
} from "@/lib/employees/service";
import { useEmployeeQuery } from "@/hooks/use-employees";
import { Upload } from "lucide-react";

const renewSchema = z
  .object({
    title_en: z.string().min(1),
    title_local: z.string().min(1),
    department: z.string().min(1),
    mobile: z.string().min(1),
    email: z.string().optional(),
    national_id: z.string().min(1),
    address: z.string().min(1),
    district: z.string().min(1),
    issue_date: z.string().min(1),
    expire_date: z.string().min(1),
  })
  .refine((d) => new Date(d.expire_date) >= new Date(d.issue_date), { path: ["expire_date"] });

type RenewValues = z.infer<typeof renewSchema>;

export function EmployeeRenewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: row, isLoading, error } = useEmployeeQuery(id);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<RenewValues>({ resolver: zodResolver(renewSchema) });

  useEffect(() => {
    if (!row) return;
    form.reset({
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

  const onSubmit = form.handleSubmit(async (values) => {
    if (!row || !id) return;
    if (file && file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2MB or smaller");
      return;
    }
    setSubmitting(true);

    await insertEmployeeHistory(historyPayloadFromEmployee(row, "renew"));

    let profile_image_url = row.profile_image_url;
    let profile_image_path = row.profile_image_path;
    if (file) {
      const up = await uploadProfileImage(row.id, file);
      profile_image_path = up.path;
      profile_image_url = up.publicUrl;
    }

    const { data: updated, error: uerr } = await supabase
      .from("employees")
      .update({
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
      })
      .eq("id", id)
      .select("*")
      .single();

    if (uerr || !updated) {
      toast.error(uerr?.message ?? "Renew failed");
      setSubmitting(false);
      return;
    }

    let emp = updated as typeof row;
    try {
      const qr = await ensureQrForEmployee(emp as never);
      const { data: fin } = await supabase
        .from("employees")
        .update({ qr_image_path: qr.qr_image_path, qr_image_url: qr.qr_image_url })
        .eq("id", emp.id)
        .select("*")
        .single();
      if (fin) emp = fin as typeof row;
    } catch (e) {
      console.error(e);
    }

    toast.success("Employee renewed");
    void qc.invalidateQueries({ queryKey: ["employees"] });
    void qc.invalidateQueries({ queryKey: ["employee", id] });
    void qc.invalidateQueries({ queryKey: ["employee-history", id] });
    setSubmitting(false);
    navigate(`/employees/${id}`);
  });

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (error || !row) return <div className="text-destructive">Employee not found.</div>;

  const reg = form.register;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to={`/employees/${row.id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#0099CC] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Employee
      </Link>
      <h1 className="text-2xl font-semibold text-slate-900">Renew Employee</h1>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Lambarka Shaqaalaha / Employee Number / رقم الموظف</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Employee Number</p>
            <p className="font-medium">{row.emp_no}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Full Name</p>
            <p className="font-medium">{row.name}</p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Renewal details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-slate-50">
                  {preview || row.profile_image_url ? (
                    <img src={preview ?? row.profile_image_url ?? ""} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setFile(f);
                    if (preview) URL.revokeObjectURL(preview);
                    setPreview(f ? URL.createObjectURL(f) : null);
                  }}
                />
                <button
                  type="button"
                  className="text-sm font-medium text-[#0099CC] hover:underline"
                  onClick={() => inputRef.current?.click()}
                >
                  Select File
                </button>
                <p className="text-center text-xs text-muted-foreground">Max 2MB. JPG, PNG supported.</p>
              </div>
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Cinwaanka Ingiriis / English Title</Label>
                  <Input {...reg("title_en")} />
                  {form.formState.errors.title_en && (
                    <p className="text-sm text-destructive">{form.formState.errors.title_en.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Cinwaanka Maxalli / Local Title (Somali)</Label>
                  <Input {...reg("title_local")} />
                </div>
                <div className="space-y-2">
                  <Label>Waaxda / Department</Label>
                  <Input {...reg("department")} />
                </div>
                <div className="space-y-2">
                  <Label>Mobile</Label>
                  <Input {...reg("mobile")} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Email</Label>
                  <Input type="email" {...reg("email")} />
                </div>
                <div className="space-y-2">
                  <Label>National ID</Label>
                  <Input {...reg("national_id")} />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input {...reg("address")} />
                </div>
                <div className="space-y-2">
                  <Label>District</Label>
                  <Input {...reg("district")} />
                </div>
                <div className="space-y-2">
                  <Label>Issue Date</Label>
                  <Input type="date" {...reg("issue_date")} />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input type="date" {...reg("expire_date")} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground">Renew will create a dedicated renewal history record.</p>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(`/employees/${id}`)}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#0099CC] hover:bg-[#0099CC]/90" disabled={submitting}>
            {submitting ? "Renewing…" : "Renew"}
          </Button>
        </div>
      </form>
    </div>
  );
}

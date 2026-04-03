import { useRef, useState } from "react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmployeeFormValues } from "@/lib/validations/employee";

type Props = {
  register: UseFormRegister<EmployeeFormValues>;
  errors: FieldErrors<EmployeeFormValues>;
  previewUrl: string | null;
  onFileChange: (file: File | null) => void;
  existingImageUrl?: string | null;
};

export function EmployeeForm({
  register,
  errors,
  previewUrl,
  onFileChange,
  existingImageUrl,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Macluumaadka Qofka / Personal Information / المعلومات الشخصية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-slate-50">
                {previewUrl || existingImageUrl ? (
                  <img
                    src={previewUrl ?? existingImageUrl ?? ""}
                    alt=""
                    className="h-full w-full object-cover"
                  />
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
                  setFileName(f?.name ?? null);
                  onFileChange(f);
                }}
              />
              <button
                type="button"
                className="text-sm font-medium text-[#0099CC] hover:underline"
                onClick={() => inputRef.current?.click()}>
                Select File
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Max 2MB. JPG, PNG supported.
              </p>
              {fileName && <p className="text-xs text-slate-600">{fileName}</p>}
            </div>
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <Field
                label="Lambarka Shaqaalaha / Employee Number / رقم الموظف"
                error={errors.emp_no?.message}>
                <Input placeholder="EMP-001" {...register("emp_no")} />
              </Field>
              <Field
                label="Magaca Buuxa / Full Name / الاسم الكامل"
                error={errors.name?.message}>
                <Input placeholder="Enter a name" {...register("name")} />
              </Field>
              <Field
                label="Cinwaanka Ingiriis / English Title / المسمى الوظيفي"
                error={errors.title_en?.message}>
                <Input
                  placeholder="General Director"
                  {...register("title_en")}
                />
              </Field>
              <Field
                label="Cinwaanka Maxalli / Local Title / المسمى المحلي"
                error={errors.title_local?.message}>
                <Input
                  placeholder="Agaasimaha Guud"
                  {...register("title_local")}
                />
              </Field>
              <Field
                label="Waaxda / Department / القسم"
                error={errors.department?.message}>
                <Input
                  placeholder="Administration"
                  {...register("department")}
                />
              </Field>
              <Field
                label="Mobile Number / Mobile Number / رقم الجوال"
                error={errors.mobile?.message}>
                <Input placeholder="+252..." {...register("mobile")} />
              </Field>
              <div className="sm:col-span-2">
                <Field
                  label="Email / Email / البريد"
                  error={errors.email?.message as string | undefined}>
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    {...register("email")}
                  />
                </Field>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Contact & Location / الاتصال والموقع
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Cinwaanka / Address / العنوان"
            error={errors.address?.message}>
            <Input placeholder="123 Main St, City" {...register("address")} />
          </Field>
          <Field
            label="Degmada / District / المنطقة"
            error={errors.district?.message}>
            <Input placeholder="Banadir" {...register("district")} />
          </Field>
        </CardContent>
      </Card>

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Dukumentiga Aqoonsiga / Identity Documentation / وثائق الهوية
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Aqoonsiga Qaranka / National ID / الهوية الوطنية"
            error={errors.national_id?.message}>
            <Input placeholder="ID-123456789" {...register("national_id")} />
          </Field>
          <Field
            label="Taariikhda La Bixiyay / Issue Date / تاريخ الإصدار"
            error={errors.issue_date?.message}>
            <Input type="date" {...register("issue_date")} />
          </Field>
          <Field
            label="Taariikhda Dhicitaanka / Expiry Date / تاريخ الانتهاء"
            error={errors.expire_date?.message}>
            <Input type="date" {...register("expire_date")} />
          </Field>
          <p className="text-xs text-muted-foreground sm:col-span-2">
            Status will be computed based on this date.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium leading-snug text-slate-700">
        {label}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

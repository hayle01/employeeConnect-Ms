import { Link, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Pencil,
  RefreshCw,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { computeStatus, formatDateDisplay } from "@/lib/employee-status";
import {
  useEmployeeHistoryQuery,
  useEmployeeQuery,
} from "@/hooks/use-employees";
import type { EmployeeHistory } from "@/types/database";

function TriField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] leading-snug text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function formatHistoryDay(recordedAt: string): string {
  const d = recordedAt.includes("T")
    ? recordedAt.slice(0, 10)
    : recordedAt.slice(0, 10);
  return formatDateDisplay(d);
}

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: e, isLoading, error } = useEmployeeQuery(id);
  const { data: history = [] } = useEmployeeHistoryQuery(id);

  const downloadQrPackage = async () => {
    if (!e?.qr_image_url) return;
    const res = await fetch(e.qr_image_url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${e.emp_no}-qr.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (isLoading) return <div className="text-muted-foreground">Loading…</div>;
  if (error || !e)
    return <div className="text-destructive">Employee not found.</div>;

  const st = computeStatus(e.expire_date);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/employees"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0099CC] hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-sm" asChild>
            <Link to={`/employees/${e.id}/renew`}>
              <RefreshCw className="h-4 w-4" />
              Renew
            </Link>
          </Button>
          <Button
            className="rounded-sm bg-[#0099CC] hover:bg-[#0099CC]/90"
            asChild>
            <Link to={`/employees/${e.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4">
          <Card className="border-border shadow-sm">
            <CardContent className="flex flex-col items-center gap-4 p-6 text-center md:p-8">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-border bg-slate-50">
                {e.profile_image_url ? (
                  <Avatar className="h-32 w-32">
                    <AvatarImage
                      src={e.profile_image_url}
                      className="h-full w-full object-cover"
                    />
                    <AvatarFallback>
                      <User className="h-12 w-12 text-[#0099CC]" />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="h-14 w-14 text-[#0099CC]" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">
                  {e.name}
                </h1>
                <p className="text-sm text-muted-foreground">{e.title_en}</p>
                <div className="mt-3 flex justify-center">
                  <Badge variant={st === "Active" ? "success" : "destructive"}>
                    {st}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Digital Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {e.qr_image_url ? (
                <img
                  src={e.qr_image_url}
                  alt="QR"
                  className="h-48 w-48 rounded-sm border border-border bg-white p-2"
                />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-sm border border-dashed text-sm text-muted-foreground">
                  No QR yet
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full rounded-sm"
                onClick={() => void downloadQrPackage()}
                disabled={!e.qr_image_url}>
                <Download className="h-4 w-4" />
                Download QR Package
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-8">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Macluumaadka Shaqada / Employment Information / معلومات العمل
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <TriField
                label="Lambarka Shaqaalaha / Employee Number / رقم الموظف"
                value={e.emp_no}
              />
              <TriField
                label="Magaca Buuxa / Full Name / الاسم الكامل"
                value={e.name}
              />
              <TriField
                label="Jagada Ingiriisi / English Title / المسمى بالإنجليزي"
                value={e.title_en}
              />
              <TriField
                label="Jagada Af-Soomaali / Local Title / المسمى المحلي"
                value={e.title_local}
              />
              <TriField
                label="Waaxda / Department / القسم"
                value={e.department}
              />
              <TriField label="Xaaladda / Status / الحالة" value={st} />
              <TriField
                label="Aqoonsiga Qaranka / National ID / الهوية الوطنية"
                value={e.national_id}
              />
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                Contact & Location / الاتصال والموقع
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <TriField
                label="Lambarka Taleefanka / Mobile Number / رقم الهاتف"
                value={e.mobile}
              />
              <TriField
                label="Iimeyl / Email / البريد الإلكتروني"
                value={e.email?.trim() ? e.email : "—"}
              />
              <TriField
                label="Degmada / District / المنطقة"
                value={e.district}
              />
              <TriField
                label="Cinwaanka / Address / العنوان"
                value={e.address}
              />
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                ID Validity / صلاحية الهوية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <TriField
                  label="Taariikhda Bixinta / Issue Date / تاريخ الإصدار"
                  value={formatDateDisplay(e.issue_date)}
                />
                <TriField
                  label="Taariikhda Dhicitaanka / Expiry Date / تاريخ الانتهاء"
                  value={formatDateDisplay(e.expire_date)}
                />
              </div>
              {st === "Expired" && (
                <div className="flex gap-3 rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <p>
                    This employee&apos;s ID has expired. Please renew the ID
                    card to maintain compliance.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900">
              Taariikh Hore / Employee History / السجل السابق
            </h2>
            {history.length === 0 && (
              <p className="text-sm text-muted-foreground">No history yet.</p>
            )}
            {history.map((h: EmployeeHistory) => (
              <HistorySnapshotCard key={h.id} h={h} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HistorySnapshotCard({ h }: { h: EmployeeHistory }) {
  const emailVal = h.email?.trim() ? h.email : "—";
  return (
    <div className="rounded-sm border border-border bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">{h.name}</h3>
          <p className="text-sm text-muted-foreground">
            Action: {h.action_type === "renew" ? "Renew" : "Update"}
          </p>
        </div>
        <div className="shrink-0 rounded-sm border border-border bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-800">
          {formatHistoryDay(h.recorded_at)}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TriField
          label="Lambarka Shaqaalaha / Employee Number / رقم الموظف"
          value={h.emp_no}
        />
        <TriField
          label="Jagada Ingiriisi / English Title / المسمى بالإنجليزي"
          value={h.title_en}
        />
        <TriField
          label="Jagada Af-Soomaali / Local Title / المسمى المحلي"
          value={h.title_local}
        />
        <TriField label="Waaxda / Department / القسم" value={h.department} />
        <TriField
          label="Lambarka Taleefanka / Mobile Number / رقم الهاتف"
          value={h.mobile}
        />
        <TriField label="Iimeyl / Email / البريد الإلكتروني" value={emailVal} />
        <TriField
          label="Aqoonsiga Qaranka / National ID / الهوية الوطنية"
          value={h.national_id}
        />
        <TriField label="Cinwaanka / Address / العنوان" value={h.address} />
        <TriField label="Degmada / District / المنطقة" value={h.district} />
        <TriField
          label="Taariikhda Bixinta / Issue Date / تاريخ الإصدار"
          value={formatDateDisplay(h.issue_date)}
        />
        <TriField
          label="Taariikhda Dhicitaanka / Expiry Date / تاريخ الانتهاء"
          value={formatDateDisplay(h.expire_date)}
        />
        <TriField
          label="Xaaladdii Hore / Previous Status / الحالة السابقة"
          value={h.status_at_that_time}
        />
      </div>
    </div>
  );
}

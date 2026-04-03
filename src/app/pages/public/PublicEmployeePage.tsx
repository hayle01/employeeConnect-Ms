import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";
import { formatDateDisplay } from "@/lib/employee-status";
import type { PublicEmployeePayload } from "@/types/database";

export function PublicEmployeePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["public-employee", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const { data: row, error: err } = await supabase.rpc("get_public_employee_by_slug", {
        p_slug: slug!,
      });
      if (err) throw err;
      return row as PublicEmployeePayload | null;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] text-muted-foreground">
        Verifying…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f4f6f8] px-4 text-center">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold text-slate-900">Verification not found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          This verification link is invalid or has been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-[#0099CC]" />
          <span className="text-xl font-semibold text-slate-900">EmployeeConnect</span>
        </div>
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-center text-lg">Employee verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Badge variant={data.status === "Active" ? "success" : "destructive"}>{data.status}</Badge>
            </div>
            <div className="grid gap-3 text-sm">
              <Row label="Name" value={data.name} />
              <Row label="Employee number" value={data.emp_no} />
              <Row label="Title" value={data.title_en} />
              <Row label="Department" value={data.department} />
              <Row label="District" value={data.district} />
              <Row label="Issue date" value={formatDateDisplay(data.issue_date)} />
              <Row label="Expiry date" value={formatDateDisplay(data.expire_date)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-slate-900 text-right">{value}</span>
    </div>
  );
}

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, QrCode, ShieldCheck, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { computeStatus } from "@/lib/employee-status";
import { useEmployeesQuery } from "@/hooks/use-employees";

const COLORS = ["#0099CC", "#8b5cf6", "#14b8a6", "#f59e0b", "#ef4444"];

export function OverviewPage() {
  const { data: employees = [], isLoading } = useEmployeesQuery();

  const stats = useMemo(() => {
    const total = employees.length;
    const withQr = employees.filter((e) => e.qr_image_url).length;
    const pendingRenewals = employees.filter(
      (e) => computeStatus(e.expire_date) === "Expired",
    ).length;
    const active = employees.filter(
      (e) => computeStatus(e.expire_date) === "Active",
    ).length;
    const qrPct = total ? Math.round((withQr / total) * 100) : 0;
    return { total, withQr, pendingRenewals, active, qrPct };
  }, [employees]);

  const growthData = useMemo(() => {
    const byMonth = new Map<string, number>();
    let cum = 0;
    const sorted = [...employees].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    sorted.forEach((e) => {
      const d = new Date(e.created_at);
      const key = `${d.toLocaleString("en", { month: "short" })} ${d.getFullYear()}`;
      cum += 1;
      byMonth.set(key, cum);
    });
    return Array.from(byMonth.entries()).map(([name, total]) => ({
      name,
      total,
    }));
  }, [employees]);

  const deptData = useMemo(() => {
    const m = new Map<string, number>();
    employees.forEach((e) =>
      m.set(e.department, (m.get(e.department) ?? 0) + 1),
    );
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const activeExpired = useMemo(
    () => [
      { name: "Active", count: stats.active },
      { name: "Expired", count: stats.pendingRenewals },
    ],
    [stats.active, stats.pendingRenewals],
  );

  const latest = useMemo(() => [...employees].slice(0, 5), [employees]);

  if (isLoading) {
    return <div className="text-muted-foreground">Loading dashboard…</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Dashboard summary for your organization
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          {stats.total} employees in the system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Employees"
          value={String(stats.total)}
          subtitle="Registered staff members"
          icon={<Users className="h-6 w-6 text-[#0099CC]" />}
          iconBg="bg-[#0099CC]/10"
        />
        <SummaryCard
          title="Active QR IDs"
          value={String(stats.withQr)}
          subtitle={`${stats.qrPct}% QR coverage`}
          icon={<QrCode className="h-6 w-6 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <SummaryCard
          title="Pending Renewals"
          value={String(stats.pendingRenewals)}
          subtitle="Need immediate renewal"
          icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
          iconBg="bg-red-50"
        />
        <SummaryCard
          title="Active Status"
          value={String(stats.active)}
          subtitle="Currently valid IDs"
          icon={<ShieldCheck className="h-6 w-6 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Employee Growth Trend</CardTitle>
            <CardDescription>
              Cumulative employee onboarding by month.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={
                  growthData.length ? growthData : [{ name: "—", total: 0 }]
                }>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  domain={[0, "dataMax + 1"]}
                />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#0099CC"
                  fill="#0099CC"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Department Breakdown</CardTitle>
            <CardDescription>
              Department share across the organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deptData.length ? deptData : [{ name: "—", value: 1 }]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}>
                  {(deptData.length ? deptData : [{ name: "—", value: 1 }]).map(
                    (_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ),
                  )}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Active vs Expired</CardTitle>
            <CardDescription>
              Green means valid IDs. Red means expired IDs.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeExpired}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} domain={[0, "dataMax + 1"]} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {activeExpired.map((e) => (
                    <Cell
                      key={e.name}
                      fill={e.name === "Active" ? "#22c55e" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Latest Onboarding</CardTitle>
            <CardDescription>
              Most recently added employee records.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {latest.length === 0 && (
              <p className="text-sm text-muted-foreground">No employees yet.</p>
            )}
            {latest.map((e) => {
              const st = computeStatus(e.expire_date);
              return (
                <div
                  key={e.id}
                  className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {e.name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-slate-900">{e.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {e.emp_no} · {e.department} · {e.title_en}
                      </div>
                    </div>
                  </div>
                  <Badge variant={st === "Active" ? "success" : "destructive"}>
                    {st}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  iconBg,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="flex items-start justify-between p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-sm ${iconBg}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

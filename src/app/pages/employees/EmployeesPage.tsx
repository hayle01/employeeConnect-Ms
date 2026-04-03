import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Grid3x3,
  LayoutList,
  MoreVertical,
  Plus,
  RefreshCw,
  Search as SearchIcon,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { computeStatus } from "@/lib/employee-status";
import { formatDateDisplay } from "@/lib/employee-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteEmployeeDialog } from "@/components/employees/DeleteEmployeeDialog";
import { useEmployeesQuery } from "@/hooks/use-employees";
import { toast } from "sonner";
import type { Employee } from "@/types/database";

export function EmployeesPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: employees = [], isLoading } = useEmployeesQuery();
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string>("all");
  const [district, setDistrict] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [view, setView] = useState<"list" | "grid">("list");
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const departments = useMemo(() => {
    const s = new Set<string>();
    employees.forEach((e) => s.add(e.department));
    return Array.from(s).sort();
  }, [employees]);

  const districts = useMemo(() => {
    const s = new Set<string>();
    employees.forEach((e) => s.add(e.district));
    return Array.from(s).sort();
  }, [employees]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return employees.filter((e) => {
      const st = computeStatus(e.expire_date);
      if (status !== "all" && st !== status) return false;
      if (dept !== "all" && e.department !== dept) return false;
      if (district !== "all" && e.district !== district) return false;
      if (!term) return true;
      const hay = [
        e.name,
        e.title_en,
        e.title_local,
        e.emp_no,
        e.mobile,
        e.national_id,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(term);
    });
  }, [employees, q, dept, district, status]);

  const resetFilters = () => {
    setQ("");
    setDept("all");
    setDistrict("all");
    setStatus("all");
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", deleteTarget.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Employee deleted");
    setDeleteTarget(null);
    void qc.invalidateQueries({ queryKey: ["employees"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Employee Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage employee records and ID cards
          </p>
        </div>
        <Button className="bg-[#0099CC] hover:bg-[#0099CC]/90" asChild>
          <Link to="/employees/new">
            <Plus className="h-4 w-4" />
            Add New Employee
          </Link>
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-center gap-3 space-y-0 pb-4">
          <div className="relative min-w-[200px] flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              className="h-10 pl-9"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={dept} onValueChange={setDept}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="District" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              {districts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={resetFilters}
            aria-label="Reset filters">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <div className="ml-auto flex rounded-sm border border-border p-1">
            <button
              type="button"
              className={`rounded-sm p-2 ${view === "list" ? "bg-slate-100 text-slate-900" : "text-muted-foreground"}`}
              onClick={() => setView("list")}
              aria-label="List view">
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              type="button"
              className={`rounded-sm p-2 ${view === "grid" ? "bg-slate-100 text-slate-900" : "text-muted-foreground"}`}
              onClick={() => setView("grid")}
              aria-label="Grid view">
              <Grid3x3 className="h-4 w-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            {filtered.length} employee(s) found
          </p>
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : view === "list" ? (
            <div className="rounded-sm border border-border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Emp No</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Expire Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[60px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((e) => {
                    const st = computeStatus(e.expire_date);
                    return (
                      <TableRow key={e.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              {e.profile_image_url ? (
                                <AvatarImage src={e.profile_image_url} alt="" />
                              ) : null}
                              <AvatarFallback>
                                {e.name[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-slate-900">
                              {e.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {e.emp_no}
                        </TableCell>
                        <TableCell>{e.title_en}</TableCell>
                        <TableCell>{e.department}</TableCell>
                        <TableCell>
                          {formatDateDisplay(e.expire_date)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              st === "Active" ? "success" : "destructive"
                            }>
                            {st}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white curspo">
                              <DropdownMenuItem
                              className="cursor-pointer"
                                onClick={() => navigate(`/employees/${e.id}`)}>
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(`/employees/${e.id}/edit`)
                                }>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                              className="cursor-pointer"
                                onClick={() =>
                                  navigate(`/employees/${e.id}/renew`)
                                }>
                                Renew
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onClick={() => setDeleteTarget(e)}>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((e) => {
                const st = computeStatus(e.expire_date);
                return (
                  <Card key={e.id} className="border-border">
                    <CardContent className="flex flex-col gap-3 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {e.profile_image_url ? (
                              <AvatarImage src={e.profile_image_url} alt="" />
                            ) : null}
                            <AvatarFallback>
                              {e.name[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{e.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {e.emp_no}
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={st === "Active" ? "success" : "destructive"}>
                          {st}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {e.title_en}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/employees/${e.id}`}>View</Link>
                        </Button>
                        <Button size="sm" className="bg-[#0099CC]" asChild>
                          <Link to={`/employees/${e.id}/edit`}>Edit</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteEmployeeDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        onConfirm={onDelete}
        loading={deleting}
      />
    </div>
  );
}

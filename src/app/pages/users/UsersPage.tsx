import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useProfilesQuery } from "@/hooks/use-employees";
import { createUserRequest, deleteUserRequest } from "@/lib/api/users";
import { createUserSchema } from "@/lib/validations/employee";
import { formatDateDisplay } from "@/lib/employee-status";

export function UsersPage() {
  const { session, user } = useAuth();
  const qc = useQueryClient();
  const { data: profiles = [], isLoading } = useProfilesQuery();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "staff">("staff");
  const [submitting, setSubmitting] = useState(false);

  const onCreate = async () => {
    const parsed = createUserSchema.safeParse({ username, password, role });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message ?? "Invalid form");
      return;
    }
    if (!session?.access_token) {
      toast.error("Not signed in");
      return;
    }
    setSubmitting(true);
    try {
      await createUserRequest(parsed.data, session.access_token);
      toast.success("User created");
      setOpen(false);
      setUsername("");
      setPassword("");
      setRole("staff");
      void qc.invalidateQueries({ queryKey: ["profiles"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!session?.access_token) return;
    if (!confirm("Delete this user?")) return;
    try {
      await deleteUserRequest(id, session.access_token);
      toast.success("User deleted");
      void qc.invalidateQueries({ queryKey: ["profiles"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          User Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage system administrators and access control
        </p>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">System Users</CardTitle>
          <Button
            className="bg-[#0099CC] hover:bg-[#0099CC]/90"
            onClick={() => setOpen(true)}>
            + Create User
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : (
            <div className="rounded-sm border border-border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-[#0099CC]/15 text-[#0099CC]">
                              {p.username[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-slate-900">
                            {p.username}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="role">
                          {p.role === "admin" ? "Admin" : "Staff"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateDisplay(
                          (p as { created_at: string }).created_at.slice(0, 10),
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                          disabled={p.id === user?.id}
                          onClick={() => void onDelete(p.id)}
                          aria-label="Delete user">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cu-user">Username</Label>
              <Input
                id="cu-user"
                placeholder="Enter a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cu-pass">Password</Label>
              <Input
                id="cu-pass"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as "admin" | "staff")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">staff</SelectItem>
                  <SelectItem value="admin">admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              className="w-full bg-[#0099CC] hover:bg-[#0099CC]/90"
              onClick={() => void onCreate()}
              disabled={submitting}>
              {submitting ? "Creating…" : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

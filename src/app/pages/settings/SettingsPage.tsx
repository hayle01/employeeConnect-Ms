import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";
import { usernameToEmail } from "@/lib/auth/username";
import { changePasswordSchema } from "@/lib/validations/employee";
import { useAuth } from "@/hooks/use-auth";

type FormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function SettingsPage() {
  const { profile } = useAuth();
  const [showNew, setShowNew] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (!profile) return;
    const email = usernameToEmail(profile.username);
    const { error: signErr } = await supabase.auth.signInWithPassword({
      email,
      password: values.currentPassword,
    });
    if (signErr) {
      toast.error("Current password is incorrect");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: values.newPassword });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password updated");
    form.reset();
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings</p>
      </div>

      <Card className="max-w-xl border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5 text-[#0099CC]" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cur">Current Password</Label>
              <Input
                id="cur"
                type="password"
                autoComplete="current-password"
                placeholder="Enter current password"
                {...form.register("currentPassword")}
              />
              {form.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">{form.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newp">New Password</Label>
              <div className="relative">
                <Input
                  id="newp"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  {...form.register("newPassword")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowNew((s) => !s)}
                >
                  {showNew ? "Hide" : "Show"}
                </button>
              </div>
              {form.formState.errors.newPassword && (
                <p className="text-sm text-destructive">{form.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="conf">Confirm Password</Label>
              <Input
                id="conf"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm new password"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <Button type="submit" className="bg-[#0099CC] hover:bg-[#0099CC]/90" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Updating…" : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

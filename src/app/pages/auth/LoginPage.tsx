import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navigate, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { session, signIn, loading } = useAuth();
  const location = useLocation();
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    "/overview";
  const [err, setErr] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (!loading && session) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = handleSubmit(async (values) => {
    setErr(null);
    const { error } = await signIn(values.username, values.password);
    if (error) setErr(error);
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6f8] px-4">
      <Card className="w-full max-w-md border-border shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-sm bg-[#0099CC]/10">
            <Shield className="h-7 w-7 text-[#0099CC]" />
          </div>
          <CardTitle className="text-2xl font-semibold">
            EmployeeConnect
          </CardTitle>
          <CardDescription>
            Sign in with your username and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                placeholder="Enter username"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            {err && <p className="text-sm text-destructive">{err}</p>}
            <Button
              type="submit"
              className="w-full bg-[#0099CC] hover:bg-[#0099CC]/90"
              disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

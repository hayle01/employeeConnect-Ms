import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const createBodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(["admin", "staff"]),
});

const deleteQuerySchema = z.object({
  id: z.string().uuid(),
});

export type AdminUsersEnv = {
  supabaseUrl: string;
  serviceKey: string;
  anonKey: string;
};

/** Resolve env for API (Vercel + Vite dev middleware). */
export function resolveAdminUsersEnv(): AdminUsersEnv | null {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey =
    process.env.SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.VITE_SUPABASE_ANON_KEY ??
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !serviceKey || !anonKey) return null;
  return { supabaseUrl, serviceKey, anonKey };
}

export async function runCreateUser(
  env: AdminUsersEnv,
  authorization: string | undefined,
  body: unknown,
): Promise<{ status: number; json: Record<string, unknown> }> {
  const supabaseUrl = env.supabaseUrl;
  const serviceKey = env.serviceKey;
  const anonKey = env.anonKey;

  if (!authorization?.startsWith("Bearer ")) {
    return { status: 401, json: { error: "Unauthorized" } };
  }
  const token = authorization.slice(7);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser(token);
  if (userErr || !user) {
    return { status: 401, json: { error: "Invalid session" } };
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: profile, error: perr } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
  if (perr || !profile || profile.role !== "admin") {
    return { status: 403, json: { error: "Forbidden" } };
  }

  const parsed = createBodySchema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, json: { error: "Invalid body" } };
  }

  const { username, password, role } = parsed.data;
  const email = `${username.trim().toLowerCase()}@employeeconnect.local`;

  const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username: username.trim().toLowerCase() },
  });

  if (createErr || !created.user) {
    return { status: 400, json: { error: createErr?.message ?? "Could not create user" } };
  }

  const { error: insErr } = await adminClient.from("profiles").insert({
    id: created.user.id,
    username: username.trim().toLowerCase(),
    role,
  });

  if (insErr) {
    await adminClient.auth.admin.deleteUser(created.user.id);
    return { status: 400, json: { error: insErr.message } };
  }

  return { status: 200, json: { ok: true, id: created.user.id } };
}

export async function runDeleteUser(
  env: AdminUsersEnv,
  authorization: string | undefined,
  targetUserId: string | undefined,
): Promise<{ status: number; json: Record<string, unknown> }> {
  const supabaseUrl = env.supabaseUrl;
  const serviceKey = env.serviceKey;
  const anonKey = env.anonKey;

  if (!authorization?.startsWith("Bearer ")) {
    return { status: 401, json: { error: "Unauthorized" } };
  }
  const token = authorization.slice(7);

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser(token);
  if (userErr || !user) {
    return { status: 401, json: { error: "Invalid session" } };
  }

  const parsed = deleteQuerySchema.safeParse({ id: targetUserId });
  if (!parsed.success) {
    return { status: 400, json: { error: "Invalid id" } };
  }
  const targetId = parsed.data.id;

  if (targetId === user.id) {
    return { status: 400, json: { error: "Cannot delete your own account" } };
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: profile, error: perr } = await adminClient.from("profiles").select("role").eq("id", user.id).single();
  if (perr || !profile || profile.role !== "admin") {
    return { status: 403, json: { error: "Forbidden" } };
  }

  const { error: delErr } = await adminClient.auth.admin.deleteUser(targetId);
  if (delErr) {
    return { status: 400, json: { error: delErr.message } };
  }

  return { status: 200, json: { ok: true } };
}

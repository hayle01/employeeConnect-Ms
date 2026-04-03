import type { VercelRequest, VercelResponse } from "@vercel/node";
import { resolveAdminUsersEnv, runDeleteUser } from "../../server/admin-users-handlers";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const env = resolveAdminUsersEnv();
  if (!env) {
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  const id = typeof req.query.id === "string" ? req.query.id : undefined;
  const result = await runDeleteUser(env, req.headers.authorization, id);
  return res.status(result.status).json(result.json);
}

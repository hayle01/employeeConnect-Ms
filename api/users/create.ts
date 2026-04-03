import type { VercelRequest, VercelResponse } from "@vercel/node";
import { resolveAdminUsersEnv, runCreateUser } from "../../server/admin-users-handlers";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const env = resolveAdminUsersEnv();
  if (!env) {
    return res.status(500).json({ error: "Server misconfiguration" });
  }

  const result = await runCreateUser(env, req.headers.authorization, req.body);
  return res.status(result.status).json(result.json);
}

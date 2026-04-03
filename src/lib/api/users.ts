export async function createUserRequest(
  body: { username: string; password: string; role: "admin" | "staff" },
  accessToken: string,
) {
  const res = await fetch("/api/users/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

export async function deleteUserRequest(userId: string, accessToken: string) {
  const res = await fetch(`/api/users/delete?id=${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = (await res.json()) as { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Request failed");
  return data;
}

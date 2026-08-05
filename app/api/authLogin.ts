// ============================================================
// authLogin.ts — versi AMAN (tahan response non-JSON & error jelas)
// ============================================================

const API = import.meta.env.VITE_API_URL;

/** Parsing JSON aman — kalau body bukan JSON, jadikan pesan readable */
async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Server error (${res.status}): ${text.trim().slice(0, 120) || "(body kosong)"}`,
    );
  }
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const result = await safeJson(res);
    throw new Error(result?.message ?? "Login gagal");
  }

  return res.json();
}

export async function me() {
  const res = await fetch(`${API}/auth/me`, {
    credentials: "include",
  });

  // ⭐ Cek status DULU sebelum parse JSON
  if (!res.ok) {
    throw new Error(
      res.status === 401 ? "Unauthorized" : "Gagal mengambil data user",
    );
  }

  const data = await res.json();

  // console.log("STATUS:", res.status);
  // console.log("DATA:", data);

  return data;
}

export async function logout() {
  await fetch(`${API}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

const API = import.meta.env.VITE_API_URL;

export async function login(username: string, password: string) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  if (!res.ok) {
    throw new Error("Login gagal");
  }

  return res.json();
}

export async function me() {
  const res = await fetch("http://localhost:3001/auth/me", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Unauthorized");
  }

  const data = await res.json();

  console.log("STATUS:", res.status);
  console.log("DATA:", data);

  return data;
}

export async function logout() {
  await fetch(`${API}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

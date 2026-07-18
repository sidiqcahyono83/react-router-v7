const API = import.meta.env.VITE_API_URL;

export async function getDashboard() {
  const res = await fetch(`${API}/dashboard`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Dashboard gagal");
  }

  return res.json();
}

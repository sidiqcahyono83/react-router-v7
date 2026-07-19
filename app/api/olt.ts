const API = import.meta.env.VITE_API_URL;

export async function getAllOlt() {
  const res = await fetch(`${API}/olts/all`, {
    credentials: "include",
  });

  return res.json();
}

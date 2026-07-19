const API = import.meta.env.VITE_API_URL;

export async function createPppoe(data: {
  username: string;
  password: string;
  profile: string;
}) {
  const res = await fetch(`${API}/pppoe/createppp`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message);
  }

  return result;
}

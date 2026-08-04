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

export async function getDashboardSummary() {
  const res = await fetch(`${API}/pppoedashboard`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil dashboard PPPoE");
  }

  return res.json();
}

export async function getDashboard(params: {
  page: number;
  limit: number;
  type: "secret" | "active" | "inactive" | "disabled" | "nonactive";
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    type: params.type,
  });

  const res = await fetch(`${API}/pppoedashboard/dashboard?${query}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil dashboard PPPoE");
  }

  return res.json();
}

const API = import.meta.env.VITE_API_URL;

export async function getModem(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    search: params.search ?? "",
  });

  const res = await fetch(`${API}/modems?${query}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data modem");
  }

  return res.json();
}

export async function getModemId(id: string) {
  const res = await fetch(`${API}/modems/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil modem");
  }

  return res.json();
}

export async function updateModem(id: string, data: any) {
  const res = await fetch(`${API}/modems/${id}`, {
    method: "PATCH",
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

export async function createModem(data: { name: string }) {
  const res = await fetch(`${API}/modems`, {
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

export async function getAllModem() {
  const res = await fetch(`${API}/modems/all`, {
    credentials: "include",
  });

  return res.json();
}

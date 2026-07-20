const API = import.meta.env.VITE_API_URL;

export async function getAllOlt() {
  const res = await fetch(`${API}/pendapatan/all`, {
    credentials: "include",
  });

  return res.json();
}

export async function getPendapatan(params: {
  page: number;
  limit: number;
  search?: string;
}) {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    search: params.search ?? "",
  });

  const res = await fetch(`${API}/pendapatan?${query}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil data Pendapatan");
  }

  return res.json();
}

export async function getPendapatanId(id: string) {
  const res = await fetch(`${API}/pendapatan/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Gagal mengambil Pendapatan");
  }

  return res.json();
}

// export async function updatePendapatan(id: string) {
//   const res = await fetch(`${API}/pendapatan/${id}`, {
//     method: "PATCH",
//     credentials: "include",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });

//   const result = await res.json();

//   if (!res.ok) {
//     throw new Error(result.message || "Gagal mengupdate Pendapatan.");
//   }

//   return result.data ?? result;
// }

// export async function createPendapatan(data:) {
//   const res = await fetch(`${API}/pendapatan`, {
//     method: "POST",
//     credentials: "include",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });

//   const result = await res.json();

//   if (!res.ok) {
//     throw new Error(result.message);
//   }

//   return result;
// }

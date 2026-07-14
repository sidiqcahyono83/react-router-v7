// app/routes/pembayaran/pembayaran.tsx

import { api } from "~/lib/api";
import PembayaranPage from "./pembayaranPage";
import type { Pembayaran } from "~/types/typdeData";
import type { Route } from "./+types/pembayaran";

type PembayaranResponse = {
  success: boolean;
  message: string;
  data: Pembayaran[];
};

export async function loader({}: Route.LoaderArgs) {
  const response = await api<PembayaranResponse>("/pembayaran");

  return {
    pembayarans: response.data,
  };
}
export default PembayaranPage;

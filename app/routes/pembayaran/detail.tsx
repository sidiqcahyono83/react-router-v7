import { api } from "~/lib/api";
import type { Route } from "./+types/detail";
import PembayaranDetail from "./PembayaranDetail";
import type { Pembayaran } from "~/type/typdeData";

type Response = {
  success: boolean;
  data: Pembayaran;
};

export async function loader({ params }: Route.LoaderArgs) {
  const response = await api<Response>(`/pembayaran/${params.pembayaranId}`);

  return {
    pembayaran: response.data,
  };
}

export default PembayaranDetail;

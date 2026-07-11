import { api } from "~/lib/api";
import CustomerDetail from "./CustomerDetail";
import type { Route } from "./+types/detailLoader";
import type { Area, Customer, Modem, Odp, Paket, Olt } from "~/type/typdeData";
import { redirect } from "react-router";

type OdpResponse = {
  odps: Odp[];
};

type PaketResponse = {
  pakets: Paket[];
};

type ModemResponse = {
  modems: Modem[];
};
type AreaResponse = {
  areas: Area[];
};
type OltResponse = {
  olts: Olt[];
};

export async function loader({ params }: Route.LoaderArgs) {
  const [customer, paket, area, odp, modem, olt] = await Promise.all([
    api<Customer>(`/customers/${params.id}`),
    api<PaketResponse>(`/pakets`),
    api<AreaResponse>(`/areas`),
    api<OdpResponse>(`/odps`),
    api<ModemResponse>(`/modems`),
    api<OltResponse>(`/olts`),
  ]);

  return {
    customer: customer,
    paket: paket.pakets,
    area: area.areas,
    odp: odp.odps,
    modem: modem.modems,
    olt: olt.olts,
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();

  const body = Object.fromEntries(formData);

  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_API_URL}/customers/${params.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    throw new Error("Gagal mengubah customer");
  }

  return redirect(`/customers`);
}

export default CustomerDetail;

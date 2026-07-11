import { api } from "~/lib/api";
import type { Route } from "./+types/create";
import CustomerCreate from "./CustomerCreate";
import { redirect } from "react-router";

type PaketResponse = {
  pakets: {
    id: string;
    name: string;
    harga: number;
  }[];
};

type AreaResponse = {
  areas: {
    id: string;
    name: string;
  }[];
};

type OdpResponse = {
  odps: {
    id: string;
    name: string;
  }[];
};

type ModemResponse = {
  modems: {
    id: string;
    name: string;
    serial: string;
  }[];
};

type OltResponse = {
  olts: {
    id: string;
    name: string;
    serial: string;
  }[];
};

export async function loader() {
  const [paket, area, odp, modem, olt] = await Promise.all([
    api<PaketResponse>("/pakets"),
    api<AreaResponse>("/areas"),
    api<OdpResponse>("/odps"),
    api<ModemResponse>("/modems"),
    api<OltResponse>("/olts"),
  ]);

  return {
    pakets: paket.pakets,
    areas: area.areas,
    odps: odp.odps,
    modems: modem.modems,
    olts: olt.olts,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const body = Object.fromEntries(formData);

  console.log("BODY =", body);

  try {
    const result = await api("/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log(result);

    return redirect("/customers");
  } catch (err) {
    console.error("ERROR API", err);
    throw err;
  }
}

export default CustomerCreate;

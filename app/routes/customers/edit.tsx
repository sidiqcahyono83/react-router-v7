import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { getAllArea } from "~/api/area";
import { getCustomerId, updateCustomer } from "~/api/customers";
import { getAllModem } from "~/api/modem";
import { getAllOdp } from "~/api/odp";
import { getAllOlt } from "~/api/olt";
import { getAllPaket } from "~/api/paket";

export default function CustomerEdit() {
  const { id } = useParams();

  const navigate = useNavigate();
  const [pakets, setPakets] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [odps, setOdps] = useState<any[]>([]);
  const [modems, setModems] = useState<any[]>([]);
  const [olts, setOlts] = useState<any[]>([]);

  const [form, setForm] = useState({
    username: "",
    password: "",
    profile: "",

    fullname: "",
    address: "",
    phonenumber: "",
    ontName: "",
    redamanOlt: "",
    diskon: 0,
    status: "aktif",
    olt: "sruweng",
    paketId: "",
    areaId: "",
    odpId: "",
    modemId: "",
    oltId: "",
  });

  useEffect(() => {
    if (id) {
      getCustomerId(id).then(setForm);
      loadMaster();
    }
  }, [id]);

  async function loadMaster() {
    const [paket, area, odp, modem, olt] = await Promise.all([
      getAllPaket(),
      getAllArea(),
      getAllOdp(),
      getAllModem(),
      getAllOlt(),
    ]);

    setPakets(paket.data ?? paket);
    setAreas(area.data ?? area);
    setOdps(odp.data ?? odp);
    setModems(modem.data ?? modem);
    setOlts(olt.data ?? olt);
    console.log(paket);
  }

  if (!form) {
    return <div>Loading...</div>;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      await updateCustomer(id!, form);

      navigate(`/admin/customers/${id}`);
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl bg-white p-6 shadow"
    >
      <h1 className="text-3xl font-bold">Edit Customer</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ================================================= */}
        {/* DATA CUSTOMER */}
        {/* ================================================= */}

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-bold">Informasi Customer</h2>

          <div className="space-y-5">
            <div>
              <label>Nama Lengkap</label>

              <input
                value={form.fullname}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fullname: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
              />
            </div>

            <div>
              <label>Username PPPoE</label>

              <input
                value={form.username}
                onChange={(e) =>
                  setForm({
                    ...form,
                    username: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
              />
            </div>

            <div>
              <label>Password PPPoE</label>

              <input
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
              />
            </div>

            <div>
              <label>Nomor HP</label>

              <input
                value={form.phonenumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phonenumber: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
              />
            </div>

            <div>
              <label>Alamat</label>

              <input
                value={form.address}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
              />
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* PPPoE */}
        {/* ================================================= */}

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-bold">Konfigurasi PPPoE</h2>

          <div className="space-y-5">
            <div>
              <label>Profile PPPoE</label>

              <select
                value={form.profile}
                onChange={(e) =>
                  setForm({
                    ...form,
                    profile: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">Pilih Paket</option>

                {pakets.map((paket: any) => (
                  <option key={paket.id} value={paket.name}>
                    {paket.name} - Rp {paket.harga.toLocaleString("id-ID")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Nama ONT</label>

              <input
                value={form.ontName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ontName: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
              />
            </div>

            <div>
              <label>Redaman OLT</label>

              <input
                value={form.redamanOlt}
                onChange={(e) =>
                  setForm({
                    ...form,
                    redamanOlt: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
                placeholder="-23"
              />
            </div>

            <div>
              <label>Status</label>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="aktif">Aktif</option>
                <option value="isolir">Isolir</option>
                <option value="nonaktif">Non Aktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* PAKET */}
        {/* ================================================= */}

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-bold">Paket Internet</h2>

          <div className="space-y-5">
            <div>
              <label>Paket</label>

              <select
                value={form.paketId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    paketId: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">Pilih Paket</option>

                {pakets.map((paket: any) => (
                  <option key={paket.id} value={paket.id}>
                    {paket.name} - Rp {paket.harga.toLocaleString("id-ID")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Diskon</label>

              <input
                type="number"
                value={form.diskon}
                onChange={(e) =>
                  setForm({
                    ...form,
                    diskon: Number(e.target.value),
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
              />
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* LOKASI */}
        {/* ================================================= */}

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-6 text-xl font-bold">Lokasi & Perangkat</h2>

          <div className="space-y-5">
            <div>
              <label>Area</label>

              <select
                value={form.areaId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    areaId: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">Pilih Area</option>

                {areas.map((area: any) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>ODP</label>

              <select
                value={form.odpId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    odpId: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">Pilih ODP</option>

                {odps.map((odp: any) => (
                  <option key={odp.id} value={odp.id}>
                    {odp.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>OLT</label>

              <select
                value={form.oltId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    oltId: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">Pilih OLT</option>

                {olts.map((olt: any) => (
                  <option key={olt.id} value={olt.id}>
                    {olt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Modem</label>

              <select
                value={form.modemId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    modemId: e.target.value,
                  })
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">Pilih Modem</option>

                {modems.map((modem: any) => (
                  <option key={modem.id} value={modem.id}>
                    {modem.name} ({modem.serial})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <button className="rounded-lg bg-blue-600 px-5 py-3 text-white">
        Simpan
      </button>
    </form>
  );
}

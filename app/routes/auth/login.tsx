import { Form, redirect, type ActionFunctionArgs } from "react-router";
import { AuthAPI } from "~/api/auth";
import Logo from "~/components/ui/Logo";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  await AuthAPI.login({
    username: String(formData.get("username")),
    password: String(formData.get("password")),
  });

  return redirect("/admin");
}

export default function Login() {
  return (
    <div className="min-h-screen bg-gradient from-slate-900 via-blue-900 to-sky-700">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
          {/* Left */}

          <div className="hidden bg-blue-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <Logo />

              <h2 className="mt-12 text-5xl font-bold leading-tight">
                Billing
                <br />
                Management
                <br />
                System
              </h2>

              <p className="mt-6 text-blue-100">
                Kelola pelanggan, pembayaran, tagihan dan laporan ISP dalam satu
                dashboard.
              </p>
            </div>

            <div className="text-sm text-blue-200">© 2026 Billing ISP</div>
          </div>

          {/* Right */}

          <div className="p-10 lg:p-16">
            <Logo />

            <div className="mt-10">
              <h2 className="text-3xl font-bold">Selamat Datang</h2>

              <p className="mt-2 text-slate-500">
                Login sebagai Administrator.
              </p>
            </div>

            <Form method="post" className="mt-10 space-y-6">
              <div>
                <label className="mb-2 block font-medium">Username</label>

                <input
                  name="username"
                  className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">Password</label>

                <input
                  type="password"
                  name="password"
                  className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
                />
              </div>

              <button className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white hover:bg-blue-700">
                Login
              </button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

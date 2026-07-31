import { useState } from "react";
import { useNavigate } from "react-router";

import Logo from "~/components/ui/Logo";
import { useAuth } from "~/hooks/useAuth";
import { login } from "./auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!username || !password) {
      setErrorMsg("Username dan password tidak boleh kosong");
      return;
    }

    setLoading(true);

    try {
      // 💡 FIX UTAMA: Kirim SEBAGAI 1 OBJEK { username, password }
      await login({ username, password });

      // Ambil profile user terbaru
      await refreshUser();

      // Navigate ke Dashboard Admin
      navigate("/admin");
    } catch (err: any) {
      console.error("Login gagal:", err);
      const message = err.response?.data?.message || "Login gagal, silakan periksa username & password";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient from-slate-900 via-blue-900 to-sky-700">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
          {/* Left Panel */}
          <div className="hidden bg-blue-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <Logo />
              <h2 className="mt-12 text-5xl font-bold leading-tight">
                Billing<br />Management<br />System
              </h2>
              <p className="mt-6 text-blue-100">
                Kelola pelanggan, pembayaran, tagihan dan laporan ISP dalam satu dashboard.
              </p>
            </div>
            <div className="text-sm text-blue-200">© 2026 Billing ISP</div>
          </div>

          {/* Right Panel */}
          <div className="p-10 lg:p-16">
            <Logo />

            <div className="mt-10">
              <h2 className="text-3xl font-bold">Selamat Datang</h2>
              <p className="mt-2 text-slate-500">Login sebagai Administrator.</p>
            </div>

            {errorMsg && (
              <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-600 border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div>
                <label className="mb-2 block font-medium">Username</label>
                <input
                  required
                  className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">Password</label>
                <input
                  required
                  type="password"
                  className="w-full rounded-xl border p-3 outline-none focus:border-blue-600"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 p-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
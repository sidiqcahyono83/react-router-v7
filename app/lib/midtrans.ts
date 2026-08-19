// ============================================================
// Helper Midtrans Snap (frontend)
//
// ENV yang dipakai (.env frontend — WAJIB berawalan VITE_):
//   VITE_MIDTRANS_CLIENT_KEY  → client key Snap
//                               sandbox    : "SB-Mid-client-xxxxx"
//                               production : "Mid-client-xxxxx"   (TANPA "SB-")
//   VITE_MIDTRANS_ENV         → opsional: "production" | "sandbox"
//                               kalau kosong, mode ditebak dari prefix client key.
//
// CATATAN PENTING soal "kenapa masih test/sandbox":
//   Mode Midtrans ditentukan di DUA sisi dan keduanya harus sama:
//     1. FRONTEND  → client key + URL snap.js (file ini)
//     2. BACKEND   → SERVER KEY yang dipakai saat membuat Snap token
//   Kalau backend masih pakai server key sandbox, transaksi TETAP sandbox
//   walaupun frontend sudah production. Token & redirect_url-nya sandbox.
// ============================================================

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        },
      ) => void;
    };
  }
}

export type MidtransEnv = "sandbox" | "production";

const SNAP_HOST: Record<MidtransEnv, string> = {
  sandbox: "https://app.sandbox.midtrans.com",
  production: "https://app.midtrans.com",
};

/** Client key sandbox selalu diawali "SB-" (contoh: SB-Mid-client-xxx). */
export function isSandboxKey(clientKey?: string | null): boolean {
  return String(clientKey ?? "")
    .trim()
    .toUpperCase()
    .startsWith("SB-");
}

/**
 * Tentukan mode Midtrans yang benar-benar dipakai.
 *
 * Prioritas:
 *   1. Prefix client key — ini yang menentukan token mana yang valid,
 *      jadi paling bisa dipercaya. Key "SB-" HANYA jalan di sandbox.
 *   2. VITE_MIDTRANS_ENV — dipakai kalau client key belum di-set.
 *
 * Sengaja TIDAK memakai VITE_MIDTRANS_ENV secara buta: menyetel
 * env="production" sementara key masih "SB-..." bikin Snap gagal load
 * ("client key tidak valid") — bukan bikin transaksinya jadi production.
 */
export function resolveMidtransEnv(clientKey?: string | null): MidtransEnv {
  const key = String(clientKey ?? "").trim();

  if (key) {
    return isSandboxKey(key) ? "sandbox" : "production";
  }

  return import.meta.env.VITE_MIDTRANS_ENV === "production"
    ? "production"
    : "sandbox";
}

/**
 * Peringatan kalau VITE_MIDTRANS_ENV tidak cocok dengan client key.
 * Mengembalikan pesan (string) atau "" kalau konsisten.
 */
export function midtransEnvMismatch(clientKey?: string | null): string {
  const declared = import.meta.env.VITE_MIDTRANS_ENV as string | undefined;
  const key = String(clientKey ?? "").trim();

  if (!declared || !key) return "";

  const actual = resolveMidtransEnv(key);

  if (declared === actual) return "";

  return `VITE_MIDTRANS_ENV="${declared}" tapi VITE_MIDTRANS_CLIENT_KEY "${key.slice(
    0,
    14,
  )}..." adalah key ${actual}. Yang dipakai: ${actual}.`;
}

/** URL script Snap sesuai mode yang benar-benar aktif. */
export function snapScriptUrl(clientKey?: string | null): string {
  return `${SNAP_HOST[resolveMidtransEnv(clientKey)]}/snap/snap.js`;
}

/** Deteksi mode dari redirect_url yang dikirim BACKEND (sumber kebenaran). */
export function envFromRedirectUrl(url?: string | null): MidtransEnv | null {
  if (!url) return null;

  if (url.includes("sandbox.midtrans.com")) return "sandbox";
  if (url.includes("midtrans.com")) return "production";

  return null;
}

/**
 * Muat script Snap.js (pakai data-client-key).
 * Kalau script lama dimuat dengan key/URL berbeda, script akan diganti
 * supaya tidak nyangkut di mode lama saat env diubah.
 */
export function loadSnapScript(clientKey: string | undefined): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!clientKey) {
      reject(
        new Error("VITE_MIDTRANS_CLIENT_KEY belum di-set di .env frontend."),
      );
      return;
    }

    const src = snapScriptUrl(clientKey);
    const existing = document.getElementById(
      "midtrans-snap-script",
    ) as HTMLScriptElement | null;

    if (existing) {
      const sameKey = existing.getAttribute("data-client-key") === clientKey;
      const sameSrc = existing.getAttribute("src") === src;

      // Sudah dimuat dengan konfigurasi yang sama → pakai lagi.
      if (sameKey && sameSrc && window.snap) {
        resolve();
        return;
      }

      // Konfigurasi berubah → buang script & objek snap lama.
      existing.remove();
      delete window.snap;
    }

    const script = document.createElement("script");
    script.id = "midtrans-snap-script";
    script.src = src;
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error(
          `Gagal memuat Snap.js dari ${src} — periksa koneksi internet & kecocokan client key.`,
        ),
      );
    document.body.appendChild(script);
  });
}

/**
 * Terjemahkan error mentah dari backend jadi pesan yang bisa ditindaklanjuti.
 *
 * Kasus paling sering: HTTP 401 "Access denied due to unauthorized
 * transaction, please check client or server key" — artinya SERVER KEY yang
 * dipakai backend tidak cocok dengan environment yang dituju.
 *
 * Mengembalikan "" kalau error-nya bukan pola yang dikenali.
 */
export function explainMidtransError(raw?: string | null): string {
  const msg = String(raw ?? "");

  if (!msg) return "";

  const is401 =
    /401/.test(msg) ||
    /unauthorized transaction/i.test(msg) ||
    /check client or server key/i.test(msg);

  if (is401) {
    return [
      "Midtrans menolak kredensial backend (HTTP 401).",
      "",
      "Penyebab umum, periksa di BACKEND:",
      "1. SERVER KEY dan flag isProduction tidak cocok — server key production (tanpa prefix SB-) harus dipakai dengan isProduction=true, dan server key sandbox (SB-Mid-server-...) dengan isProduction=false.",
      "2. Yang dipasang di MIDTRANS_SERVER_KEY ternyata CLIENT key, bukan SERVER key.",
      "3. Key production belum aktif karena akun Midtrans belum lolos verifikasi.",
      "4. Env backend sudah diubah tapi prosesnya belum di-restart.",
      "5. Ada spasi/kutip/baris baru ikut tersalin di nilai server key.",
    ].join("\n");
  }

  return "";
}

/** Buka popup Snap pembayaran */
export function payWithSnap(
  token: string,
  handlers?: {
    onSuccess?: (result: unknown) => void;
    onPending?: (result: unknown) => void;
    onError?: (result: unknown) => void;
    onClose?: () => void;
  },
) {
  const snap = window.snap;

  if (!snap) {
    throw new Error("Snap.js belum termuat.");
  }

  snap.pay(token, handlers);
}

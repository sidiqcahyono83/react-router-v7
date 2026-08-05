// ============================================================
// Helper Midtrans Snap (frontend)
// Butuh env: VITE_MIDTRANS_CLIENT_KEY (client key Snap)
// Contoh sandbox: SB-Mid-client-xxxxx
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

/** URL script Snap — sandbox / production sesuai env VITE_MIDTRANS_ENV */
export function snapScriptUrl() {
  const base =
    import.meta.env.VITE_MIDTRANS_ENV === "production"
      ? "https://app.midtrans.com"
      : "https://app.sandbox.midtrans.com";

  return `${base}/snap/snap.js`;
}

/** Muat script Snap.js sekali (pakai data-client-key) */
export function loadSnapScript(clientKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("midtrans-snap-script");

    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.id = "midtrans-snap-script";
    script.src = snapScriptUrl();
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Gagal memuat Snap.js — periksa koneksi internet."));
    document.body.appendChild(script);
  });
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

// ============================================================
// Helper WhatsApp — normalisasi nomor HP Indonesia & build link wa.me
// ============================================================

/**
 * Ubah nomor HP lokal jadi format internasional tanpa "+" (dipakai wa.me).
 *
 *   "0812-3456-7890"  -> "6281234567890"
 *   "+62 812 3456 78" -> "62812345678"
 *   "812345678"       -> "62812345678"
 *
 * Mengembalikan "" bila nomor tidak valid / terlalu pendek.
 */
export function normalizePhoneId(raw?: string | null): string {
  if (!raw) return "";

  // buang semua karakter selain angka (spasi, "-", "(", ")", "+")
  let digits = String(raw).replace(/\D/g, "");
  if (!digits) return "";

  // 62xxxx -> sudah benar
  // 0xxxx  -> ganti 0 dengan 62
  // 8xxxx  -> tambah 62 di depan
  if (digits.startsWith("62")) {
    // biarkan
  } else if (digits.startsWith("0")) {
    digits = `62${digits.slice(1)}`;
  } else if (digits.startsWith("8")) {
    digits = `62${digits}`;
  } else {
    // format tidak dikenal (mis. nomor negara lain) — pakai apa adanya
  }

  // nomor Indonesia minimal ~10 digit termasuk kode negara
  if (digits.length < 10 || digits.length > 15) return "";

  return digits;
}

/** Tampilan nomor yang enak dibaca: "+62 812-3456-7890" */
export function formatPhoneDisplay(raw?: string | null): string {
  const p = normalizePhoneId(raw);
  if (!p) return raw ? String(raw) : "-";

  const rest = p.slice(2); // buang "62"
  const groups = rest.match(/^(\d{3})(\d{3,4})(\d{0,6})$/);

  if (!groups) return `+${p}`;

  return `+62 ${[groups[1], groups[2], groups[3]].filter(Boolean).join("-")}`;
}

/**
 * Bangun URL WhatsApp.
 * - Ada nomor  -> https://wa.me/62xxx?text=... (langsung ke chat customer)
 * - Tanpa nomor -> https://wa.me/?text=...      (user pilih kontak sendiri)
 *
 * `text` ditulis dengan newline biasa ("\n"), encoding ditangani di sini.
 */
export function buildWhatsAppUrl(text: string, phone?: string | null): string {
  const target = normalizePhoneId(phone);
  const query = `?text=${encodeURIComponent(text)}`;

  return target ? `https://wa.me/${target}${query}` : `https://wa.me/${query}`;
}

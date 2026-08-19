# Konfigurasi Midtrans

Catatan troubleshooting untuk pembayaran Snap di halaman `/bayar/:invoiceId`.

## Mode ditentukan di DUA sisi

| Sisi | Variabel | Sandbox | Production |
|---|---|---|---|
| Frontend (repo ini) | `VITE_MIDTRANS_CLIENT_KEY` | `SB-Mid-client-xxx` | `Mid-client-xxx` |
| Frontend (repo ini) | `VITE_MIDTRANS_ENV` | `sandbox` | `production` |
| **Backend** | `MIDTRANS_SERVER_KEY` | `SB-Mid-server-xxx` | `Mid-server-xxx` |
| **Backend** | `isProduction` | `false` | `true` |

Keempatnya harus konsisten. **Server key dan `isProduction` di backend yang menentukan transaksi nyata atau tidak** — frontend tidak bisa mengubahnya.

> Client/server key **sandbox selalu berawalan `SB-`**. Key production tidak.

Ambil key di [dashboard.midtrans.com](https://dashboard.midtrans.com) → **Settings → Access Keys**. Pastikan pemilih environment di kiri atas ada di **Production**, bukan Sandbox.

---

## Error: HTTP 401 — "Access denied due to unauthorized transaction, please check client or server key"

Error ini **selalu dari backend** (saat backend memanggil Midtrans untuk membuat Snap token). Bukan masalah frontend.

Urutan pengecekan di backend:

**1. Server key tidak cocok dengan `isProduction`** — penyebab paling umum.

Kombinasi yang valid hanya dua:

```js
// Production
new midtransClient.Snap({
  isProduction: true,
  serverKey: "Mid-server-xxxxxxxx",   // TANPA "SB-"
  clientKey: "Mid-client-xxxxxxxx",
});

// Sandbox
new midtransClient.Snap({
  isProduction: false,
  serverKey: "SB-Mid-server-xxxxxxxx",
  clientKey: "SB-Mid-client-xxxxxxxx",
});
```

Server key production + `isProduction: false` → **401**. Begitu pula sebaliknya.

Hati-hati kalau `isProduction` dibaca dari env: `process.env.MIDTRANS_IS_PRODUCTION` menghasilkan **string**, dan `"false"` itu truthy. Gunakan `=== "true"`.

**2. Yang dipasang CLIENT key, bukan SERVER key.** Mudah tertukar karena namanya mirip. `serverKey` harus `Mid-server-...` / `SB-Mid-server-...`.

**3. Akun belum lolos verifikasi.** Key production baru aktif setelah akun disetujui Midtrans. Sebelum itu, hanya sandbox yang jalan.

**4. Backend belum di-restart** setelah env diubah.

**5. Nilai key kotor** — spasi, tanda kutip, atau baris baru ikut tersalin. Cek panjangnya:

```bash
node -e 'console.log(JSON.stringify(process.env.MIDTRANS_SERVER_KEY))'
```

Harus bersih tanpa spasi/`\n` di ujung.

**Uji key langsung tanpa lewat aplikasi:**

```bash
# Production
curl -u "Mid-server-xxxxxxxx:" https://api.midtrans.com/v2/ping
# Sandbox
curl -u "SB-Mid-server-xxxxxxxx:" https://api.sandbox.midtrans.com/v2/ping
```

Tetap 401 → key-nya memang salah/belum aktif. Perhatikan tanda titik dua `:` di akhir (password kosong) dan pastikan host-nya sesuai environment.

---

## Error: transaksi "masih test / sandbox"

Halaman `/bayar/:invoiceId` menampilkan indikator otomatis:

- **Banner kuning "MODE UJI COBA (Sandbox)"** → transaksi tidak nyata.
- **Banner merah** → frontend dan backend beda mode.
- **Baris "Mode"** di kartu pembayaran → mode sebenarnya, dibaca dari `redirect_url` yang dikirim backend.

Kalau banner kuning muncul padahal `.env` frontend sudah production, berarti **backend masih pakai server key sandbox**.

---

## ⚠️ Wajib build ulang setelah ubah `.env`

Vite meng-**inline** nilai `VITE_*` saat **build**, bukan membacanya saat runtime. `pm2 restart` saja **tidak berpengaruh**:

```bash
bun run build
pm2 restart frontend
```

Lihat `.env.example` untuk daftar variabel frontend.

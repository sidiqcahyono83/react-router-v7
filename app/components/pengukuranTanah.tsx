import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import jsPDF from 'jspdf';
import '../../app/pengukuranTanah.css';

/* ============================================================
   TYPES
   ============================================================ */

type JenisTransaksi = 'Jual Beli' | 'Waris' | 'Hibah';

interface SisiState {
  a: string;
  b: string;
  c: string;
  d: string;
}

interface FormState {
  namaSppt: string;
  noSppt: string;
  jenisTransaksi: JenisTransaksi;
  nominalJual: string;
  pihakPertama: string;
  pihakKedua: string[];
  sisi: SisiState;
  petugas: [string, string, string, string, string];
  saksi: [string, string, string, string, string];
}

interface ToastState {
  message: string;
  isError: boolean;
}

interface BrahmaguptaResult {
  s: number;
  term: number;
  luas: number;
  valid: boolean;
}

interface Point {
  x: number;
  y: number;
}

interface QuadPointsResult {
  pts: Point[];
  geomValid: boolean;
}

const STORAGE_KEY = 'sppt_pengukuran_data';

const emptyForm: FormState = {
  namaSppt: '',
  noSppt: '',
  jenisTransaksi: 'Jual Beli',
  nominalJual: '',
  pihakPertama: '',
  pihakKedua: [''],
  sisi: { a: '', b: '', c: '', d: '' },
  petugas: ['', '', '', '', ''],
  saksi: ['', '', '', '', ''],
};

/* ============================================================
   PURE HELPERS (geometry & math — no React here)
   ============================================================ */

function hitungBrahmagupta(
  a: number,
  b: number,
  c: number,
  d: number
): BrahmaguptaResult {
  const s = (a + b + c + d) / 2;
  const term = (s - a) * (s - b) * (s - c) * (s - d);
  const valid = term >= 0 && a > 0 && b > 0 && c > 0 && d > 0;
  const luas = valid ? Math.sqrt(term) : 0;
  return { s, term: Math.max(term, 0), luas, valid };
}

/** Geometri segiempat siklis (cyclic quadrilateral) dari 4 sisi A-B-C-D berurutan. */
function computeQuadPoints(
  a: number,
  b: number,
  c: number,
  d: number
): QuadPointsResult {
  const cosBraw = (a * a + b * b - c * c - d * d) / (2 * (a * b + c * d));
  const cosAraw = (a * a + d * d - b * b - c * c) / (2 * (a * d + b * c));
  const inRange = (v: number) => v >= -1 && v <= 1;
  const geomValid = inRange(cosBraw) && inRange(cosAraw);
  const cosB = Math.max(-1, Math.min(1, cosBraw));
  const cosA = Math.max(-1, Math.min(1, cosAraw));
  const angleB = Math.acos(cosB);
  const angleA = Math.acos(cosA);
  const angleC = Math.PI - angleA;

  let heading = 0;
  let x = 0;
  let y = 0;
  const pts: Point[] = [{ x, y }];

  x += a * Math.cos(heading);
  y += a * Math.sin(heading);
  pts.push({ x, y });

  heading += Math.PI - angleB;
  x += b * Math.cos(heading);
  y += b * Math.sin(heading);
  pts.push({ x, y });

  heading += Math.PI - angleC;
  x += c * Math.cos(heading);
  y += c * Math.sin(heading);
  pts.push({ x, y });

  return { pts, geomValid };
}

function wrapCenterText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  maxWidth: number
): void {
  const words = text.split(' ');
  const lines: string[] = [''];
  let li = 0;
  words.forEach((w) => {
    const test = (lines[li] + ' ' + w).trim();
    if (ctx.measureText(test).width > maxWidth && lines[li].length) {
      li++;
      lines[li] = w;
    } else {
      lines[li] = test;
    }
  });
  lines.forEach((ln, i) => ctx.fillText(ln, cx, cy + i * 15));
}

interface DrawSketchParams {
  a: number;
  b: number;
  c: number;
  d: number;
  pihakPertama: string;
  pihakKeduaArr: string[];
}

function drawSketch(canvas: HTMLCanvasElement, params: DrawSketchParams): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  ctx.fillStyle = '#FCFBF6';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = '#CCC0A0';
  ctx.lineWidth = 2;
  ctx.strokeRect(6, 6, W - 12, H - 12);

  const { a, b, c, d, pihakPertama, pihakKeduaArr } = params;

  ctx.font = '600 15px Inter, sans-serif';
  ctx.fillStyle = '#5B6B7A';
  if (a <= 0 || b <= 0 || c <= 0 || d <= 0) {
    ctx.textAlign = 'center';
    ctx.fillText(
      'Isi keempat panjang sisi untuk menampilkan sketsa bidang',
      W / 2,
      H / 2
    );
    return;
  }

  const { pts, geomValid } = computeQuadPoints(a, b, c, d);
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const bw = Math.max(maxX - minX, 0.001);
  const bh = Math.max(maxY - minY, 0.001);
  const pad = 110;
  const scale = Math.min((W - pad * 2) / bw, (H - pad * 2 - 30) / bh);
  const offX = (W - bw * scale) / 2 - minX * scale;
  const offY = (H - 30 - bh * scale) / 2 - minY * scale + 10;
  const P: Point[] = pts.map((p) => ({
    x: p.x * scale + offX,
    y: p.y * scale + offY,
  }));

  ctx.beginPath();
  ctx.moveTo(P[0].x, P[0].y);
  P.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.closePath();
  ctx.fillStyle = '#EFE6CC';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#1E3A5F';
  ctx.stroke();

  const vLabels = ['A', 'B', 'C', 'D'];
  const cx0 = ((minX + maxX) / 2) * scale + offX;
  const cy0 = ((minY + maxY) / 2) * scale + offY;

  ctx.font = '700 14px JetBrains Mono, monospace';
  P.forEach((p, i) => {
    const dx = p.x - cx0;
    const dy = p.y - cy0;
    const len = Math.hypot(dx, dy) || 1;
    const lx = p.x + (dx / len) * 18;
    const ly = p.y + (dy / len) * 18;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#1E3A5F';
    ctx.fill();
    ctx.fillStyle = '#A8763A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(vLabels[i], lx, ly);
  });

  const sides = [a, b, c, d];
  ctx.font = '600 13px JetBrains Mono, monospace';
  for (let i = 0; i < 4; i++) {
    const p1 = P[i];
    const p2 = P[(i + 1) % 4];
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;
    const dx = mx - cx0;
    const dy = my - cy0;
    const len = Math.hypot(dx, dy) || 1;
    const lx = mx + (dx / len) * 16;
    const ly = my + (dy / len) * 16;
    const label = sides[i].toFixed(2) + ' m';
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = '#FCFBF6';
    ctx.fillRect(lx - tw / 2 - 4, ly - 9, tw + 8, 18);
    ctx.fillStyle = '#20303F';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, lx, ly);
  }

  const p1Name = pihakPertama.trim() || '(Pihak Pertama)';
  const p2Name = pihakKeduaArr.length
    ? pihakKeduaArr.filter((v) => v.trim()).join(', ') || '(Pihak Kedua)'
    : '(Pihak Kedua)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 13px Inter, sans-serif';
  ctx.fillStyle = '#1E3A5F';
  ctx.fillText('Pihak I: ' + p1Name, cx0, cy0 - 9);
  ctx.font = '600 12px Inter, sans-serif';
  ctx.fillStyle = '#5B6B7A';
  wrapCenterText(ctx, 'Pihak II: ' + p2Name, cx0, cy0 + 9, bw * scale * 0.8);

  const nx = W - 58;
  const ny = 64;
  ctx.strokeStyle = '#1E3A5F';
  ctx.fillStyle = '#1E3A5F';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(nx, ny + 24);
  ctx.lineTo(nx, ny - 18);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(nx, ny - 24);
  ctx.lineTo(nx - 7, ny - 12);
  ctx.lineTo(nx + 7, ny - 12);
  ctx.closePath();
  ctx.fill();
  ctx.font = '700 11px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('U', nx, ny + 38);

  ctx.font = '500 11px JetBrains Mono, monospace';
  ctx.fillStyle = '#5B6B7A';
  ctx.textAlign = 'left';
  ctx.fillText('SKETSA — TIDAK BERSKALA PETA', 18, H - 18);

  if (!geomValid) {
    ctx.fillStyle = '#A6423A';
    ctx.font = '600 12px Inter, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(
      '⚠ Sisi tidak membentuk segiempat siklis sempurna — sketsa pendekatan',
      W - 16,
      H - 18
    );
  }
}

function rawNumber(str: string): number {
  return Number((str || '').replace(/[^0-9]/g, '')) || 0;
}

/* ============================================================
   COMPONENT
   ============================================================ */

export default function PengukuranTanah() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [toastState, setToastState] = useState<ToastState | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, isError = false) => {
    setToastState({ message, isError });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastState(null), 2600);
  }, []);

  /* ---------- derived values ---------- */
  const sisiNum = useMemo(
    () => ({
      a: Number(form.sisi.a) || 0,
      b: Number(form.sisi.b) || 0,
      c: Number(form.sisi.c) || 0,
      d: Number(form.sisi.d) || 0,
    }),
    [form.sisi]
  );

  const calc = useMemo(
    () => hitungBrahmagupta(sisiNum.a, sisiNum.b, sisiNum.c, sisiNum.d),
    [sisiNum]
  );

  const sisiWarning = useMemo(() => {
    const { a, b, c, d } = sisiNum;
    if (a > 0 && b > 0 && c > 0 && d > 0) {
      const s = (a + b + c + d) / 2;
      const negative = [s - a, s - b, s - c, s - d].some((v) => v < 0);
      if (negative) {
        return '⚠ Kombinasi panjang sisi ini tidak membentuk bangun segiempat yang valid. Periksa kembali ukuran sisi.';
      }
    }
    return null;
  }, [sisiNum]);

  /* ---------- redraw canvas whenever relevant fields change ---------- */
  useEffect(() => {
    if (!canvasRef.current) return;
    drawSketch(canvasRef.current, {
      a: sisiNum.a,
      b: sisiNum.b,
      c: sisiNum.c,
      d: sisiNum.d,
      pihakPertama: form.pihakPertama,
      pihakKeduaArr: form.pihakKedua,
    });
  }, [sisiNum, form.pihakPertama, form.pihakKedua]);

  /* ---------- generic field handlers ---------- */
  const handleTextChange =
    (field: keyof Pick<FormState, 'namaSppt' | 'noSppt' | 'pihakPertama'>) =>
      (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
      };

  const handleJenisTransaksiChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as JenisTransaksi;
    setForm((prev) => ({
      ...prev,
      jenisTransaksi: value,
      nominalJual: value === 'Jual Beli' ? prev.nominalJual : '',
    }));
  };

  const handleNominalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const n = rawNumber(e.target.value);
    setForm((prev) => ({
      ...prev,
      nominalJual: n ? n.toLocaleString('id-ID') : '',
    }));
  };

  const handleSisiChange =
    (key: keyof SisiState) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, sisi: { ...prev.sisi, [key]: value } }));
    };

  /* ---------- pihak kedua (dynamic list) ---------- */
  const handlePihakKeduaChange = (idx: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.pihakKedua];
      next[idx] = value;
      return { ...prev, pihakKedua: next };
    });
  };

  const addPihakKedua = () => {
    setForm((prev) => ({ ...prev, pihakKedua: [...prev.pihakKedua, ''] }));
  };

  const removePihakKedua = (idx: number) => {
    setForm((prev) => {
      if (prev.pihakKedua.length <= 1) {
        showToast('Minimal satu Pihak Kedua diperlukan', true);
        return prev;
      }
      return { ...prev, pihakKedua: prev.pihakKedua.filter((_, i) => i !== idx) };
    });
  };

  /* ---------- petugas & saksi (fixed 5 slots) ---------- */
  const handlePetugasChange = (idx: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.petugas] as FormState['petugas'];
      next[idx] = value;
      return { ...prev, petugas: next };
    });
  };

  const handleSaksiChange = (idx: number, value: string) => {
    setForm((prev) => {
      const next = [...prev.saksi] as FormState['saksi'];
      next[idx] = value;
      return { ...prev, saksi: next };
    });
  };

  /* ---------- simpan / muat (localStorage) ---------- */
  const simpanData = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
      showToast('Data berhasil disimpan');
    } catch (err) {
      showToast('Gagal menyimpan data', true);
    }
  };

  const muatData = () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as FormState;
        setForm({
          ...emptyForm,
          ...parsed,
          sisi: { ...emptyForm.sisi, ...parsed.sisi },
          petugas: (parsed.petugas?.length === 5
            ? parsed.petugas
            : emptyForm.petugas) as FormState['petugas'],
          saksi: (parsed.saksi?.length === 5
            ? parsed.saksi
            : emptyForm.saksi) as FormState['saksi'],
          pihakKedua: parsed.pihakKedua?.length ? parsed.pihakKedua : [''],
        });
        showToast('Data tersimpan dimuat, silakan edit');
      } else {
        showToast('Belum ada data tersimpan', true);
      }
    } catch (err) {
      showToast('Belum ada data tersimpan', true);
    }
  };

  /* ---------- PDF export ---------- */
  const generatePDF = () => {
    try {
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = 210;
      const marginL = 16;
      const contentW = pageW - marginL * 2;
      let y = 18;

      const checkPage = (need: number) => {
        if (y + need > 285) {
          doc.addPage();
          y = 18;
        }
      };
      const h1 = (text: string) => {
        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(30, 58, 95);
        doc.text(text, marginL, y);
        y += 8;
        doc.setDrawColor(168, 118, 58);
        doc.setLineWidth(0.6);
        doc.line(marginL, y - 4.5, marginL + contentW, y - 4.5);
      };
      const h2 = (text: string) => {
        checkPage(14);
        doc.setFont('times', 'bold');
        doc.setFontSize(12.5);
        doc.setTextColor(30, 58, 95);
        doc.text(text, marginL, y);
        y += 6;
      };
      const kv = (label: string, value: string) => {
        checkPage(7);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(90, 100, 110);
        doc.text(label, marginL, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10.5);
        doc.setTextColor(32, 48, 63);
        doc.text(String(value || '-'), marginL + 52, y);
        y += 6.4;
      };
      const bodyLine = (text: string) => {
        checkPage(6);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(32, 48, 63);
        doc.text(text, marginL, y);
        y += 5.6;
      };

      const { a, b, c, d } = sisiNum;
      const r = calc;

      h1('Laporan Pengukuran Tanah');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(90, 100, 110);
      doc.text(
        'Dihitung dengan rumus Brahmagupta untuk bidang segiempat',
        marginL,
        y
      );
      y += 8;

      h2('1. Data Surat & Transaksi');
      kv('Nama SPPT', form.namaSppt);
      kv('Nomor SPPT', form.noSppt);
      kv('Jenis Transaksi', form.jenisTransaksi);
      if (form.jenisTransaksi === 'Jual Beli') {
        kv('Nominal Jual Beli', 'Rp ' + (form.nominalJual || '0'));
      }
      y += 2;

      h2('2. Para Pihak');
      kv('Pihak Pertama', form.pihakPertama);
      kv(
        'Pihak Kedua',
        form.pihakKedua.filter((v) => v.trim()).join(', ') || '-'
      );
      y += 2;

      h2('3. Panjang Sisi Bidang');
      kv('Sisi A–B', a.toFixed(2) + ' m');
      kv('Sisi B–C', b.toFixed(2) + ' m');
      kv('Sisi C–D', c.toFixed(2) + ' m');
      kv('Sisi D–A', d.toFixed(2) + ' m');
      y += 2;

      h2('4. Perhitungan Luas (Rumus Brahmagupta)');
      bodyLine('s = (a + b + c + d) / 2 = ' + r.s.toFixed(3));
      bodyLine(
        'L = \u221A[(s\u2212a)(s\u2212b)(s\u2212c)(s\u2212d)] = \u221A' +
        r.term.toFixed(3)
      );
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(30, 58, 95);
      checkPage(7);
      doc.text(
        'Luas = ' +
        r.luas.toFixed(3) +
        ' m²   (' +
        (r.luas / 14).toFixed(3) +
        ' ubin, 1 ubin = 14 m²)',
        marginL,
        y
      );
      y += 9;

      h2('5. Sketsa Bidang Tanah');
      checkPage(95);
      if (canvasRef.current) {
        const imgData = canvasRef.current.toDataURL('image/png');
        const imgW = contentW;
        const imgH =
          imgW * (canvasRef.current.height / canvasRef.current.width);
        doc.setDrawColor(204, 192, 160);
        doc.setLineWidth(0.3);
        doc.rect(marginL, y, imgW, imgH);
        doc.addImage(imgData, 'PNG', marginL, y, imgW, imgH);
        y += imgH + 10;
      }

      const sigTable = (title: string, names: readonly string[]) => {
        checkPage(16);
        h2(title);
        const rowH = 20;
        const colNo = 10;
        const colName = 65;
        const colSig = contentW - colNo - colName;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(90, 100, 110);
        doc.text('No', marginL + 2, y);
        doc.text('Nama', marginL + colNo + 2, y);
        doc.text('Tanda Tangan', marginL + colNo + colName + 2, y);
        y += 3;
        for (let i = 0; i < 5; i++) {
          checkPage(rowH + 2);
          doc.setDrawColor(204, 192, 160);
          doc.setLineWidth(0.25);
          doc.rect(marginL, y, colNo, rowH);
          doc.rect(marginL + colNo, y, colName, rowH);
          doc.rect(marginL + colNo + colName, y, colSig, rowH);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);
          doc.setTextColor(32, 48, 63);
          doc.text(String(i + 1), marginL + 3.5, y + 6);
          doc.text(String(names[i] || '-'), marginL + colNo + 3, y + 6);
          y += rowH;
        }
        y += 8;
      };

      sigTable('6. Petugas Ukur', form.petugas);
      sigTable('7. Saksi Pengukuran', form.saksi);

      checkPage(10);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(120, 130, 140);
      const tgl = new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      doc.text('Dokumen dibuat pada ' + tgl, marginL, y);

      const fileSafeName = (form.noSppt || form.namaSppt || 'pengukuran').replace(
        /[^a-zA-Z0-9]+/g,
        '_'
      );
      doc.save('Pengukuran_Tanah_' + fileSafeName + '.pdf');
      showToast('PDF berhasil diunduh');
    } catch (err) {
      console.error(err);
      showToast('Gagal membuat PDF', true);
    }
  };

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div className="pengukuran-tanah-app">
      <div className="pt-wrap">
        <header className="pt-top">
          <div className="pt-eyebrow">Sistem Pendataan &amp; Sketsa Bidang</div>
          <h1>Aplikasi Pengukuran Tanah</h1>
          <p>
            Pendataan bidang tanah untuk keperluan SPPT, dengan perhitungan
            luas menggunakan rumus Brahmagupta dan sketsa bidang otomatis.
          </p>
        </header>

        {/* 1. DATA SURAT */}
        <section className="pt-section">
          <div className="pt-section-head">
            <span className="pt-section-num">01</span>
            <h2>Data Surat &amp; Transaksi</h2>
          </div>
          <div className="pt-section-body">
            <div className="pt-grid">
              <div className="pt-field">
                <label htmlFor="namaSppt">Nama SPPT</label>
                <input
                  id="namaSppt"
                  type="text"
                  placeholder="mis. SPPT An. Suprapto"
                  value={form.namaSppt}
                  onChange={handleTextChange('namaSppt')}
                />
              </div>
              <div className="pt-field">
                <label htmlFor="noSppt">Nomor SPPT</label>
                <input
                  id="noSppt"
                  type="text"
                  placeholder="mis. 33.75.010.005.014-0032.0"
                  value={form.noSppt}
                  onChange={handleTextChange('noSppt')}
                />
              </div>
            </div>
            <div className="pt-grid">
              <div className="pt-field">
                <label htmlFor="jenisTransaksi">Jenis Transaksi</label>
                <select
                  id="jenisTransaksi"
                  value={form.jenisTransaksi}
                  onChange={handleJenisTransaksiChange}
                >
                  <option value="Jual Beli">Jual Beli</option>
                  <option value="Waris">Waris</option>
                  <option value="Hibah">Hibah</option>
                </select>
              </div>
              <div className="pt-field">
                <label htmlFor="nominalJual">Nominal Jual Beli (Rp)</label>
                <input
                  id="nominalJual"
                  type="text"
                  placeholder="0"
                  value={form.nominalJual}
                  disabled={form.jenisTransaksi !== 'Jual Beli'}
                  onChange={handleNominalChange}
                />
                <div className="pt-hint">
                  Otomatis diformat, hanya berlaku untuk transaksi Jual Beli.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. PARA PIHAK */}
        <section className="pt-section">
          <div className="pt-section-head">
            <span className="pt-section-num">02</span>
            <h2>Para Pihak</h2>
          </div>
          <div className="pt-section-body">
            <div className="pt-field">
              <label htmlFor="pihakPertama">Nama Pihak Pertama</label>
              <input
                id="pihakPertama"
                type="text"
                placeholder="mis. Bapak Suprapto"
                value={form.pihakPertama}
                onChange={handleTextChange('pihakPertama')}
              />
            </div>
            <div className="pt-field">
              <label>Nama Pihak Kedua</label>
              <div className="pt-hint" style={{ marginBottom: 8 }}>
                Tambahkan lebih dari satu apabila bidang tanah dilakukan
                pemecahan.
              </div>
              {form.pihakKedua.map((val, idx) => (
                <div className="pt-row-remove" key={idx}>
                  <input
                    type="text"
                    placeholder="mis. Ibu Ratna Sari"
                    value={val}
                    onChange={(e) => handlePihakKeduaChange(idx, e.target.value)}
                  />
                  <button
                    type="button"
                    className="pt-btn-icon"
                    title="Hapus"
                    onClick={() => removePihakKedua(idx)}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="pt-btn pt-btn-ghost"
                onClick={addPihakKedua}
              >
                + Tambah Pihak Kedua
              </button>
            </div>
          </div>
        </section>

        {/* 3. PANJANG SISI */}
        <section className="pt-section">
          <div className="pt-section-head">
            <span className="pt-section-num">03</span>
            <h2>Panjang Sisi Bidang</h2>
          </div>
          <div className="pt-section-body">
            <div className="pt-hint" style={{ marginBottom: 12 }}>
              Bidang dianggap sebagai segiempat dengan 4 sisi berurutan
              A–B–C–D, sebagaimana disyaratkan rumus Brahmagupta.
            </div>
            <table className="pt-sides-table">
              <tbody>
                <tr>
                  <th>Sisi</th>
                  <th>Panjang (meter)</th>
                </tr>
                {(['a', 'b', 'c', 'd'] as const).map((key, i) => {
                  const labels = ['A–B', 'B–C', 'C–D', 'D–A'];
                  return (
                    <tr key={key}>
                      <td>
                        <span className="pt-side-label">{labels[i]}</span>
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="0.00"
                          value={form.sisi[key]}
                          onChange={handleSisiChange(key)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {sisiWarning && <div className="pt-warn">{sisiWarning}</div>}
          </div>
        </section>

        {/* 4. SKETSA */}
        <section className="pt-section">
          <div className="pt-section-head">
            <span className="pt-section-num">04</span>
            <h2>Sketsa Bidang Tanah</h2>
          </div>
          <div className="pt-section-body">
            <div className="pt-hint" style={{ marginBottom: 10 }}>
              Sketsa digambar otomatis dari panjang sisi di atas. Jika bidang
              dipecah, sketsa tetap ditampilkan sebagai satu bidang utuh
              dengan seluruh nama pihak kedua di tengahnya.
            </div>
            <div className="pt-sketch-wrap">
              <canvas ref={canvasRef} width={900} height={620} />
            </div>
          </div>
        </section>

        {/* 5. PERHITUNGAN */}
        <section className="pt-section">
          <div className="pt-section-head">
            <span className="pt-section-num">05</span>
            <h2>Perhitungan Luas — Rumus Brahmagupta</h2>
          </div>
          <div className="pt-section-body">
            <div className="pt-calc-box">
              {sisiNum.a > 0 && sisiNum.b > 0 && sisiNum.c > 0 && sisiNum.d > 0 ? (
                <>
                  <div className="pt-step">
                    s = (a + b + c + d) / 2 = ({sisiNum.a.toFixed(2)} +{' '}
                    {sisiNum.b.toFixed(2)} + {sisiNum.c.toFixed(2)} +{' '}
                    {sisiNum.d.toFixed(2)}) / 2 = <b>{calc.s.toFixed(3)}</b>
                  </div>
                  <div className="pt-step">
                    L = √[(s−a)(s−b)(s−c)(s−d)]
                  </div>
                  <div className="pt-step">
                    L = √[({calc.s.toFixed(2)}−{sisiNum.a.toFixed(2)}) × (
                    {calc.s.toFixed(2)}−{sisiNum.b.toFixed(2)}) × (
                    {calc.s.toFixed(2)}−{sisiNum.c.toFixed(2)}) × (
                    {calc.s.toFixed(2)}−{sisiNum.d.toFixed(2)})]
                  </div>
                  <div className="pt-step">L = √{calc.term.toFixed(3)}</div>
                  <div className="pt-result">L = {calc.luas.toFixed(3)} m²</div>
                </>
              ) : (
                'Isi panjang sisi A–B, B–C, C–D, D–A untuk menampilkan perhitungan.'
              )}
            </div>
            <div className="pt-result-cards">
              <div className="pt-card">
                <div className="pt-num">{calc.luas.toFixed(2)}</div>
                <div className="pt-lbl">Meter Persegi (m²)</div>
              </div>
              <div className="pt-card">
                <div className="pt-num">{(calc.luas / 14).toFixed(3)}</div>
                <div className="pt-lbl">Ubin (1 ubin = 14 m²)</div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. PETUGAS */}
        <section className="pt-section">
          <div className="pt-section-head">
            <span className="pt-section-num">06</span>
            <h2>Petugas Ukur</h2>
          </div>
          <div className="pt-section-body">
            <table className="pt-sig-table">
              <thead>
                <tr>
                  <th className="pt-no">No</th>
                  <th>Nama Petugas</th>
                  <th className="pt-sigcell">Tanda Tangan</th>
                </tr>
              </thead>
              <tbody>
                {form.petugas.map((val, idx) => (
                  <tr key={idx}>
                    <td className="pt-no">{idx + 1}</td>
                    <td>
                      <input
                        type="text"
                        placeholder={`Nama petugas ${idx + 1}`}
                        value={val}
                        onChange={(e) =>
                          handlePetugasChange(idx, e.target.value)
                        }
                      />
                    </td>
                    <td className="pt-sigcell">
                      <div className="pt-sig-line" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. SAKSI */}
        <section className="pt-section">
          <div className="pt-section-head">
            <span className="pt-section-num">07</span>
            <h2>Saksi Pengukuran</h2>
          </div>
          <div className="pt-section-body">
            <table className="pt-sig-table">
              <thead>
                <tr>
                  <th className="pt-no">No</th>
                  <th>Nama Saksi</th>
                  <th className="pt-sigcell">Tanda Tangan</th>
                </tr>
              </thead>
              <tbody>
                {form.saksi.map((val, idx) => (
                  <tr key={idx}>
                    <td className="pt-no">{idx + 1}</td>
                    <td>
                      <input
                        type="text"
                        placeholder={`Nama saksi ${idx + 1}`}
                        value={val}
                        onChange={(e) => handleSaksiChange(idx, e.target.value)}
                      />
                    </td>
                    <td className="pt-sigcell">
                      <div className="pt-sig-line" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="pt-actions-bar">
          <button className="pt-btn pt-btn-primary" type="button" onClick={simpanData}>
            Simpan Data
          </button>
          <button className="pt-btn pt-btn-ghost" type="button" onClick={muatData}>
            Muat / Edit Data Tersimpan
          </button>
          <button className="pt-btn pt-btn-brass" type="button" onClick={generatePDF}>
            Download PDF
          </button>
        </div>

        <footer className="pt-foot">
          Aplikasi Pengukuran Tanah — perhitungan luas berbasis rumus
          Brahmagupta untuk segiempat siklis.
        </footer>
      </div>

      {toastState && (
        <div className={`pt-toast pt-show${toastState.isError ? ' pt-err' : ''}`}>
          {toastState.message}
        </div>
      )}
    </div>
  );
}

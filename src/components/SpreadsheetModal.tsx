import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  Eye,
  EyeOff,
  Code2,
  RefreshCw,
  Phone,
  ShieldCheck,
  Gamepad2,
  ChevronRight,
} from 'lucide-react';
import {
  SpreadsheetOrderRecord,
  getSpreadsheetRecords,
  exportSpreadsheetToCsv,
  copySpreadsheetRowToClipboard,
  getGoogleAppsScriptCodeTemplate,
} from '../utils/spreadsheet';
import { formatRupiah } from '../utils/pricing';
import { APP_CONFIG } from '../config/constants';

interface SpreadsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpreadsheetModal: React.FC<SpreadsheetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [records, setRecords] = useState<SpreadsheetOrderRecord[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [showScriptGuide, setShowScriptGuide] = useState(false);
  const [isCopiedScript, setIsCopiedScript] = useState(false);

  const loadRecords = () => {
    setRecords(getSpreadsheetRecords());
  };

  useEffect(() => {
    if (isOpen) {
      loadRecords();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePasswordVisibility = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyRow = async (record: SpreadsheetOrderRecord) => {
    const success = await copySpreadsheetRowToClipboard(record);
    if (success) {
      setCopiedId(record.orderId);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(getGoogleAppsScriptCodeTemplate());
      setIsCopiedScript(true);
      setTimeout(() => setIsCopiedScript(false), 2500);
    } catch {}
  };

  const handleToggleStatus = (orderId: string) => {
    const updated = records.map((r) => {
      if (r.orderId === orderId) {
        const nextStatus: 'Sedang Proses' | 'Selesai' =
          r.status === 'Sedang Proses' ? 'Selesai' : 'Sedang Proses';
        return { ...r, status: nextStatus };
      }
      return r;
    });

    setRecords(updated);
    localStorage.setItem('benbalfas_spreadsheet_records', JSON.stringify(updated));

    // Perbarui juga data joki terakhir jika ada
    try {
      const rawJokis = localStorage.getItem('benbalfas_recent_jokis');
      if (rawJokis) {
        const jokis = JSON.parse(rawJokis);
        const updatedJokis = jokis.map((j: any) => {
          if (j.id === 'rj-' + orderId) {
            const currentRecord = updated.find((u) => u.orderId === orderId);
            return {
              ...j,
              status: currentRecord?.status || j.status,
            };
          }
          return j;
        });
        localStorage.setItem('benbalfas_recent_jokis', JSON.stringify(updatedJokis));
        window.dispatchEvent(
          new CustomEvent('benbalfas_recent_jokis_updated', { detail: updatedJokis })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRecord = (orderId: string) => {
    if (confirm('Hapus baris pesanan ini dari database spreadsheet lokal?')) {
      const filtered = records.filter((r) => r.orderId !== orderId);
      setRecords(filtered);
      localStorage.setItem('benbalfas_spreadsheet_records', JSON.stringify(filtered));

      // Hapus juga dari Data Joki Terakhir
      try {
        const rawJokis = localStorage.getItem('benbalfas_recent_jokis');
        if (rawJokis) {
          const jokis = JSON.parse(rawJokis);
          const updatedJokis = jokis.filter((j: any) => j.id !== 'rj-' + orderId);
          localStorage.setItem('benbalfas_recent_jokis', JSON.stringify(updatedJokis));
          window.dispatchEvent(
            new CustomEvent('benbalfas_recent_jokis_updated', { detail: updatedJokis })
          );
        }
      } catch {}
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-cyan-500/40 rounded-3xl max-w-5xl w-full p-5 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl relative my-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 uppercase font-bold tracking-wider">
                Database & Sinkronisasi Drive Aset
              </span>
            </div>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <FileSpreadsheet className="w-7 h-7 text-emerald-500" />
              <span>Data Spreadsheet Pesanan Joki</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tercatat otomatis setiap kali klien klik konfirmasi pesanan • Terintegrasi ke "Data Joki Terakhir"
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSpreadsheetToCsv(records)}
              disabled={records.length === 0}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Download file CSV siap buka di Google Sheets / Excel"
            >
              <Download className="w-4 h-4" />
              <span>Download (.CSV)</span>
            </button>

            <button
              onClick={() => setShowScriptGuide(!showScriptGuide)}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition border border-slate-300 dark:border-slate-700"
            >
              <Code2 className="w-4 h-4 text-cyan-500" />
              <span>Auto-Sync Cloud</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cloud Apps Script Guide Accordion */}
        {showScriptGuide && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-cyan-500/30 space-y-3 animate-fadeIn text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-slate-900 dark:text-white">
                  Panduan Auto-Sync ke Google Drive Ben Balfas Aset (1 Menit Jadi)
                </span>
              </div>
              <button
                onClick={handleCopyScript}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition"
              >
                {isCopiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopiedScript ? 'Kode Tersalin!' : 'Salin Kode Google Apps Script'}</span>
              </button>
            </div>

            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              <li>Buat file <strong>Google Sheet</strong> baru di Google Drive Ben Balfas Aset.</li>
              <li>Di Google Sheet tersebut, klik menu <strong>Ekstensi (Extensions)</strong> &gt; <strong>Apps Script</strong>.</li>
              <li>Hapus kode bawaan, lalu paste kode yang telah Anda salin dengan tombol di atas.</li>
              <li>Klik tombol <strong>Deploy (Terapkan)</strong> &gt; <strong>New deployment</strong> &gt; Pilih jenis <strong>Web App</strong>.</li>
              <li>Set akses: <em>"Who has access: Anyone"</em>, lalu klik Deploy dan salin URL Web App yang muncul.</li>
              <li>Paste URL tersebut ke variabel <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-cyan-600 dark:text-cyan-400">googleSheetWebhookUrl</code> di file <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">constants.ts</code>!</li>
            </ol>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
              💡 Catatan: Walaupun webhook belum diaktifkan, seluruh pesanan tetap 100% tersimpan aman di database lokal dan bisa di-download via tombol Download (.CSV) kapan saja!
            </p>
          </div>
        )}

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 text-[11px]">Total Record Pesanan:</span>
            <p className="font-mono font-black text-lg text-slate-900 dark:text-white mt-0.5">
              {records.length} Pesanan
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 text-[11px]">Sedang Proses:</span>
            <p className="font-mono font-black text-lg text-amber-600 dark:text-amber-400 mt-0.5">
              {records.filter((r) => r.status === 'Sedang Proses').length} Pesanan
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 text-[11px]">Selesai (Tuntas):</span>
            <p className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400 mt-0.5">
              {records.filter((r) => r.status === 'Selesai').length} Pesanan
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 text-[11px]">Total Omzet Masuk:</span>
            <p className="font-mono font-black text-lg text-cyan-600 dark:text-cyan-400 mt-0.5">
              {formatRupiah(records.reduce((acc, r) => acc + (r.finalPrice || 0), 0))}
            </p>
          </div>
        </div>

        {/* Table View of Spreadsheet Records */}
        {records.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <FileSpreadsheet className="w-12 h-12 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                Belum Ada Record Pesanan Masuk
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Setiap ada klien yang mengisi form checkout dan menekan tombol konfirmasi pesanan, baris data akan langsung muncul di sini dan masuk ke etalase "Data Joki Terakhir".
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3 whitespace-nowrap">Waktu & ID</th>
                  <th className="p-3 whitespace-nowrap">Klien & WhatsApp</th>
                  <th className="p-3 whitespace-nowrap">Platform</th>
                  <th className="p-3 whitespace-nowrap">Layanan (Data Joki)</th>
                  <th className="p-3 whitespace-nowrap">Poin Awal ➔ Target</th>
                  <th className="p-3 whitespace-nowrap">Total Bayar</th>
                  <th className="p-3 whitespace-nowrap">Akun Game</th>
                  <th className="p-3 whitespace-nowrap">Status</th>
                  <th className="p-3 whitespace-nowrap text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-mono">
                {records.map((r) => {
                  const isPassVisible = showPasswordMap[r.orderId];
                  const isRowCopied = copiedId === r.orderId;
                  const waClean = r.whatsappNumber.replace(/\D/g, '');
                  const waUrl = `https://wa.me/${waClean.startsWith('0') ? '62' + waClean.slice(1) : waClean}`;

                  return (
                    <tr
                      key={r.orderId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition"
                    >
                      {/* Waktu & ID */}
                      <td className="p-3 whitespace-nowrap">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                          {r.timestamp}
                        </p>
                        <p className="text-[10px] text-slate-500">{r.orderId}</p>
                      </td>

                      {/* Klien & WhatsApp */}
                      <td className="p-3 whitespace-nowrap">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {r.clientName}
                        </p>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{r.whatsappNumber}</span>
                        </a>
                      </td>

                      {/* Platform */}
                      <td className="p-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                          {r.platformLabel}
                        </span>
                      </td>

                      {/* Layanan */}
                      <td className="p-3 whitespace-nowrap">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                          {r.orderDescription}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          SLA: {r.duration} • Met: {r.paymentMethod}
                        </p>
                      </td>

                      {/* Poin Awal ➔ Target */}
                      <td className="p-3 whitespace-nowrap text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {r.initialRating}
                        </span>
                        <span className="text-slate-400 mx-1">➔</span>
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">
                          {r.targetRating} Pts
                        </span>
                      </td>

                      {/* Total Bayar */}
                      <td className="p-3 whitespace-nowrap">
                        <p className="font-bold text-amber-600 dark:text-amber-400">
                          {formatRupiah(r.finalPrice)}
                        </p>
                        {r.discountPercent > 0 && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            Promo -{r.discountPercent}%
                          </span>
                        )}
                      </td>

                      {/* Akun Game */}
                      <td className="p-3 whitespace-nowrap text-[11px]">
                        <p className="text-slate-900 dark:text-white">
                          User: <code className="text-cyan-600 dark:text-cyan-400">{r.accountUsername}</code>
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                          <span>Pass: {isPassVisible ? r.accountPassword : '••••••••'}</span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(r.orderId)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(r.orderId)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition flex items-center gap-1 ${
                            r.status === 'Selesai'
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-400'
                              : 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-400'
                          }`}
                          title="Klik untuk ubah status (otomatis update ke Data Joki Terakhir)"
                        >
                          {r.status === 'Selesai' ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <Clock className="w-3 h-3" />
                          )}
                          <span>{r.status}</span>
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="p-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyRow(r)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                            title="Salin baris ini untuk di-paste langsung (Ctrl+V) ke Google Sheets"
                          >
                            {isRowCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(r.orderId)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition"
                            title="Hapus record pesanan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs border-t border-slate-200 dark:border-slate-800">
          <p className="text-slate-500 text-[11px] text-center sm:text-left">
            💡 <strong>Tips:</strong> Tombol <strong>"Download (.CSV)"</strong> menghasilkan file spreadsheet standar yang langsung bisa Anda upload ke Google Drive Ben Balfas Aset.
          </p>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold transition"
          >
            Tutup Panel
          </button>
        </div>
      </div>
    </div>
  );
};

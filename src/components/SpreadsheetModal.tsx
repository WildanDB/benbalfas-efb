import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Phone,
  Send,
  Bot,
  Settings,
  Database,
  Flame,
  Search,
  Filter,
  RotateCcw,
  Sparkles,
  CreditCard,
  Gamepad2,
  KeyRound,
  FileText,
} from 'lucide-react';
import {
  SpreadsheetOrderRecord,
  getSpreadsheetRecords,
  exportSpreadsheetToCsv,
  copySpreadsheetRowToClipboard,
  getActiveTelegramConfig,
  testTelegramNotification,
} from '../utils/spreadsheet';
import {
  getActiveFirebaseConfig,
  saveFirebaseConfig,
  testFirebaseConnection,
  subscribeToCloudOrders,
  updateOrderStatusCloud,
  deleteOrderFromCloud,
  saveRecentJokisCloud,
  resetPromoSlotsCloud,
  resetReferralSlotsCloud,
  FirebaseConfig,
  isFirebaseConfigured,
} from '../services/firebase';
import {
  formatRupiah,
  getPromoStatus,
  resetPromoSlots,
  getReferralStatus,
  resetReferralSlots,
} from '../utils/pricing';

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
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Sedang Proses' | 'Selesai'>('all');

  // Telegram Settings State
  const [telegramTokenInput, setTelegramTokenInput] = useState('');
  const [telegramChatIdInput, setTelegramChatIdInput] = useState('');
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  // Firebase Real-time Cloud Settings
  const [firebaseApiKeyInput, setFirebaseApiKeyInput] = useState('');
  const [firebaseProjectIdInput, setFirebaseProjectIdInput] = useState('');
  const [firebaseAuthDomainInput, setFirebaseAuthDomainInput] = useState('');
  const [firebaseSnippetInput, setFirebaseSnippetInput] = useState('');
  const [isTestingFirebase, setIsTestingFirebase] = useState(false);
  const [firebaseTestResult, setFirebaseTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isCloudSyncActive, setIsCloudSyncActive] = useState(false);

  // Promo & Referral Status
  const [promoInfo, setPromoInfo] = useState(getPromoStatus);
  const [referralInfo, setReferralInfo] = useState(getReferralStatus);

  const handleParseFirebaseSnippet = (snippet: string) => {
    setFirebaseSnippetInput(snippet);
    if (!snippet) return;
    try {
      const apiKeyMatch = snippet.match(/apiKey:\s*["']([^"']+)["']/);
      const projectIdMatch = snippet.match(/projectId:\s*["']([^"']+)["']/);
      const authDomainMatch = snippet.match(/authDomain:\s*["']([^"']+)["']/);

      if (apiKeyMatch) setFirebaseApiKeyInput(apiKeyMatch[1]);
      if (projectIdMatch) setFirebaseProjectIdInput(projectIdMatch[1]);
      if (authDomainMatch) setFirebaseAuthDomainInput(authDomainMatch[1]);
    } catch {}
  };

  const loadData = () => {
    setRecords(getSpreadsheetRecords());
    const tel = getActiveTelegramConfig();
    setTelegramTokenInput(tel.botToken);
    setTelegramChatIdInput(tel.chatId);

    const fb = getActiveFirebaseConfig();
    if (fb && fb.apiKey && fb.projectId) {
      setFirebaseApiKeyInput(fb.apiKey || '');
      setFirebaseProjectIdInput(fb.projectId || '');
      setFirebaseAuthDomainInput(fb.authDomain || '');
      setIsCloudSyncActive(true);
    } else {
      setIsCloudSyncActive(false);
    }

    setPromoInfo(getPromoStatus());
    setReferralInfo(getReferralStatus());
  };

  useEffect(() => {
    // 1. Realtime Listener untuk koleksi 'orders' langsung dari Firebase Firestore
    const unsubCloudOrders = subscribeToCloudOrders((cloudOrders) => {
      if (Array.isArray(cloudOrders)) {
        setRecords(cloudOrders);
        localStorage.setItem('benbalfas_spreadsheet_records', JSON.stringify(cloudOrders));
      }
    });

    return () => {
      if (unsubCloudOrders) unsubCloudOrders();
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadData();
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

  const handleSaveCloudSettings = () => {
    localStorage.setItem('benbalfas_telegram_bot_token', telegramTokenInput.trim());
    localStorage.setItem('benbalfas_telegram_chat_id', telegramChatIdInput.trim());

    if (firebaseApiKeyInput.trim() && firebaseProjectIdInput.trim()) {
      saveFirebaseConfig({
        apiKey: firebaseApiKeyInput.trim(),
        projectId: firebaseProjectIdInput.trim(),
        authDomain: firebaseAuthDomainInput.trim() || `${firebaseProjectIdInput.trim()}.firebaseapp.com`,
      });
      setIsCloudSyncActive(true);
    }

    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 3000);
  };

  const handleTestFirebase = async () => {
    setIsTestingFirebase(true);
    setFirebaseTestResult(null);
    try {
      const configToTest: FirebaseConfig = {
        apiKey: firebaseApiKeyInput.trim(),
        projectId: firebaseProjectIdInput.trim(),
        authDomain: firebaseAuthDomainInput.trim() || `${firebaseProjectIdInput.trim()}.firebaseapp.com`,
      };
      const res = await testFirebaseConnection(configToTest);
      setFirebaseTestResult(res);
      if (res.success) {
        saveFirebaseConfig(configToTest);
        setIsCloudSyncActive(true);
      }
    } catch (err: any) {
      setFirebaseTestResult({
        success: false,
        message: 'Terjadi kesalahan saat menguji koneksi: ' + (err.message || String(err)),
      });
    } finally {
      setIsTestingFirebase(false);
    }
  };

  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    setTelegramTestResult(null);
    try {
      const res = await testTelegramNotification(telegramTokenInput.trim(), telegramChatIdInput.trim());
      setTelegramTestResult(res);
    } catch (err: any) {
      setTelegramTestResult({
        success: false,
        message: 'Gagal menguji Telegram: ' + (err.message || String(err)),
      });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleResetPromoClick = async () => {
    if (confirm('Kembalikan kuota Promo 3 Klien Pertama ke 3 slot penuh di Firebase Cloud?')) {
      resetPromoSlots();
      await resetPromoSlotsCloud().catch(() => {});
      setPromoInfo(getPromoStatus());
      alert('Kuota promo berhasil di-reset menjadi 3 slot penuh di seluruh device!');
    }
  };

  const handleResetReferralClick = async () => {
    if (confirm('Kembalikan kuota Kode Referral "jack efo" ke 5 slot penuh di Firebase Cloud?')) {
      resetReferralSlots();
      await resetReferralSlotsCloud().catch(() => {});
      setReferralInfo(getReferralStatus());
      alert('Kuota kode referral berhasil di-reset menjadi 5 slot penuh di seluruh device!');
    }
  };

  const handleToggleStatus = (orderId: string) => {
    let nextStatus: 'Sedang Proses' | 'Selesai' = 'Selesai';
    const updated = records.map((r) => {
      if (r.orderId === orderId) {
        nextStatus = r.status === 'Sedang Proses' ? 'Selesai' : 'Sedang Proses';
        return { ...r, status: nextStatus };
      }
      return r;
    });

    setRecords(updated);
    localStorage.setItem('benbalfas_spreadsheet_records', JSON.stringify(updated));

    // Sinkronisasikan status pesanan langsung ke Firebase Cloud Firestore
    updateOrderStatusCloud(orderId, nextStatus).catch(() => {});

    // Perbarui juga data joki terakhir jika pesanan ini ada di etalase
    try {
      const rawJokis = localStorage.getItem('benbalfas_recent_jokis');
      if (rawJokis) {
        const jokis = JSON.parse(rawJokis);
        const updatedJokis = jokis.map((j: any) => {
          if (j.id === 'rj-' + orderId) {
            return {
              ...j,
              status: nextStatus,
              completedAt: nextStatus === 'Selesai' ? (j.completedAt || new Date().toISOString()) : j.completedAt,
              date: nextStatus === 'Selesai' ? 'Hari Ini' : j.date,
            };
          }
          return j;
        }).slice(0, 10);
        localStorage.setItem('benbalfas_recent_jokis', JSON.stringify(updatedJokis));
        window.dispatchEvent(
          new CustomEvent('benbalfas_recent_jokis_updated', { detail: updatedJokis })
        );
        saveRecentJokisCloud(updatedJokis).catch(() => {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRecord = (orderId: string) => {
    if (confirm('Hapus pesanan ini secara permanen dari Database Cloud & Lokal?')) {
      const filtered = records.filter((r) => r.orderId !== orderId);
      setRecords(filtered);
      localStorage.setItem('benbalfas_spreadsheet_records', JSON.stringify(filtered));

      // Hapus dari Firebase Cloud Firestore
      deleteOrderFromCloud(orderId).catch(() => {});

      // Hapus juga dari Data Joki Terakhir jika ada
      try {
        const rawJokis = localStorage.getItem('benbalfas_recent_jokis');
        if (rawJokis) {
          const jokis = JSON.parse(rawJokis);
          const updatedJokis = jokis.filter((j: any) => j.id !== 'rj-' + orderId).slice(0, 10);
          localStorage.setItem('benbalfas_recent_jokis', JSON.stringify(updatedJokis));
          window.dispatchEvent(
            new CustomEvent('benbalfas_recent_jokis_updated', { detail: updatedJokis })
          );
          saveRecentJokisCloud(updatedJokis).catch(() => {});
        }
      } catch {}
    }
  };

  // Filtered Records
  const filteredRecords = records.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchesStatus;
    const matchesSearch =
      (r.clientName || '').toLowerCase().includes(query) ||
      (r.whatsappNumber || '').includes(query) ||
      (r.orderId || '').toLowerCase().includes(query) ||
      (r.orderDescription || '').toLowerCase().includes(query) ||
      (r.accountUsername || '').toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  const pendingCount = records.filter((r) => r.status === 'Sedang Proses').length;
  const completedCount = records.filter((r) => r.status === 'Selesai').length;
  const totalRevenue = records.reduce((acc, r) => acc + (r.finalPrice || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-cyan-500/40 rounded-3xl max-w-6xl w-full p-5 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto shadow-2xl relative my-auto">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isCloudSyncActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
              <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 uppercase font-bold tracking-wider">
                Panel Owner & Database Cloud
              </span>
              {isCloudSyncActive ? (
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1.5 font-mono">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Firebase Real-time: AKTIF (Semua Device Terhubung)</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 text-[10px] font-bold border border-amber-500/30 flex items-center gap-1 font-mono">
                  <span>Mode Lokal (Belum Terhubung ke Firebase)</span>
                </span>
              )}
            </div>

            <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1 flex items-center gap-2">
              <Database className="w-7 h-7 text-cyan-500" />
              <span>Database Pesanan & Kontrol Cloud</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tercatat otomatis di Cloud Firestore setiap kali ada checkout • Real-time sinkron ke etalase & seluruh device
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportSpreadsheetToCsv(records)}
              disabled={records.length === 0}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="Download seluruh data pesanan ke file CSV / Excel"
            >
              <Download className="w-4 h-4" />
              <span>Download (.CSV)</span>
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border cursor-pointer ${
                showSettings
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-extrabold'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
              }`}
            >
              <Settings className="w-4 h-4 text-cyan-500" />
              <span>Pengaturan Cloud & Bot</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cloud & Bot Settings Center */}
        {showSettings && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-cyan-500/30 space-y-4 animate-fadeIn text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-500" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  Pusat Konfigurasi Cloud Database & Notifikasi Bot
                </span>
              </div>
              <div className="flex items-center gap-2">
                {savedSettingsNotice && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1 animate-pulse">
                    <CheckCircle2 className="w-4 h-4" /> Pengaturan Tersimpan!
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveCloudSettings}
                  className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-sm transition cursor-pointer"
                >
                  Simpan Semua Pengaturan
                </button>
              </div>
            </div>

            {/* Grid 2 Kolom: Firebase Database & Telegram Bot */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Kolom 1: Firebase Cloud Real-Time Database */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>1. Google Firebase Cloud Database</span>
                  </div>
                  {isCloudSyncActive ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Terhubung (100% Gratis)</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/30">
                      Belum Terhubung
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Database Firestore menghubungkan website Anda di semua device secara real-time. Setiap pesanan masuk, slot promo terpakai, atau pembaruan joki otomatis tersinkron seketika.
                </p>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                      Tempel Kode Config dari Firebase Console (Auto-Detect):
                    </label>
                    <textarea
                      rows={2}
                      value={firebaseSnippetInput}
                      onChange={(e) => handleParseFirebaseSnippet(e.target.value)}
                      placeholder='const firebaseConfig = { apiKey: "AIza...", projectId: "benbalfas..." };'
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-[11px] text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                        Firebase API Key:
                      </label>
                      <input
                        type="text"
                        value={firebaseApiKeyInput}
                        onChange={(e) => setFirebaseApiKeyInput(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                        Firebase Project ID:
                      </label>
                      <input
                        type="text"
                        value={firebaseProjectIdInput}
                        onChange={(e) => setFirebaseProjectIdInput(e.target.value)}
                        placeholder="benbalfas-efootball"
                        className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTestFirebase}
                      disabled={isTestingFirebase || !firebaseApiKeyInput || !firebaseProjectIdInput}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                    >
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>{isTestingFirebase ? 'Menguji Koneksi...' : '🧪 Tes Koneksi Firebase'}</span>
                    </button>
                    <a
                      href="https://console.firebase.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 dark:text-cyan-400 hover:underline text-[11px] inline-flex items-center gap-1"
                    >
                      <span>Buka Console</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    50k Reads / 20k Writes Gratis per Hari
                  </span>
                </div>

                {firebaseTestResult && (
                  <div
                    className={`p-2.5 rounded-lg text-[11px] font-medium border whitespace-pre-line leading-relaxed ${
                      firebaseTestResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {firebaseTestResult.message}
                  </div>
                )}

                {/* Quick Cloud Reset Actions for Owner */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Kontrol Kuota Cloud Langsung:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetPromoClick}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 text-[11px] font-bold border border-amber-500/30 flex items-center gap-1 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Promo ({promoInfo.remainingSlots}/3 Slot Tersedia)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleResetReferralClick}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-600 dark:text-cyan-400 text-[11px] font-bold border border-cyan-500/30 flex items-center gap-1 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Referral ({referralInfo.remainingSlots}/5 Slot Tersedia)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Kolom 2: Bot Notifikasi Telegram Admin */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                    <Bot className="w-4 h-4 text-cyan-500" />
                    <span>2. Notifikasi Bot Telegram Admin</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-500/20">
                    Instan Alert Order
                  </span>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Cara Mendapatkan Bot Token & Chat ID Telegram:
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                    <li>Buka <strong>@BotFather</strong> di Telegram ➔ ketik <code>/newbot</code> ➔ Salin Token API.</li>
                    <li>Buka <strong>@userinfobot</strong> di Telegram ➔ klik Start ➔ Salin nomor <strong>Id</strong> Anda.</li>
                    <li>Buka bot yang baru dibuat ➔ klik <strong>Start</strong> agar bot berhak kirim notifikasi ke Anda!</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                      Telegram Bot Token:
                    </label>
                    <input
                      type="text"
                      value={telegramTokenInput}
                      onChange={(e) => setTelegramTokenInput(e.target.value)}
                      placeholder="Contoh: 7123456789:AAHxyz..."
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                      Telegram Admin Chat ID:
                    </label>
                    <input
                      type="text"
                      value={telegramChatIdInput}
                      onChange={(e) => setTelegramChatIdInput(e.target.value)}
                      placeholder="Contoh: 1234567890"
                      className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTestTelegram}
                    disabled={isTestingTelegram || !telegramTokenInput || !telegramChatIdInput}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isTestingTelegram ? 'Menguji...' : '🧪 Tes Notif Telegram'}</span>
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">Anti-Gagal (HTML & Plain Fallback)</span>
                </div>

                {telegramTestResult && (
                  <div
                    className={`p-2 rounded-lg text-[11px] font-medium border ${
                      telegramTestResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {telegramTestResult.message}
                  </div>
                )}
              </div>

            </div>
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
              {pendingCount} Pesanan
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 text-[11px]">Selesai (Tuntas):</span>
            <p className="font-mono font-black text-lg text-emerald-600 dark:text-emerald-400 mt-0.5">
              {completedCount} Pesanan
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 text-[11px]">Total Omzet Masuk:</span>
            <p className="font-mono font-black text-lg text-cyan-600 dark:text-cyan-400 mt-0.5">
              {formatRupiah(totalRevenue)}
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama klien, WhatsApp, ID, paket, atau username..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Semua ({records.length})
            </button>
            <button
              onClick={() => setStatusFilter('Sedang Proses')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === 'Sedang Proses'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Sedang Proses ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('Selesai')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                statusFilter === 'Selesai'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Selesai ({completedCount})
            </button>
          </div>
        </div>

        {/* Table View of Cloud Orders */}
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <Database className="w-12 h-12 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                {records.length === 0
                  ? 'Belum Ada Record Pesanan Masuk di Database Cloud'
                  : 'Tidak Ada Pesanan yang Sesuai dengan Filter'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {records.length === 0
                  ? 'Setiap ada klien yang mengisi form checkout di HP/laptop mereka, baris data akan langsung muncul di sini secara real-time dan masuk ke etalase.'
                  : 'Coba ubah kata kunci pencarian atau ubah filter status di atas.'}
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
                {filteredRecords.map((r) => {
                  const isPassVisible = showPasswordMap[r.orderId];
                  const isRowCopied = copiedId === r.orderId;
                  const waClean = (r.whatsappNumber || '').replace(/\D/g, '');
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
                          {r.duration} • {r.paymentMethod || 'QRIS'}
                        </p>
                      </td>

                      {/* Poin Awal ➔ Target */}
                      <td className="p-3 whitespace-nowrap">
                        {r.orderType === 'points' || r.initialRating ? (
                          <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">
                            {r.initialRating || '-'} ➔ {r.targetRating || '-'}
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold">
                            Paket Instan / Weekend
                          </span>
                        )}
                      </td>

                      {/* Total Bayar */}
                      <td className="p-3 whitespace-nowrap">
                        <p className="font-bold text-cyan-600 dark:text-cyan-400 text-xs">
                          {formatRupiah(r.finalPrice)}
                        </p>
                        {r.discountPercent > 0 && (
                          <p className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">
                            Diskon {r.discountPercent}%
                          </p>
                        )}
                        {r.referralCode && (
                          <p className="text-[9px] text-purple-600 dark:text-purple-400 font-bold">
                            Ref: {r.referralCode}
                          </p>
                        )}
                      </td>

                      {/* Akun Game */}
                      <td className="p-3 whitespace-nowrap text-xs">
                        <div className="space-y-0.5">
                          <p className="text-[11px] text-slate-700 dark:text-slate-300">
                            <span className="text-slate-500">User:</span> <strong>{r.accountUsername || '-'}</strong>
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 text-[10px]">Pass:</span>
                            <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200">
                              {isPassVisible ? r.accountPassword : '••••••••'}
                            </span>
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(r.orderId)}
                              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                              title={isPassVisible ? 'Sembunyikan' : 'Lihat'}
                            >
                              {isPassVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Status Joki */}
                      <td className="p-3 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(r.orderId)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition cursor-pointer ${
                            r.status === 'Selesai'
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                          }`}
                          title="Klik untuk ubah status Sedang Proses ➔ Selesai"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              r.status === 'Selesai' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'
                            }`}
                          ></span>
                          <span>{r.status}</span>
                        </button>
                      </td>

                      {/* Aksi */}
                      <td className="p-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyRow(r)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                            title="Salin baris pesanan ini"
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
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition cursor-pointer"
                            title="Hapus baris pesanan ini dari Cloud & Lokal"
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

      </div>
    </div>
  );
};

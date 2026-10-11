import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Zap,
  Trophy,
  ArrowRight,
  Star,
  Flame,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  Table,
  LayoutGrid,
} from "lucide-react";
import { RecentJoki, GamingPlatform } from "../types";
import { INITIAL_RECENT_JOKIS } from "../data/mockData";
import {
  subscribeToCloudRecentJokis,
  saveRecentJokisCloud,
  updateOrderStatusCloud,
} from "../services/firebase";
import { formatRelativeJokiDate, ensureJokiCompletedAt } from "../utils/pricing";

interface HeroSectionProps {
  onNavigateToJoki: () => void;
  onNavigateToTrophy: () => void;
  onOpenCheckout: (
    type?: "points" | "package",
    packageId?: string,
    pointsData?: any,
    platform?: GamingPlatform,
  ) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigateToJoki,
  onNavigateToTrophy,
  onOpenCheckout,
}) => {
  // Check if owner activated secret admin mode via URL (?admin=benbalfas) or localStorage
  const [isAdmin, setIsAdmin] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "benbalfas") {
      localStorage.setItem("benbalfas_is_admin", "true");
      setIsAdmin(true);
    } else if (localStorage.getItem("benbalfas_is_admin") === "true") {
      setIsAdmin(true);
    }
  }, []);

  // Recent Joki Data State (Dibatasi Maksimal 10 Joki Terakhir)
  const [recentJokis, setRecentJokis] = useState<RecentJoki[]>(() => {
    if (typeof window === "undefined") {
      return INITIAL_RECENT_JOKIS.slice(0, 10).map(ensureJokiCompletedAt);
    }
    const saved = localStorage.getItem("benbalfas_recent_jokis");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 10).map(ensureJokiCompletedAt);
        }
      } catch {}
    }
    return INITIAL_RECENT_JOKIS.slice(0, 10).map(ensureJokiCompletedAt);
  });

  // Real-time listener: Otomatis perbarui Data Joki Terakhir (Cloud Firebase & Local Storage)
  useEffect(() => {
    // 1. Firebase Cloud Realtime Listener (Update di semua device seketika, maks 10)
    const unsubCloud = subscribeToCloudRecentJokis((cloudJokis) => {
      if (Array.isArray(cloudJokis) && cloudJokis.length > 0) {
        const sanitized = cloudJokis.slice(0, 10).map(ensureJokiCompletedAt);
        setRecentJokis(sanitized);
        localStorage.setItem("benbalfas_recent_jokis", JSON.stringify(sanitized));
      }
    });

    // 2. Local Custom Event & Storage Listener
    const handleRecentJokisUpdated = (event: any) => {
      if (event.detail && Array.isArray(event.detail)) {
        const sanitized = event.detail.slice(0, 10).map(ensureJokiCompletedAt);
        setRecentJokis(sanitized);
        setActiveJokiIndex(0);
      } else {
        const saved = localStorage.getItem("benbalfas_recent_jokis");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const sanitized = parsed.slice(0, 10).map(ensureJokiCompletedAt);
              setRecentJokis(sanitized);
              setActiveJokiIndex(0);
            }
          } catch {}
        }
      }
    };

    window.addEventListener("benbalfas_recent_jokis_updated", handleRecentJokisUpdated);
    window.addEventListener("storage", handleRecentJokisUpdated);

    // Refresh perhitungan waktu relatif setiap 15 menit agar saat berganti hari jam 00:00 otomatis update
    const timer = setInterval(() => {
      setRecentJokis((prev) => prev.slice(0, 10).map(ensureJokiCompletedAt));
    }, 15 * 60 * 1000);

    return () => {
      if (unsubCloud) unsubCloud();
      window.removeEventListener("benbalfas_recent_jokis_updated", handleRecentJokisUpdated);
      window.removeEventListener("storage", handleRecentJokisUpdated);
      clearInterval(timer);
    };
  }, []);

  const displayedJokis = recentJokis.slice(0, 10);
  const [activeJokiIndex, setActiveJokiIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'update'>('create');
  const [editingJokiId, setEditingJokiId] = useState<string | null>(null);

  const [newJokiForm, setNewJokiForm] = useState({
    clientName: "Klien Baru (Kota)",
    packageName: "Paket Event Weekend (italy, POTW, dll)",
    initialRating: 1400,
    targetRating: 1850,
    status: "Sedang Proses" as "Selesai" | "Sedang Proses",
    duration: "4 Jam",
    date: "Hari Ini",
    completedAt: new Date().toISOString(),
    winStreak: 6,
    platform: "steam" as GamingPlatform,
    recordType: "wdl" as "points" | "wdl",
    win: 5,
    draw: 0,
    loss: 0,
  });

  const currentJoki =
    displayedJokis[activeJokiIndex] || displayedJokis[0] || INITIAL_RECENT_JOKIS[0];

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingJokiId(null);
    const nowIso = new Date().toISOString();
    setNewJokiForm({
      clientName: "Klien Baru (Kota)",
      packageName: "Paket Divisi 1 (Road to D1)",
      initialRating: 1400,
      targetRating: 1850,
      status: "Sedang Proses",
      duration: "1 Hari",
      date: "Hari Ini",
      completedAt: nowIso,
      winStreak: 6,
      platform: "steam",
      recordType: "points",
      win: 5,
      draw: 0,
      loss: 0,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenUpdateModal = (joki: RecentJoki = currentJoki) => {
    setModalMode('update');
    setEditingJokiId(joki.id);
    const isWdl = joki.recordType === 'wdl' || !!joki.wdlRecord;
    const completedTimestamp = joki.completedAt || new Date().toISOString();
    setNewJokiForm({
      clientName: joki.clientName || "",
      packageName: joki.packageName || "",
      initialRating: joki.initialRating ?? 1400,
      targetRating: joki.targetRating ?? 1850,
      status: joki.status || "Sedang Proses",
      duration: joki.duration || "1 Hari",
      date: formatRelativeJokiDate(joki.date, completedTimestamp),
      completedAt: completedTimestamp,
      winStreak: joki.winStreak ?? 6,
      platform: joki.platform || "steam",
      recordType: isWdl ? "wdl" : "points",
      win: joki.wdlRecord?.win ?? (joki.winStreak || 0),
      draw: joki.wdlRecord?.draw ?? 0,
      loss: joki.wdlRecord?.loss ?? 0,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveRecentJoki = (e: React.FormEvent) => {
    e.preventDefault();
    const isWdl = newJokiForm.recordType === 'wdl' || newJokiForm.packageName.toLowerCase().includes('weekend');

    if (modalMode === 'update' && editingJokiId) {
      const updated = recentJokis.map((item) => {
        if (item.id === editingJokiId) {
          const completedTimestamp =
            newJokiForm.status === 'Selesai' && item.status !== 'Selesai'
              ? new Date().toISOString()
              : (newJokiForm.completedAt || item.completedAt || new Date().toISOString());

          return {
            ...item,
            clientName: newJokiForm.clientName || item.clientName,
            packageName: newJokiForm.packageName || item.packageName,
            status: newJokiForm.status,
            duration: newJokiForm.duration,
            platform: newJokiForm.platform,
            completedAt: completedTimestamp,
            date: formatRelativeJokiDate(newJokiForm.date, completedTimestamp),
            winStreak: Number(newJokiForm.winStreak) || (isWdl ? Number(newJokiForm.win) || item.winStreak : item.winStreak),
            recordType: isWdl ? ('wdl' as const) : ('points' as const),
            initialRating: isWdl ? undefined : Number(newJokiForm.initialRating) || 1400,
            targetRating: isWdl ? undefined : Number(newJokiForm.targetRating) || 1850,
            wdlRecord: isWdl ? {
              win: Number(newJokiForm.win) || 0,
              draw: Number(newJokiForm.draw) || 0,
              loss: Number(newJokiForm.loss) || 0,
            } : undefined,
          };
        }
        return item;
      }).slice(0, 10);

      setRecentJokis(updated);
      localStorage.setItem("benbalfas_recent_jokis", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('benbalfas_recent_jokis_updated', { detail: updated }));
      // Push ke Firebase Cloud Realtime
      saveRecentJokisCloud(updated).catch(() => {});

      // Sinkronisasikan juga ke Database pesanan jika ada ID pesanan yang cocok
      const cleanOrderId = editingJokiId.replace("rj-", "");
      if (newJokiForm.status) {
        updateOrderStatusCloud(cleanOrderId, newJokiForm.status as any).catch(() => {});
      }

      try {
        const rawSpreadsheet = localStorage.getItem("benbalfas_spreadsheet_records");
        if (rawSpreadsheet) {
          const sheetRecords = JSON.parse(rawSpreadsheet);
          const updatedSheets = sheetRecords.map((sr: any) => {
            if (sr.orderId === cleanOrderId || sr.clientName === newJokiForm.clientName) {
              return {
                ...sr,
                status: newJokiForm.status,
                initialRating: isWdl ? sr.initialRating : Number(newJokiForm.initialRating),
                targetRating: isWdl ? sr.targetRating : Number(newJokiForm.targetRating),
                duration: newJokiForm.duration,
              };
            }
            return sr;
          });
          localStorage.setItem("benbalfas_spreadsheet_records", JSON.stringify(updatedSheets));
        }
      } catch {}

      setIsEditModalOpen(false);
    } else {
      // Create new joki
      const nowIso = new Date().toISOString();
      const created: RecentJoki = {
        id: "rj-" + Date.now(),
        clientName: newJokiForm.clientName || "Klien Baru",
        packageName: newJokiForm.packageName || (isWdl ? "Paket Event Weekend" : "Paket Divisi 1"),
        status: (newJokiForm.status as "Selesai" | "Sedang Proses") || "Sedang Proses",
        duration: newJokiForm.duration || "1 Hari",
        completedAt: nowIso,
        createdAt: nowIso,
        date: formatRelativeJokiDate(newJokiForm.date, nowIso),
        winStreak: Number(newJokiForm.winStreak) || (isWdl ? Number(newJokiForm.win) || 5 : 12),
        platform: (newJokiForm.platform as GamingPlatform) || "steam",
        recordType: isWdl ? 'wdl' : 'points',
        initialRating: isWdl ? undefined : Number(newJokiForm.initialRating) || 1400,
        targetRating: isWdl ? undefined : Number(newJokiForm.targetRating) || 1850,
        wdlRecord: isWdl ? {
          win: Number(newJokiForm.win) || 0,
          draw: Number(newJokiForm.draw) || 0,
          loss: Number(newJokiForm.loss) || 0,
        } : undefined,
      };
      const updated = [created, ...recentJokis].slice(0, 10);
      setRecentJokis(updated);
      localStorage.setItem("benbalfas_recent_jokis", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('benbalfas_recent_jokis_updated', { detail: updated }));
      // Push ke Firebase Cloud Realtime
      saveRecentJokisCloud(updated).catch(() => {});
      setIsEditModalOpen(false);
      setActiveJokiIndex(0);
    }
  };

  const handleDeleteActiveJoki = (id: string) => {
    if (confirm('Hapus item joki ini dari etalase Data Joki Terakhir?')) {
      const updated = recentJokis.filter((j) => j.id !== id).slice(0, 10);
      const nextList = updated.length > 0 ? updated : INITIAL_RECENT_JOKIS.slice(0, 10).map(ensureJokiCompletedAt);
      setRecentJokis(nextList);
      localStorage.setItem("benbalfas_recent_jokis", JSON.stringify(nextList));
      window.dispatchEvent(new CustomEvent('benbalfas_recent_jokis_updated', { detail: nextList }));
      // Push ke Firebase Cloud Realtime
      saveRecentJokisCloud(nextList).catch(() => {});
      setActiveJokiIndex(0);
    }
  };

  return (
    <section className="relative overflow-hidden w-full max-w-full pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-16 lg:pb-24">
      {/* Authentic eFootball Stadium & Soccer Pitch Tactical Background Overlay */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden w-full max-w-full">
        {/* Stadium Light Cones */}
        <div className="absolute -top-24 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-cyan-500/15 dark:bg-cyan-500/15 rounded-full blur-[90px] sm:blur-[110px]"></div>
        <div className="absolute -top-20 right-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-indigo-500/15 dark:bg-purple-600/15 rounded-full blur-[90px] sm:blur-[110px]"></div>

        {/* eFootball Tactical Pitch Lines (Center Circle & Penalty Box Vector) */}
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl h-full opacity-15 dark:opacity-20 stroke-cyan-500/40 dark:stroke-cyan-400/40 fill-none"
          viewBox="0 0 1000 600"
        >
          {/* Outer Boundary */}
          <rect
            x="50"
            y="30"
            width="900"
            height="540"
            rx="10"
            strokeWidth="2"
            strokeDasharray="6 4"
          />
          {/* Halfway Line */}
          <line x1="500" y1="30" x2="500" y2="570" strokeWidth="2" />
          {/* Center Circle */}
          <circle cx="500" cy="300" r="110" strokeWidth="2" />
          <circle cx="500" cy="300" r="5" fill="currentColor" />
          {/* Left Penalty Area */}
          <rect x="50" y="150" width="160" height="300" strokeWidth="2" />
          <rect x="50" y="210" width="60" height="180" strokeWidth="2" />
          {/* Right Penalty Area */}
          <rect x="790" y="150" width="160" height="300" strokeWidth="2" />
          <rect x="890" y="210" width="60" height="180" strokeWidth="2" />
          {/* Corner Arcs */}
          <path d="M 50 60 A 30 30 0 0 1 80 30" strokeWidth="2" />
          <path d="M 50 540 A 30 30 0 0 0 80 570" strokeWidth="2" />
          <path d="M 950 60 A 30 30 0 0 0 920 30" strokeWidth="2" />
          <path d="M 950 540 A 30 30 0 0 1 920 570" strokeWidth="2" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full min-w-0 max-w-full">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full min-w-0 max-w-full">
          {/* Left Column: High-Converting Copywriting */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left w-full min-w-0 max-w-full">
            {/* Top Badge: eFootball Platform Support */}
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-xs sm:text-sm font-bold shadow-sm max-w-full">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span className="truncate">eFootball 2026 Joki Service</span>
              </span>
              <span className="hidden sm:inline text-slate-400">•</span>
              <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-mono text-slate-600 dark:text-slate-300">
                🎮 Steam • PlayStation • Xbox
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3 sm:space-y-4">
              <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight leading-[1.15] break-words">
                Capek Dikerjain{" "}
                <span className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Script?
                </span>
                . <br className="hidden sm:inline" />
                Biar Kita yang{" "}
                <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Push Akun Kamu ke Divisi 1
                </span>
                .
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Mau rank naik tinggi tapi malas capek grinding atau kesal kena
                script game? Percayakan pada Benbalfas.
                <strong className="text-slate-900 dark:text-white">
                  {" "}
                  100% Murni Skill Mekanik Pro Player
                </strong>
                , akun dijamin aman tanpa risiko banned, dan harga paling ramah
                kantong dijamin tuntas!
              </p>
            </div>

            {/* Platform Quick Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1.5 sm:gap-2 pt-1">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
                Platform Tersedia:
              </span>
              <span className="px-2.5 sm:px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] sm:text-xs font-mono font-bold text-slate-800 dark:text-slate-200 shadow-sm">
                💻 Steam (PC)
              </span>
              <span className="px-2.5 sm:px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] sm:text-xs font-mono font-bold text-blue-600 dark:text-blue-400 shadow-sm">
                🎮 PlayStation (PS4/PS5)
              </span>
              <span className="px-2.5 sm:px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[11px] sm:text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shadow-sm">
                🟢 Xbox One / Series
              </span>
            </div>

            {/* Quick Trust Pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2 sm:gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold">
              <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                <span className="text-[11px] sm:text-xs">Garansi Anti-Banned & IP Lokal</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span className="text-[11px] sm:text-xs">Harga Transparan Mulai 700/pt</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 shrink-0" />
                <span className="text-[11px] sm:text-xs">Handover OTP WhatsApp Cepat</span>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <button
                onClick={onNavigateToJoki}
                className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display font-extrabold text-sm sm:text-base rounded-2xl shadow-glow-cyan transform hover:-translate-y-0.5 active:translate-y-0 transition flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" />
                <span>Hitung Harga Joki (Kalkulator)</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              </button>

              <button
                onClick={onNavigateToTrophy}
                className="w-full sm:w-auto px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm sm:text-base rounded-2xl border border-slate-200 dark:border-slate-700/80 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
                <span>Lihat Bukti Portofolio</span>
              </button>
            </div>

            {/* Trust Rating Strip */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 text-center sm:text-left">
              <div className="flex -space-x-2 shrink-0">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=80&q=80",
                  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=80&q=80",
                ].map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Client avatar"
                    className="w-8 h-8 rounded-full border-2 border-white dark:border-[#080B10] object-cover"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-500 font-bold justify-center sm:justify-start">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                  <span className="text-slate-900 dark:text-white text-xs ml-1 font-mono">
                    4.9 / 5.0
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  Dipercaya RATUSAN pemain eFootball seluruh Indonesia dan
                  Malaysia
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: DATA JOKI TERAKHIR */}
          <div className="lg:col-span-5 w-full min-w-0 max-w-full">
            <div className="relative w-full min-w-0 max-w-full">
              {/* Card Container with eFootball subtle border styling */}
              <div className="relative rounded-2xl sm:rounded-3xl p-0.5 sm:p-1 bg-gradient-to-b from-cyan-500/30 via-indigo-500/20 to-slate-300 dark:to-slate-800 shadow-xl dark:shadow-2xl w-full min-w-0 max-w-full">
                <div className="rounded-[18px] sm:rounded-[22px] bg-white dark:bg-[#0c121e] p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-5 border border-slate-200 dark:border-slate-800/60 backdrop-blur-md w-full min-w-0 max-w-full">
                  {/* Header: DATA JOKI TERAKHIR */}
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-3 sm:pb-4 gap-2 min-w-0">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl overflow-hidden border border-cyan-500/30 shadow-sm bg-slate-900 shrink-0">
                        <img
                          src="/images/logo/logo.webp"
                          alt="Benbalfas eFootball"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-display font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                            Data Joki Terakhir
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-500/30 font-mono shrink-0">
                            10 Terbaru
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium truncate">
                          Update Riwayat Pengerjaan Klien
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      {/* View Switcher: Kartu vs Tabel */}
                      <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => setViewMode("card")}
                          className={`px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                            viewMode === "card"
                              ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs"
                              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          }`}
                          title="Tampilan Kartu Interaktif"
                        >
                          <LayoutGrid className="w-3 h-3" />
                          <span>Kartu</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewMode("table")}
                          className={`px-2 py-1 rounded-md text-[10px] sm:text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                            viewMode === "table"
                              ? "bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-xs"
                              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                          }`}
                          title="Tampilan Tabel 10 Joki Terakhir"
                        >
                          <Table className="w-3 h-3" />
                          <span>Tabel</span>
                        </button>
                      </div>

                      {/* Owner Action Buttons: Update Joki Aktif, Tambah Baru, Hapus */}
                      {isAdmin && (
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Tombol UPDATE Joki Aktif */}
                          <button
                            onClick={() => handleOpenUpdateModal(currentJoki)}
                            className="p-1 px-2 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] sm:text-[11px] font-bold flex items-center gap-1 border border-amber-500/30 shrink-0 hover:bg-amber-500/30 transition cursor-pointer"
                            title="Update joki yang sedang aktif dipilih / dikerjakan"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span className="hidden sm:inline">Update</span>
                          </button>

                          {/* Tombol TAMBAH Joki Baru */}
                          <button
                            onClick={handleOpenCreateModal}
                            className="p-1 px-2 rounded-lg bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-[10px] sm:text-[11px] font-bold flex items-center gap-1 border border-cyan-500/30 shrink-0 hover:bg-cyan-500/30 transition cursor-pointer"
                            title="Tambah data joki baru ke etalase"
                          >
                            <span>+ Tambah</span>
                          </button>

                          {/* Tombol HAPUS */}
                          {recentJokis.length > 1 && (
                            <button
                              onClick={() => handleDeleteActiveJoki(currentJoki.id)}
                              className="p-1 px-1.5 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold flex items-center gap-1 border border-rose-500/30 shrink-0 hover:bg-rose-500/30 transition cursor-pointer"
                              title="Hapus data joki ini dari etalase"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* KONTEN: TAMPILAN TABEL ATAU KARTU */}
                  {viewMode === "table" ? (
                    /* ================= TABEL 10 JOKI TERAKHIR ================= */
                    <div className="w-full min-w-0 space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-0.5">
                        <span className="font-mono text-[11px] text-cyan-700 dark:text-cyan-300 font-bold">
                          📋 Tabel 10 Joki Terakhir (Auto Update)
                        </span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded font-mono font-bold text-slate-600 dark:text-slate-300">
                          {displayedJokis.length}/10 Data
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 shadow-inner max-h-[360px] overflow-y-auto scrollbar-thin">
                        <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 text-[10px] sm:text-[11px] uppercase font-mono tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                              <th className="py-2 px-2 font-bold text-center">#</th>
                              <th className="py-2 px-2.5 font-bold">Klien & Platform</th>
                              <th className="py-2 px-2.5 font-bold">Layanan / Skor</th>
                              <th className="py-2 px-2.5 font-bold whitespace-nowrap">Waktu</th>
                              <th className="py-2 px-2 font-bold text-center">Status</th>
                              {isAdmin && <th className="py-2 px-2 font-bold text-center">Aksi</th>}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                            {displayedJokis.map((item, idx) => {
                              const isWdl = item.recordType === 'wdl' || !!item.wdlRecord;
                              const relDate = formatRelativeJokiDate(item.date, item.completedAt);
                              const isCurrent = activeJokiIndex === idx;

                              return (
                                <tr
                                  key={item.id}
                                  onClick={() => setActiveJokiIndex(idx)}
                                  className={`hover:bg-cyan-500/10 transition cursor-pointer ${
                                    isCurrent ? "bg-cyan-500/15 dark:bg-cyan-500/20 font-medium" : ""
                                  }`}
                                >
                                  <td className="py-2 px-2 text-center font-mono font-bold text-slate-400">
                                    {idx + 1}
                                  </td>
                                  <td className="py-2 px-2.5 min-w-[110px]">
                                    <div className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                                      {item.clientName}
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                                      {item.platform || "STEAM"}
                                    </div>
                                  </td>
                                  <td className="py-2 px-2.5 min-w-[130px]">
                                    <div className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[140px]">
                                      {item.packageName}
                                    </div>
                                    <div className="text-[10px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                                      {isWdl ? (
                                        `W:${item.wdlRecord?.win ?? 0} D:${item.wdlRecord?.draw ?? 0} L:${item.wdlRecord?.loss ?? 0}`
                                      ) : (
                                        `${item.initialRating ?? '-'} ➔ ${item.targetRating ?? '-'} Pts`
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-2 px-2.5 whitespace-nowrap font-mono text-[11px] text-slate-700 dark:text-slate-200 font-semibold">
                                    {relDate}
                                  </td>
                                  <td className="py-2 px-2 text-center whitespace-nowrap">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold border inline-block ${
                                      item.status === 'Sedang Proses'
                                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 animate-pulse'
                                        : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                                    }`}>
                                      {item.status}
                                    </span>
                                  </td>
                                  {isAdmin && (
                                    <td className="py-2 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                                      <button
                                        onClick={() => handleOpenUpdateModal(item)}
                                        className="p-1 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/30 transition cursor-pointer"
                                        title="Edit data joki ini"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex justify-between items-center pt-1 text-[11px]">
                        <span className="text-slate-400 text-[10px]">
                          Klik baris untuk memilih joki
                        </span>
                        <button
                          type="button"
                          onClick={() => setViewMode("card")}
                          className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <LayoutGrid className="w-3 h-3" />
                          <span>Tampilan Kartu Detail &rarr;</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* ================= KARTU DETAIL INTERAKTIF ================= */
                    <div className="space-y-3">
                      {/* Active Joki Selector Tabs (Maks 10 Joki) */}
                      <div className="w-full min-w-0 max-w-full overflow-hidden">
                        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none w-full min-w-0">
                          {displayedJokis.map((item, idx) => (
                            <button
                              key={item.id}
                              onClick={() => setActiveJokiIndex(idx)}
                              className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-medium whitespace-nowrap transition shrink-0 cursor-pointer ${
                                activeJokiIndex === idx
                                  ? "bg-cyan-500 text-white font-bold shadow-sm"
                                  : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              }`}
                            >
                              {item.clientName.split(" ")[0]} ({formatRelativeJokiDate(item.date, item.completedAt)})
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Active Joki Showcase Card */}
                      <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 space-y-2.5 sm:space-y-3 w-full min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[55%] sm:max-w-none">
                            {currentJoki.clientName}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[10px] sm:text-[11px] font-mono px-2 py-0.5 rounded-md font-bold border shrink-0 ${
                              currentJoki.status === 'Sedang Proses'
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 animate-pulse'
                                : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            }`}>
                              {currentJoki.status} • {formatRelativeJokiDate(currentJoki.date, currentJoki.completedAt)}
                            </span>
                            {isAdmin && (
                              <button
                                onClick={() => handleOpenUpdateModal(currentJoki)}
                                className="p-1 px-2 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-500/30 hover:bg-amber-500/30 transition flex items-center gap-1 cursor-pointer"
                                title="Edit joki ini (skor, status, atau durasi)"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                                <span>Edit Ini</span>
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 min-w-0">
                          <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 truncate min-w-0">
                            {currentJoki.packageName}
                          </p>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold shrink-0">
                            {currentJoki.platform
                              ? currentJoki.platform.toUpperCase()
                              : "STEAM/CONSOLE"}
                          </span>
                        </div>

                        {/* Match Metric: W-D-L for Weekend Event OR Rating Points for Division */}
                        {currentJoki.recordType === 'wdl' || currentJoki.wdlRecord || !currentJoki.initialRating ? (
                          <div className="bg-white/70 dark:bg-slate-950/60 p-2 sm:p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 w-full min-w-0">
                            <div className="flex items-center justify-between mb-1.5 px-0.5">
                              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider">
                                Rekor Match (W - D - L)
                              </span>
                              <span className="text-[10px] font-mono text-slate-500">
                                Durasi: {currentJoki.duration}
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                <p className="text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                  WIN (MENANG)
                                </p>
                                <p className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                                  {currentJoki.wdlRecord?.win ?? currentJoki.winStreak ?? 0}
                                </p>
                              </div>
                              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                <p className="text-[9px] sm:text-[10px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                                  DRAW (SERI)
                                </p>
                                <p className="text-base sm:text-lg font-black font-mono text-amber-600 dark:text-amber-400">
                                  {currentJoki.wdlRecord?.draw ?? 0}
                                </p>
                              </div>
                              <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                                <p className="text-[9px] sm:text-[10px] font-bold text-rose-600 dark:text-rose-400 font-mono">
                                  LOSS (KALAH)
                                </p>
                                <p className="text-base sm:text-lg font-black font-mono text-rose-600 dark:text-rose-400">
                                  {currentJoki.wdlRecord?.loss ?? 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-3 items-center gap-1 sm:gap-2 pt-1 text-center bg-white/70 dark:bg-slate-950/60 p-2 sm:p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 w-full min-w-0">
                            {/* Initial Points */}
                            <div className="text-left min-w-0">
                              <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono uppercase tracking-wider truncate">
                                Poin Awal
                              </p>
                              <p className="text-sm sm:text-base md:text-lg font-bold font-mono text-slate-900 dark:text-slate-100 truncate">
                                {currentJoki.initialRating} <span className="text-[10px] font-normal text-slate-400">Pts</span>
                              </p>
                            </div>

                            {/* Middle Diff + Progress Bar */}
                            <div className="flex flex-col items-center justify-center px-0.5 min-w-0">
                              <span className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono whitespace-nowrap">
                                +{((currentJoki.targetRating || 0) - (currentJoki.initialRating || 0))} ⚡️
                              </span>
                              <div className="w-full max-w-[65px] sm:max-w-[85px] h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full my-1 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 w-full animate-pulse"></div>
                              </div>
                              <span className="text-[9px] sm:text-[10px] text-slate-500 font-mono truncate">
                                {currentJoki.duration}
                              </span>
                            </div>

                            {/* Target Points */}
                            <div className="text-right min-w-0">
                              <p className="text-[9px] sm:text-[10px] text-amber-500 font-mono uppercase tracking-wider truncate">
                                Hasil Akhir
                              </p>
                              <p className="text-sm sm:text-base md:text-lg font-bold font-mono text-amber-500 dark:text-amber-300 truncate">
                                {currentJoki.targetRating} <span className="text-[10px] font-normal">Pts</span>
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Quick link ke mode tabel */}
                        <div className="flex justify-end pt-0.5">
                          <button
                            type="button"
                            onClick={() => setViewMode("table")}
                            className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                          >
                            <Table className="w-3 h-3" />
                            <span>Lihat Tabel Lengkap (Maks 10 Joki Terakhir) &rarr;</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Highlight All-In Package Banner */}
                  <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full min-w-0">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-bold">
                        <span>⭐️ PAKET ALL-IN</span>
                        <span className="bg-amber-500 text-black text-[9px] px-1.5 py-0.5 rounded font-black shrink-0">
                          DISKON 10%
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                          PROMO 3 KLIEN
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                        Divisi 1 + Sapu Bersih Event
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400 line-through font-mono">
                          Rp 150.000
                        </span>
                        <span className="font-extrabold text-sm text-amber-600 dark:text-amber-400 font-mono">
                          Rp 135.000
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          (Hemat 15k)
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        onOpenCheckout("package", "sultan-phase-clear")
                      }
                      className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-display font-extrabold text-xs rounded-xl shadow-glow-gold hover:scale-105 transition text-center shrink-0 cursor-pointer"
                    >
                      Pesan Promo 135k
                    </button>
                  </div>

                  {/* Stats Footer */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1 text-center w-full min-w-0">
                    <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 min-w-0">
                      <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">Ban Rate</p>
                      <p className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono truncate">
                        0.00% (Aman)
                      </p>
                    </div>
                    <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 min-w-0">
                      <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">Tarif Mulai</p>
                      <p className="text-[11px] sm:text-xs font-bold text-cyan-600 dark:text-cyan-400 font-mono truncate">
                        Rp 700/pt
                      </p>
                    </div>
                    <div className="p-1.5 sm:p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 min-w-0">
                      <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">Success Rate</p>
                      <p className="text-[11px] sm:text-xs font-extrabold text-amber-600 font-mono truncate">
                        100%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Tambah / Update Data Joki Terakhir (Owner Only) */}
      {isAdmin && isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-700 rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-6 space-y-4 shadow-2xl text-xs max-h-[90vh] overflow-y-auto my-auto">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                  {modalMode === 'update'
                    ? `Update Progres Joki: ${newJokiForm.clientName}`
                    : 'Tambah Data Joki Baru'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {modalMode === 'update'
                    ? 'Ubah skor saat ini, perbarui W-D-L/poin, atau selesaikan status joki'
                    : 'Tambahkan data joki baru ke etalase Data Joki Terakhir'}
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRecentJoki} className="space-y-3">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  Nama Klien & Kota
                </label>
                <input
                  type="text"
                  required
                  value={newJokiForm.clientName}
                  onChange={(e) =>
                    setNewJokiForm({
                      ...newJokiForm,
                      clientName: e.target.value,
                    })
                  }
                  placeholder="Contoh: Budi (Semarang)"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  Nama Paket / Layanan
                </label>
                <input
                  type="text"
                  required
                  value={newJokiForm.packageName}
                  onChange={(e) =>
                    setNewJokiForm({
                      ...newJokiForm,
                      packageName: e.target.value,
                    })
                  }
                  placeholder="Contoh: Paket All-In (Divisi 1 + Event)"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Platform Game
                  </label>
                  <select
                    value={newJokiForm.platform || "steam"}
                    onChange={(e) =>
                      setNewJokiForm({
                        ...newJokiForm,
                        platform: e.target.value as GamingPlatform,
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="steam">Steam (PC)</option>
                    <option value="playstation">PlayStation (PS4/PS5)</option>
                    <option value="xbox">Xbox</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Status
                  </label>
                  <select
                    value={newJokiForm.status}
                    onChange={(e) =>
                      setNewJokiForm({
                        ...newJokiForm,
                        status: e.target.value as "Selesai" | "Sedang Proses",
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Selesai">Selesai (Tuntas)</option>
                    <option value="Sedang Proses">Sedang Proses</option>
                  </select>
                </div>
              </div>

              {/* Pilihan Format Statistik: Poin MMR vs Rekor W-D-L */}
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                  Format Statistik Joki
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewJokiForm({ ...newJokiForm, recordType: 'points' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      newJokiForm.recordType === 'points'
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Rating Poin (Divisi 1-3)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewJokiForm({ ...newJokiForm, recordType: 'wdl' })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      newJokiForm.recordType === 'wdl'
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    W - D - L (Event Weekend)
                  </button>
                </div>
              </div>

              {newJokiForm.recordType === 'wdl' ? (
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Rekor Pertandingan Event (W - D - L)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">Win (Menang)</span>
                      <input
                        type="number"
                        min="0"
                        value={newJokiForm.win}
                        onChange={(e) =>
                          setNewJokiForm({
                            ...newJokiForm,
                            win: Number(e.target.value),
                          })
                        }
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mb-0.5">Draw (Seri)</span>
                      <input
                        type="number"
                        min="0"
                        value={newJokiForm.draw}
                        onChange={(e) =>
                          setNewJokiForm({
                            ...newJokiForm,
                            draw: Number(e.target.value),
                          })
                        }
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-center"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 block mb-0.5">Loss (Kalah)</span>
                      <input
                        type="number"
                        min="0"
                        value={newJokiForm.loss}
                        onChange={(e) =>
                          setNewJokiForm({
                            ...newJokiForm,
                            loss: Number(e.target.value),
                          })
                        }
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-center"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                      Poin Awal
                    </label>
                    <input
                      type="number"
                      value={newJokiForm.initialRating}
                      onChange={(e) =>
                        setNewJokiForm({
                          ...newJokiForm,
                          initialRating: Number(e.target.value),
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                      Poin Akhir / Target
                    </label>
                    <input
                      type="number"
                      value={newJokiForm.targetRating}
                      onChange={(e) =>
                        setNewJokiForm({
                          ...newJokiForm,
                          targetRating: Number(e.target.value),
                        })
                      }
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Durasi Pengerjaan
                  </label>
                  <input
                    type="text"
                    value={newJokiForm.duration}
                    onChange={(e) =>
                      setNewJokiForm({ ...newJokiForm, duration: e.target.value })
                    }
                    placeholder="24 Jam / 1.5 Hari"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">
                    Waktu Selesai
                  </label>
                  <select
                    value={newJokiForm.date}
                    onChange={(e) => {
                      const val = e.target.value;
                      const now = new Date();
                      let target = now;
                      if (val === 'Kemarin') {
                        target = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
                      } else if (val.includes('Hari Lalu')) {
                        const days = parseInt(val, 10) || 2;
                        target = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
                      }
                      setNewJokiForm({
                        ...newJokiForm,
                        date: val,
                        completedAt: target.toISOString(),
                      });
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="Hari Ini">Hari Ini</option>
                    <option value="Kemarin">Kemarin</option>
                    <option value="2 Hari Lalu">2 Hari Lalu</option>
                    <option value="3 Hari Lalu">3 Hari Lalu</option>
                    <option value="4 Hari Lalu">4 Hari Lalu</option>
                    <option value="5 Hari Lalu">5 Hari Lalu</option>
                    <option value="6 Hari Lalu">6 Hari Lalu</option>
                    <option value="7 Hari Lalu">7 Hari Lalu</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold shadow-md cursor-pointer transition"
                >
                  {modalMode === 'update' ? 'Simpan Pembaruan Joki' : 'Tambah ke Etalase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

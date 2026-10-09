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
  X,
} from "lucide-react";
import { RecentJoki, GamingPlatform } from "../types";
import { INITIAL_RECENT_JOKIS } from "../data/mockData";

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "benbalfas") {
      localStorage.setItem("benbalfas_is_admin", "true");
      setIsAdmin(true);
    } else if (localStorage.getItem("benbalfas_is_admin") === "true") {
      setIsAdmin(true);
    }
  }, []);

  const CURRENT_RECENT_FINGERPRINT = JSON.stringify(INITIAL_RECENT_JOKIS);

  // Recent Joki Data State
  const [recentJokis, setRecentJokis] = useState<RecentJoki[]>(() => {
    const savedFingerprint = localStorage.getItem(
      "benbalfas_recent_fingerprint",
    );
    const saved = localStorage.getItem("benbalfas_recent_jokis");

    // If mockData.ts was changed in code, automatically prioritize mockData.ts!
    if (savedFingerprint !== CURRENT_RECENT_FINGERPRINT) {
      localStorage.removeItem("benbalfas_recent_jokis");
      localStorage.setItem(
        "benbalfas_recent_fingerprint",
        CURRENT_RECENT_FINGERPRINT,
      );
      return INITIAL_RECENT_JOKIS;
    }

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_RECENT_JOKIS;
      }
    }
    return INITIAL_RECENT_JOKIS;
  });

  // Watch for mockData.ts changes
  useEffect(() => {
    const savedFingerprint = localStorage.getItem(
      "benbalfas_recent_fingerprint",
    );
    if (savedFingerprint !== CURRENT_RECENT_FINGERPRINT) {
      localStorage.removeItem("benbalfas_recent_jokis");
      localStorage.setItem(
        "benbalfas_recent_fingerprint",
        CURRENT_RECENT_FINGERPRINT,
      );
      setRecentJokis(INITIAL_RECENT_JOKIS);
    }
  }, [CURRENT_RECENT_FINGERPRINT]);

  // Real-time listener: Otomatis perbarui Data Joki Terakhir ketika pesanan baru masuk dari checkout
  useEffect(() => {
    const handleRecentJokisUpdated = (event: any) => {
      if (event.detail && Array.isArray(event.detail)) {
        setRecentJokis(event.detail);
        setActiveJokiIndex(0);
      } else {
        const saved = localStorage.getItem("benbalfas_recent_jokis");
        if (saved) {
          try {
            setRecentJokis(JSON.parse(saved));
            setActiveJokiIndex(0);
          } catch {}
        }
      }
    };

    window.addEventListener("benbalfas_recent_jokis_updated", handleRecentJokisUpdated);
    return () => {
      window.removeEventListener("benbalfas_recent_jokis_updated", handleRecentJokisUpdated);
    };
  }, []);

  const [activeJokiIndex, setActiveJokiIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newJokiForm, setNewJokiForm] = useState<Partial<RecentJoki>>({
    clientName: "Klien Baru (Kota)",
    packageName: "Paket All-In (Phase Clear)",
    initialRating: 1400,
    targetRating: 1850,
    status: "Selesai",
    duration: "24 Jam",
    date: "Hari Ini",
    winStreak: 15,
    platform: "steam",
  });

  const currentJoki =
    recentJokis[activeJokiIndex] || recentJokis[0] || INITIAL_RECENT_JOKIS[0];

  const handleAddRecentJoki = (e: React.FormEvent) => {
    e.preventDefault();
    const created: RecentJoki = {
      id: "rj-" + Date.now(),
      clientName: newJokiForm.clientName || "Klien Baru",
      packageName: newJokiForm.packageName || "Paket Divisi 1",
      initialRating: Number(newJokiForm.initialRating) || 1400,
      targetRating: Number(newJokiForm.targetRating) || 1850,
      status: (newJokiForm.status as "Selesai" | "Sedang Proses") || "Selesai",
      duration: newJokiForm.duration || "24 Jam",
      date: newJokiForm.date || "Hari Ini",
      winStreak: Number(newJokiForm.winStreak) || 12,
      platform: (newJokiForm.platform as GamingPlatform) || "steam",
    };
    const updated = [created, ...recentJokis];
    setRecentJokis(updated);
    localStorage.setItem("benbalfas_recent_jokis", JSON.stringify(updated));
    localStorage.setItem(
      "benbalfas_recent_fingerprint",
      CURRENT_RECENT_FINGERPRINT,
    );
    setIsEditModalOpen(false);
    setActiveJokiIndex(0);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
      {/* Authentic eFootball Stadium & Soccer Pitch Tactical Background Overlay */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Stadium Light Cones */}
        <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-cyan-500/15 dark:bg-cyan-500/15 rounded-full blur-[110px]"></div>
        <div className="absolute -top-20 right-1/4 w-[500px] h-[500px] bg-indigo-500/15 dark:bg-purple-600/15 rounded-full blur-[110px]"></div>

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: High-Converting Copywriting */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Top Badge: eFootball Platform Support */}
            <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2 px-4 py-2 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 text-cyan-800 dark:text-cyan-300 text-xs sm:text-sm font-bold shadow-sm">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                <span>eFootball 2026 Joki Service</span>
              </span>
              <span className="hidden sm:inline text-slate-400">•</span>
              <span className="flex items-center gap-1 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                🎮 Steam • PlayStation • Xbox
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-white tracking-tight leading-[1.12]">
                Capek Dikerjain{" "}
                <span className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                  Script?
                </span>
                . <br />
                Biar Kita yang{" "}
                <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Push Akun Kamu ke Divisi 1
                </span>
                .
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
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
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
                Platform Tersedia:
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 shadow-sm">
                💻 Steam (PC)
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 shadow-sm">
                🎮 PlayStation (PS4/PS5)
              </span>
              <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shadow-sm">
                🟢 Xbox One / Series
              </span>
            </div>

            {/* Quick Trust Pills */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-semibold">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Garansi Anti-Banned & IP Lokal</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>Harga Transparan Mulai 700/pt</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                <span>Handover OTP WhatsApp Cepat</span>
              </div>
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onNavigateToJoki}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display font-extrabold text-base rounded-2xl shadow-glow-cyan transform hover:-translate-y-0.5 active:translate-y-0 transition flex items-center justify-center gap-3 cursor-pointer"
              >
                <Zap className="w-5 h-5 fill-current" />
                Hitung Harga Joki (Kalkulator)
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={onNavigateToTrophy}
                className="w-full sm:w-auto px-6 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-base rounded-2xl border border-slate-200 dark:border-slate-700/80 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Trophy className="w-5 h-5 text-amber-500" />
                Lihat Bukti Portofolio
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
                <div className="flex items-center gap-1 text-amber-500 font-bold">
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
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Card Container with eFootball subtle border styling */}
              <div className="relative rounded-3xl p-1 bg-gradient-to-b from-cyan-500/30 via-indigo-500/20 to-slate-300 dark:to-slate-800 shadow-xl dark:shadow-2xl">
                <div className="rounded-[22px] bg-white dark:bg-[#0c121e] p-6 space-y-6 border border-slate-200 dark:border-slate-800/60 backdrop-blur-md">
                  {/* Header: DATA JOKI TERAKHIR */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-sm bg-slate-900">
                        <img
                          src="/images/logo/logo.webp"
                          alt="Benbalfas eFootball"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-display font-extrabold text-base text-slate-900 dark:text-white">
                          Data Joki Terakhir
                        </h4>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                          Update Riwayat Pengerjaan Klien
                        </p>
                      </div>
                    </div>

                    {/* Edit button ONLY visible in secret owner mode */}
                    {isAdmin && (
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="p-1.5 px-2.5 rounded-lg bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-bold flex items-center gap-1 border border-cyan-500/30"
                        title="Edit Data Joki (Owner Mode)"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Update Data</span>
                      </button>
                    )}
                  </div>

                  {/* Active Joki Selector Tabs */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {recentJokis.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveJokiIndex(idx)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                          activeJokiIndex === idx
                            ? "bg-cyan-500 text-white font-bold shadow-sm"
                            : "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {item.clientName.split(" ")[0]} ({item.status})
                      </button>
                    ))}
                  </div>

                  {/* Active Joki Showcase Card */}
                  <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 dark:text-slate-200">
                        {currentJoki.clientName}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                        {currentJoki.status} • {currentJoki.date}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                        {currentJoki.packageName}
                      </p>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        {currentJoki.platform
                          ? currentJoki.platform.toUpperCase()
                          : "STEAM/CONSOLE"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Poin Awal
                        </p>
                        <p className="text-lg font-bold font-mono text-slate-800 dark:text-slate-200">
                          {currentJoki.initialRating} Pts
                        </p>
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                          +
                          {currentJoki.targetRating - currentJoki.initialRating}{" "}
                          Pts ⚡️
                        </span>
                        <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full my-1 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 w-full animate-pulse"></div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {currentJoki.duration}
                        </span>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] text-amber-500 font-mono">
                          Hasil Akhir
                        </p>
                        <p className="text-lg font-bold font-mono text-amber-500 dark:text-amber-300">
                          {currentJoki.targetRating} Pts
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Highlight All-In Package Banner */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-transparent border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-bold">
                        <span>⭐️ PAKET ALL-IN</span>
                        <span className="bg-amber-500 text-black text-[9px] px-1.5 py-0.5 rounded font-black">
                          DISKON 10%
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                          PROMO 3 KLIEN
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
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
                      className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-display font-extrabold text-xs rounded-xl shadow-glow-gold hover:scale-105 transition text-center shrink-0"
                    >
                      Pesan Promo 135k
                    </button>
                  </div>

                  {/* Stats Footer */}
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] text-slate-500">Ban Rate</p>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        0.00% (Aman)
                      </p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] text-slate-500">Tarif Mulai</p>
                      <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                        Rp 700/pt
                      </p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] text-slate-500">Success Rate</p>
                      <p className="text-xs font-extrabold text-amber-600 font-mono">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-700 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Tambah / Update Data Joki Terakhir (Owner Mode)
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRecentJoki} className="space-y-3">
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
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-white font-bold shadow-md"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

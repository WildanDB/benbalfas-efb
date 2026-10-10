import React, { useState, useMemo } from "react";
import {
  Calculator,
  Sparkles,
  Clock,
  ArrowRight,
  ShieldCheck,
  Flame,
  Info,
  Check,
  Monitor,
  Gamepad2,
} from "lucide-react";
import {
  calculateProgressivePrice,
  formatRupiah,
  BRACKET_TIERS,
  getPromoStatus,
  calculateDiscount,
} from "../utils/pricing";
import { PACKAGES_DATA } from "../data/mockData";
import { JokiPackage, GamingPlatform } from "../types";

interface JokiSectionProps {
  onOpenCheckout: (
    type: "points" | "package",
    packageId?: string,
    pointsData?: {
      initial: number;
      target: number;
      price: number;
      sla: string;
    },
    platform?: GamingPlatform,
  ) => void;
}

export const JokiSection: React.FC<JokiSectionProps> = ({ onOpenCheckout }) => {
  const [activeTab, setActiveTab] = useState<"points" | "package">("points");

  // Platform Selector State (Steam, PlayStation, Xbox)
  const [selectedPlatform, setSelectedPlatform] =
    useState<GamingPlatform>("steam");

  // Tab A: Progressive Points Calculator State
  const [initialPoints, setInitialPoints] = useState<number>(1400);
  const [targetPoints, setTargetPoints] = useState<number>(1850);

  // Promo status
  const promoStatus = getPromoStatus();

  // Calculation Result Memo
  const calculationResult = useMemo(() => {
    return calculateProgressivePrice(initialPoints, targetPoints);
  }, [initialPoints, targetPoints]);

  // Progressive Points Discount
  const pointsDiscount = useMemo(() => {
    return calculateDiscount(
      calculationResult.totalPrice,
      false,
      promoStatus.isActive,
    );
  }, [calculationResult.totalPrice, promoStatus.isActive]);

  const handlePresetSelect = (init: number, target: number) => {
    setInitialPoints(init);
    setTargetPoints(target);
  };

  const handleOrderPoints = () => {
    if (!calculationResult.isValid) return;
    onOpenCheckout(
      "points",
      undefined,
      {
        initial: calculationResult.initialPoints,
        target: calculationResult.targetPoints,
        price: pointsDiscount.finalPrice,
        sla: calculationResult.slaText,
      },
      selectedPlatform,
    );
  };

  const handleOrderPackage = (pkg: JokiPackage) => {
    onOpenCheckout("package", pkg.id, undefined, selectedPlatform);
  };

  return (
    <section
      id="kalkulator"
      className="py-16 sm:py-24 relative overflow-hidden transition-colors duration-300"
    >
      {/* Background Decor */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
            Kalkulator & Checkout Otomatis
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight">
            Pilihan Layanan Joki{" "}
            <span className="bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Hemat & Terjamin
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
            Gunakan kalkulator hitung poin progresif mulai dari Rp 700/poin atau
            ambil paket instan hemat all-in.
          </p>
        </div>

        {/* Global Platform Selector Widget */}
        <div className="max-w-xl mx-auto mb-10 bg-white dark:bg-slate-900/90 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2 text-center uppercase tracking-wider">
            🎮 Pilih Platform Game Anda:
          </label>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSelectedPlatform("steam")}
              className={`py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition border ${
                selectedPlatform === "steam"
                  ? "bg-cyan-500 text-white border-cyan-400 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Steam (PC)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPlatform("playstation")}
              className={`py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition border ${
                selectedPlatform === "playstation"
                  ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">PlayStation</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPlatform("xbox")}
              className={`py-2 sm:py-2.5 px-1 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition border ${
                selectedPlatform === "xbox"
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                  : "bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Xbox</span>
            </button>
          </div>
        </div>

        {/* Tab / Toggle UI */}
        <div className="flex justify-center mb-10 w-full max-w-md mx-auto px-1 sm:px-0">
          <div className="w-full grid grid-cols-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-md backdrop-blur-md">
            <button
              onClick={() => setActiveTab("points")}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-display font-extrabold transition-all duration-300 text-center ${
                activeTab === "points"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-glow-cyan"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Calculator className="w-4 h-4 shrink-0" />
              <span className="sm:hidden">Hitung Poin</span>
              <span className="hidden sm:inline">TAB A: Hitung via Poin</span>
            </button>

            <button
              onClick={() => setActiveTab("package")}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-6 py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-display font-extrabold transition-all duration-300 text-center ${
                activeTab === "package"
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-glow-gold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="sm:hidden">Paket Instan</span>
              <span className="hidden sm:inline">
                TAB B: Pilih Paket Instan
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB A: HITUNG VIA POIN (PROGRESSIVE PRICING) */}
        {/* ========================================================================= */}
        {activeTab === "points" && (
          <div className="grid lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            {/* Left Box: Interactive Inputs & Sliders */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                    Kalkulator Poin Progresif
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bayar sesuai porsi bracket poin yang dimainkan
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                  Range: 1200 - 2200 Pts
                </span>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                  Preset Pilihan Cepat:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handlePresetSelect(1200, 1800)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-cyan-50 dark:bg-slate-800/70 dark:hover:bg-cyan-950/40 hover:border-cyan-500 border border-slate-200 dark:border-slate-700/60 text-xs font-mono text-slate-700 dark:text-slate-300 transition text-center shadow-sm"
                  >
                    <span className="block font-bold">1200 → 1800</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Div 3 ke Div 1
                    </span>
                  </button>

                  <button
                    onClick={() => handlePresetSelect(1400, 1800)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-cyan-50 dark:bg-slate-800/70 dark:hover:bg-cyan-950/40 hover:border-cyan-500 border border-slate-200 dark:border-slate-700/60 text-xs font-mono text-slate-700 dark:text-slate-300 transition text-center shadow-sm"
                  >
                    <span className="block font-bold">1400 → 1800</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Div 2 ke Div 1
                    </span>
                  </button>

                  <button
                    onClick={() => handlePresetSelect(1800, 2000)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-cyan-50 dark:bg-slate-800/70 dark:hover:bg-cyan-950/40 hover:border-cyan-500 border border-slate-200 dark:border-slate-700/60 text-xs font-mono text-slate-700 dark:text-slate-300 transition text-center shadow-sm"
                  >
                    <span className="block font-bold">1800 → 2000</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Div 1 Push MMR
                    </span>
                  </button>

                  <button
                    onClick={() => handlePresetSelect(1800, 2200)}
                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-cyan-50 dark:bg-slate-800/70 dark:hover:bg-cyan-950/40 hover:border-cyan-500 border border-slate-200 dark:border-slate-700/60 text-xs font-mono text-slate-700 dark:text-slate-300 transition text-center shadow-sm"
                  >
                    <span className="block font-bold">1800 → 2200</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      Top Global Leaderboard
                    </span>
                  </button>
                </div>
              </div>

              {/* Input: Initial Points */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>1. Poin Awal Anda Saat Ini</span>
                    <span className="text-[11px] sm:text-xs text-slate-500 font-mono">
                      (Min. 1200)
                    </span>
                  </label>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <input
                      type="number"
                      min={1200}
                      max={2199}
                      value={initialPoints}
                      onChange={(e) => setInitialPoints(Number(e.target.value))}
                      className="w-24 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-sm text-right focus:border-cyan-500 focus:outline-none shadow-sm"
                    />
                    <span className="text-xs font-mono text-slate-500">
                      Pts
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min={1200}
                  max={2190}
                  step={10}
                  value={initialPoints}
                  onChange={(e) => setInitialPoints(Number(e.target.value))}
                  className="w-full accent-cyan-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-500 font-mono gap-1">
                  <span>1200 (Div 3)</span>
                  <span>1600 (Div 2)</span>
                  <span>1800 (Div 1)</span>
                  <span>2100+</span>
                </div>
              </div>

              {/* Input: Target Points */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>2. Target Poin yang Anda Inginkan</span>
                    <span className="text-[11px] sm:text-xs text-slate-500 font-mono">
                      (Maks. 2200)
                    </span>
                  </label>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <input
                      type="number"
                      min={initialPoints + 1}
                      max={2200}
                      value={targetPoints}
                      onChange={(e) => setTargetPoints(Number(e.target.value))}
                      className="w-24 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-cyan-500 text-cyan-700 dark:text-cyan-300 font-mono font-bold text-sm text-right focus:border-cyan-400 focus:outline-none shadow-sm"
                    />
                    <span className="text-xs font-mono text-slate-500">
                      Pts
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min={1210}
                  max={2200}
                  step={10}
                  value={targetPoints}
                  onChange={(e) => setTargetPoints(Number(e.target.value))}
                  className="w-full accent-cyan-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[10px] sm:text-[11px] text-slate-500 font-mono gap-1">
                  <span>1400</span>
                  <span>1800 (Div 1)</span>
                  <span>2000 (MMR)</span>
                  <span>2200 (Top)</span>
                </div>
              </div>

              {/* Tier Rates Guide */}
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 text-xs">
                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-2.5 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  Struktur Tarif Progresif Transparan:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                  {BRACKET_TIERS.map((tier) => (
                    <div
                      key={tier.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm"
                    >
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        {tier.name.split(" ")[0]} {tier.name.split(" ")[1]}
                      </p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Rp {tier.rate.toLocaleString("id-ID")}/pt
                      </p>
                      <span className="text-[9px] text-slate-500">
                        {tier.min}-{tier.max} Pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Box: Live Calculation Summary & SLA */}
            <div className="lg:col-span-5 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-[#0c121e] rounded-3xl p-6 sm:p-8 border border-cyan-500/40 shadow-xl dark:shadow-2xl space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold">
                  Ringkasan Estimasi Biaya
                </span>
                <h3 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white mt-1">
                  Detail Perhitungan
                </h3>
              </div>

              {calculationResult.isValid ? (
                <>
                  {/* Platform Selected Indicator */}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="text-slate-600 dark:text-slate-400">
                      Platform Terpilih:
                    </span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-300 uppercase font-mono">
                      {selectedPlatform.toUpperCase()}
                    </span>
                  </div>

                  {/* Big Total Price */}
                  <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center space-y-1 relative overflow-hidden">
                    {pointsDiscount.isApplied && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold font-mono uppercase mb-1">
                        <span>🔥 {pointsDiscount.promoLabel}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        Total Biaya Joki (Nett):
                      </span>
                      {pointsDiscount.isApplied && (
                        <div className="text-xs text-slate-400 line-through font-mono mt-0.5">
                          {formatRupiah(calculationResult.totalPrice)}
                        </div>
                      )}
                    </div>
                    <div className="text-3xl sm:text-4xl font-display font-black text-cyan-600 dark:text-cyan-400 tracking-tight">
                      {formatRupiah(pointsDiscount.finalPrice)}
                    </div>
                    {pointsDiscount.isApplied && (
                      <p className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        Hemat {formatRupiah(pointsDiscount.discountAmount)}{" "}
                        (Diskon 20%)
                      </p>
                    )}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      Total Poin Di-push:{" "}
                      <span className="text-slate-900 dark:text-white font-bold">
                        +{calculationResult.totalPoints} Pts
                      </span>
                    </p>
                  </div>

                  {/* Progressive Breakdown Table */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-mono uppercase">
                      Rincian per Bracket:
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {calculationResult.breakdown.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-sm"
                        >
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                              {item.tierName}
                            </p>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {item.points} pts × Rp{" "}
                              {item.rate.toLocaleString("id-ID")}
                            </span>
                          </div>
                          <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300">
                            {formatRupiah(item.subtotal)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SLA Calculation */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Estimasi Selesai (SLA)
                        </p>
                        <p className="text-sm font-bold text-amber-600 dark:text-amber-300 font-mono">
                          {calculationResult.slaText}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                      Cepat & Terjadwal
                    </span>
                  </div>

                  {/* Action CTA Button */}
                  <button
                    onClick={handleOrderPoints}
                    className="w-full py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display font-black text-base rounded-2xl shadow-glow-cyan transform hover:-translate-y-0.5 active:translate-y-0 transition flex items-center justify-center gap-3 cursor-pointer"
                  >
                    <span>
                      Pesan Joki Poin ({selectedPlatform.toUpperCase()})
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Garansi 100% Anti-Banned • Handover OTP WhatsApp Cepat
                  </p>
                </>
              ) : (
                <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-300 dark:border-red-500/30 text-center space-y-3">
                  <p className="text-red-600 dark:text-red-400 font-bold text-sm">
                    {calculationResult.errorMessage}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pastikan Poin Awal minimal 1200 dan Target Poin lebih tinggi
                    maksimal 2200.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB B: PILIH PAKET INSTAN (DECOY STRATEGY) */}
        {/* ========================================================================= */}
        {activeTab === "package" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Value Recommendation Banner */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center max-w-3xl mx-auto shadow-sm">
              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                💡{" "}
                <strong className="text-amber-600 dark:text-amber-400">
                  Pilihan Paling Hemat:
                </strong>{" "}
                Paket All-In (150k →{" "}
                <span className="font-bold text-amber-600 dark:text-amber-400">
                  Rp 135.000 Diskon 10%
                </span>
                ) dan Paket Event Weekend (70k →{" "}
                <span className="font-bold text-cyan-600 dark:text-cyan-400">
                  Rp 63.000 Diskon 10%
                </span>
                ) untuk 3 klien pertama!
              </p>
            </div>

            {/* Pricing Cards Grid (4 Cards Responsive) */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch pt-4">
              {PACKAGES_DATA.map((pkg) => {
                const isAllIn = pkg.id === "sultan-phase-clear";
                const isTenPercent =
                  pkg.id === "sultan-phase-clear" || pkg.id === "event-weekend";
                const isDecoy = Boolean(pkg.isDecoy);
                const pkgDiscount = calculateDiscount(
                  pkg.price,
                  isTenPercent,
                  promoStatus.isActive,
                );

                return (
                  <div
                    key={pkg.id}
                    className={`relative rounded-3xl transition-all duration-300 flex flex-col justify-between ${
                      isAllIn
                        ? "bg-gradient-to-b from-amber-50 via-white to-orange-50 dark:from-[#192233] dark:via-[#0f1622] dark:to-[#0a0f18] border-2 border-amber-500 dark:border-amber-400 shadow-glow-gold lg:-translate-y-2 p-5 sm:p-6 z-10"
                        : isDecoy
                          ? "bg-white dark:bg-slate-900/70 border border-purple-300 dark:border-purple-500/20 hover:border-purple-500 p-5 sm:p-6 shadow-sm"
                          : pkg.id === "event-weekend"
                            ? "bg-white dark:bg-slate-900/70 border border-cyan-300 dark:border-cyan-500/30 hover:border-cyan-500 p-5 sm:p-6 shadow-sm"
                            : "bg-white dark:bg-slate-900/70 border border-blue-300 dark:border-blue-500/20 hover:border-blue-500 p-5 sm:p-6 shadow-sm"
                    }`}
                  >
                    {/* Top Floating Badge for All-In */}
                    {isAllIn && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 text-xs font-display font-black px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        PALING LARIS • DISKON 10%
                      </div>
                    )}

                    <div>
                      {/* Badge / Category */}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg ${
                            isAllIn
                              ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40"
                              : isDecoy
                                ? "bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-500/30"
                                : "bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {pkg.badge}
                        </span>

                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {pkg.sla}
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <h3
                        className={`font-display font-black text-xl lg:text-lg xl:text-xl mb-1 ${isAllIn ? "text-amber-700 dark:text-amber-300" : "text-slate-900 dark:text-white"}`}
                      >
                        {pkg.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 font-medium">
                        {pkg.subtitle}
                      </p>

                      {/* Price Display */}
                      <div className="mb-6 p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 overflow-hidden">
                        {pkgDiscount.isApplied && (
                          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                            <span className="text-xs text-slate-400 line-through font-mono">
                              {pkg.formattedPrice}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                              Diskon {pkgDiscount.discountPercent}% (Promo)
                            </span>
                          </div>
                        )}
                        <div className="flex flex-wrap items-baseline gap-1.5">
                          <span
                            className={`font-display font-black text-2xl sm:text-3xl lg:text-2xl xl:text-3xl tracking-tight leading-none ${
                              isAllIn
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {formatRupiah(pkgDiscount.finalPrice)}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-semibold shrink-0">
                            / tuntas
                          </span>
                        </div>
                        {isDecoy && (
                          <p className="text-[11px] text-purple-700 dark:text-purple-400 mt-2 font-mono">
                            ⚡️ Cuma nambah 31k untuk Paket All-In (Diskon 10%)!
                          </p>
                        )}
                        {isAllIn && (
                          <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-2 font-mono font-bold">
                            ⭐️ Termasuk Push Rank + Seluruh Event Hadiah Koin
                          </p>
                        )}
                      </div>

                      {/* Benefits List */}
                      <ul className="space-y-3 mb-8 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                        {pkg.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <Check
                              className={`w-4 h-4 shrink-0 mt-0.5 ${
                                isAllIn ? "text-amber-500" : "text-cyan-500"
                              }`}
                            />
                            <span
                              className={
                                isAllIn && i < 2
                                  ? "font-bold text-slate-900 dark:text-white"
                                  : ""
                              }
                            >
                              {benefit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <div>
                      <button
                        onClick={() => handleOrderPackage(pkg)}
                        className={`w-full py-4 rounded-2xl font-display font-extrabold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                          isAllIn
                            ? "bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-500 text-slate-950 shadow-glow-gold hover:scale-[1.02] text-base"
                            : isDecoy
                              ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-purple-900 dark:text-purple-200 border border-purple-300 dark:border-purple-500/40"
                              : "bg-slate-100 hover:bg-cyan-600 hover:text-white dark:bg-slate-800 dark:hover:bg-cyan-600 dark:hover:text-black text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <span>
                          {pkgDiscount.isApplied
                            ? `Pesan Promo (${formatRupiah(pkgDiscount.finalPrice)})`
                            : pkg.ctaText}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

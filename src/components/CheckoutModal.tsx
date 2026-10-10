import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  Lock,
  ChevronRight,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Monitor,
  Gamepad2,
  QrCode,
  Download,
  Tag,
} from "lucide-react";
import confetti from "canvas-confetti";
import { OrderType, GamingPlatform } from "../types";
import { PACKAGES_DATA } from "../data/mockData";
import {
  formatRupiah,
  generateWhatsAppLink,
  getPlatformLabel,
  calculateDiscount,
  claimPromoSlot,
  isTenPercentDiscountPackage,
  validateReferralCode,
  claimReferralSlot,
} from "../utils/pricing";
import { APP_CONFIG } from "../config/constants";
import {
  syncOrderToSpreadsheetAndRecentJoki,
  SpreadsheetOrderRecord,
} from "../utils/spreadsheet";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderType?: OrderType;
  selectedPackageId?: string;
  pointsData?: {
    initial: number;
    target: number;
    price: number;
    sla: string;
  };
  initialPlatform?: GamingPlatform;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  initialOrderType = "points",
  selectedPackageId,
  pointsData,
  initialPlatform = "steam",
}) => {
  const [orderType, setOrderType] = useState<OrderType>(initialOrderType);
  const [selectedPkgId, setSelectedPkgId] = useState<string>(
    selectedPackageId || "sultan-phase-clear",
  );
  const [platform, setPlatform] = useState<GamingPlatform>(initialPlatform);

  // Form fields
  const [clientName, setClientName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [accountUsername, setAccountUsername] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [paymentMethod] = useState<"qris">("qris");

  // Referral Code State
  const [referralInput, setReferralInput] = useState("");
  const [appliedReferral, setAppliedReferral] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [referralFeedback, setReferralFeedback] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Bukti Transfer State (File & Preview)
  const [transferProofPreview, setTransferProofPreview] = useState<
    string | null
  >(null);
  const [transferProofName, setTransferProofName] = useState<string>("");
  const [transferProofNote, setTransferProofNote] = useState("");

  // Submission & Success state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialOrderType) setOrderType(initialOrderType);
      if (selectedPackageId) setSelectedPkgId(selectedPackageId);
      if (initialPlatform) setPlatform(initialPlatform);
      setIsSuccess(false);
      setReferralInput("");
      setAppliedReferral(null);
      setReferralFeedback({ type: null, message: "" });
    }
  }, [isOpen, initialOrderType, selectedPackageId, initialPlatform]);

  if (!isOpen) return null;

  const currentPackage =
    PACKAGES_DATA.find((p) => p.id === selectedPkgId) || PACKAGES_DATA[0];

  const isTenPercent =
    orderType === "package" && isTenPercentDiscountPackage(currentPackage.id);
  const basePrice =
    orderType === "points" ? pointsData?.price || 420000 : currentPackage.price;

  const promoDiscount = calculateDiscount(basePrice, isTenPercent);
  const referralDiscountAmount = appliedReferral ? appliedReferral.discountAmount : 0;
  const finalPrice = Math.max(0, promoDiscount.finalPrice - referralDiscountAmount);

  const finalSla =
    orderType === "points" ? pointsData?.sla || "3 Hari" : currentPackage.sla;

  const orderDescription =
    orderType === "points"
      ? `Joki Poin (${pointsData?.initial || 1400} → ${pointsData?.target || 1850} Pts)`
      : currentPackage.title;

  // Dynamic Account Labels based on selected platform
  const getAccountFieldLabels = () => {
    switch (platform) {
      case "steam":
        return {
          sectionTitle: "3. Informasi Akun Steam (Login eFootball)",
          usernameLabel: "Username Steam *",
          usernamePlaceholder: "Contoh: username_steam atau email steam",
          passwordLabel: "Password Steam *",
          passwordPlaceholder: "Password akun Steam Anda",
          telegramLabel: "Username Steam",
        };
      case "playstation":
        return {
          sectionTitle: "3. Informasi Akun PlayStation (Login eFootball)",
          usernameLabel: "Username PS / Sign-in ID *",
          usernamePlaceholder: "Contoh: ID_PSN atau email_psn@gmail.com",
          passwordLabel: "Password PSN *",
          passwordPlaceholder: "Password akun PlayStation Network",
          telegramLabel: "Username PS / PSN",
        };
      case "xbox":
        return {
          sectionTitle: "3. Informasi Akun Xbox (Login eFootball)",
          usernameLabel: "Username Xbox / Gamertag *",
          usernamePlaceholder: "Contoh: Gamertag atau email_microsoft",
          passwordLabel: "Password Akun Xbox *",
          passwordPlaceholder: "Password akun Xbox / Microsoft",
          telegramLabel: "Username Xbox",
        };
      default:
        return {
          sectionTitle: "3. Informasi Akun Game (Login eFootball)",
          usernameLabel: "Username Akun *",
          usernamePlaceholder: "Username / Email akun game",
          passwordLabel: "Password Akun *",
          passwordPlaceholder: "Password akun",
          telegramLabel: "Username Akun",
        };
    }
  };

  const accountLabels = getAccountFieldLabels();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTransferProofName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTransferProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProof = () => {
    setTransferProofPreview(null);
    setTransferProofName("");
  };

  const handleApplyReferral = () => {
    if (!referralInput.trim()) {
      setReferralFeedback({
        type: "error",
        message: "Silakan masukkan kode referral terlebih dahulu.",
      });
      return;
    }
    const result = validateReferralCode(referralInput);
    if (result.isValid) {
      setAppliedReferral({
        code: referralInput.trim(),
        discountAmount: result.discountAmount,
      });
      setReferralFeedback({
        type: "success",
        message: result.message,
      });
    } else {
      setAppliedReferral(null);
      setReferralFeedback({
        type: "error",
        message: result.message,
      });
    }
  };

  const handleRemoveReferral = () => {
    setAppliedReferral(null);
    setReferralInput("");
    setReferralFeedback({ type: null, message: "" });
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const initialRating =
      orderType === "points"
        ? (pointsData?.initial || 1400)
        : (currentPackage.id === "fast-track" ? 1600 : 1400);
    const targetRating =
      orderType === "points"
        ? (pointsData?.target || 1850)
        : 1850;

    const orderId = "ORD-" + Date.now();
    const timestamp = new Date().toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    // 1. Catat ke Model Spreadsheet Lengkap
    const spreadsheetRecord: SpreadsheetOrderRecord = {
      timestamp,
      orderId,
      clientName,
      whatsappNumber,
      platform,
      platformLabel: getPlatformLabel(platform),
      orderType,
      orderDescription,
      initialRating,
      targetRating,
      originalPrice: promoDiscount.basePrice,
      discountPercent: promoDiscount.isApplied ? promoDiscount.discountPercent : 0,
      referralCode: appliedReferral ? appliedReferral.code : undefined,
      referralDiscount: referralDiscountAmount,
      finalPrice,
      duration: finalSla,
      status: "Sedang Proses",
      paymentMethod: "QRIS",
      accountUsername,
      accountPassword,
      transferProofName: transferProofName || "",
      transferProofNote: transferProofNote || "",
      hasTransferProof: !!transferProofPreview,
    };

    // Sinkronisasi otomatis ke Database Spreadsheet, Data Joki Terakhir, Firebase Cloud, & Bot Telegram
    try {
      await syncOrderToSpreadsheetAndRecentJoki(spreadsheetRecord);
    } catch (err) {
      console.error("Gagal sinkronisasi spreadsheet/joki/telegram:", err);
    }

    // Claim promo slot if promo was applied
    if (promoDiscount.isApplied) {
      claimPromoSlot();
    }

    // Claim referral slot if referral was applied
    if (appliedReferral) {
      claimReferralSlot();
    }

    // Save order history locally
    const existingOrders = JSON.parse(
      localStorage.getItem("benbalfas_orders") || "[]",
    );
    existingOrders.unshift({
      id: orderId,
      date: new Date().toISOString(),
      orderType,
      platform,
      orderDescription,
      price: finalPrice,
      originalPrice: promoDiscount.basePrice,
      discountApplied: promoDiscount.isApplied
        ? promoDiscount.discountPercent
        : 0,
      referralCode: appliedReferral ? appliedReferral.code : null,
      referralDiscount: referralDiscountAmount,
      clientName,
      whatsappNumber,
      accountUsername,
      hasTransferProof: !!transferProofPreview,
      status: "Sedang Proses",
    });
    localStorage.setItem("benbalfas_orders", JSON.stringify(existingOrders));

    setIsSubmitting(false);
    setIsSuccess(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const waRedirectUrl = generateWhatsAppLink(APP_CONFIG.adminWhatsApp, {
    clientName,
    orderDetails: orderDescription,
    amount: formatRupiah(finalPrice),
    platform,
    hasTransferProof: !!transferProofPreview,
    promoApplied: promoDiscount.isApplied
      ? `${promoDiscount.promoLabel} (-${formatRupiah(promoDiscount.discountAmount)})`
      : undefined,
    referralApplied: appliedReferral
      ? `${appliedReferral.code} (-${formatRupiah(referralDiscountAmount)})`
      : undefined,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-white dark:bg-[#0b1019] border border-slate-200 dark:border-cyan-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl relative my-auto">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 uppercase font-bold tracking-wider">
                Booking Engine & Handover OTP
              </span>
            </div>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1">
              Form Pemesanan Joki
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 3 SUCCESS / OTP HANDOVER SCREEN */}
        {isSuccess ? (
          <div className="space-y-6 text-center py-4 animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-bold font-mono border border-emerald-500/30">
                Pesanan Berhasil Dicatat!
              </span>
              <h4 className="font-display font-black text-2xl text-slate-900 dark:text-white">
                Langkah Terakhir: Buka WhatsApp Admin
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Detail pesanan telah diamankan. Sekarang klik tombol di bawah
                untuk membuka WhatsApp Admin & standby verifikasi kode OTP (2FA)
                saat proses login.
              </p>
            </div>

            {/* Summary Card */}
            <div className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2 max-w-md mx-auto font-mono">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Nama:</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {clientName}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Platform:</span>
                <span className="text-blue-600 dark:text-cyan-300 font-bold">
                  {getPlatformLabel(platform)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>{accountLabels.usernameLabel.replace(" *", "")}:</span>
                <span className="text-slate-900 dark:text-white font-bold">
                  {accountUsername}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Layanan:</span>
                <span className="text-cyan-700 dark:text-cyan-300 font-bold">
                  {orderDescription}
                </span>
              </div>
              {promoDiscount.isApplied && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Diskon Promo:</span>
                  <span className="font-bold">
                    -{formatRupiah(promoDiscount.discountAmount)} (
                    {promoDiscount.discountPercent}%)
                  </span>
                </div>
              )}
              {appliedReferral && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Kode Referral:</span>
                  <span className="font-bold">
                    {appliedReferral.code} (-{formatRupiah(appliedReferral.discountAmount)})
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Total Tagihan:</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold text-sm">
                  {formatRupiah(finalPrice)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Bukti Transfer:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {transferProofName ? "✅ Terlampir" : "Konfirmasi via WA"}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Status Joki:</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  ⚡️ Sedang Proses (Masuk Data Joki Terakhir)
                </span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Metode Bayar:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  QRIS Instant
                </span>
              </div>
            </div>

            {/* WhatsApp CTA Handover Button */}
            <div className="pt-2">
              <a
                href={waRedirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-display font-extrabold text-base shadow-lg shadow-emerald-500/30 transform hover:scale-105 transition"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Buka WhatsApp & Kirim Standby OTP</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 font-mono">
                Pesan WhatsApp otomatis terisi format resmi Benbalfas.
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 underline pt-4"
            >
              Tutup & Kembali ke Web
            </button>
          </div>
        ) : (
          /* FORM VIEW */
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            {/* 1. Pilihan Platform Game (Steam / Xbox / PlayStation) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                1. Pilih Platform Game Anda *
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPlatform("steam")}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                    platform === "steam"
                      ? "bg-cyan-500/15 border-cyan-500 text-cyan-700 dark:text-cyan-300 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span className="font-bold text-xs">Steam (PC)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlatform("playstation")}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                    platform === "playstation"
                      ? "bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span className="font-bold text-xs">PlayStation</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlatform("xbox")}
                  className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                    platform === "xbox"
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-sm"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span className="font-bold text-xs">Xbox</span>
                </button>
              </div>
            </div>

            {/* 2. Tipe Pesanan Switcher */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                2. Tipe Layanan Joki *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOrderType("points")}
                  className={`p-3 rounded-2xl border text-left transition ${
                    orderType === "points"
                      ? "bg-cyan-500/10 border-cyan-500 text-cyan-700 dark:text-cyan-300"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <p className="font-bold text-xs sm:text-sm">
                    Hitung via Poin
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Mulai Rp 700 / Poin
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setOrderType("package")}
                  className={`p-3 rounded-2xl border text-left transition ${
                    orderType === "package"
                      ? "bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <p className="font-bold text-xs sm:text-sm">
                    Pilih Paket Hemat
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Fast Track / All-In Clear
                  </p>
                </button>
              </div>
            </div>

            {/* Conditional Sub-options */}
            {orderType === "package" ? (
              <div className="space-y-2 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Pilihan Paket:
                </label>
                <select
                  value={selectedPkgId}
                  onChange={(e) => setSelectedPkgId(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs focus:border-cyan-400 focus:outline-none"
                >
                  {PACKAGES_DATA.map((p) => {
                    const isPkgTenPercent = isTenPercentDiscountPackage(p.id);
                    const discount = calculateDiscount(p.price, isPkgTenPercent);
                    return (
                      <option key={p.id} value={p.id}>
                        {p.title} — {formatRupiah(discount.finalPrice)}{" "}
                        {discount.isApplied
                          ? `(Promo -${discount.discountPercent}%)`
                          : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <p className="text-slate-500 dark:text-slate-400">
                    Parameter Kalkulator:
                  </p>
                  <p className="font-bold text-slate-900 dark:text-white font-mono">
                    {pointsData?.initial || 1400} Pts ➔{" "}
                    {pointsData?.target || 1850} Pts
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 dark:text-slate-400">
                    Estimasi Selesai:
                  </p>
                  <p className="font-bold text-cyan-600 dark:text-cyan-300 font-mono">
                    {finalSla}
                  </p>
                </div>
              </div>
            )}

            {/* 3. Form Data Akun (Dynamically adapting to Steam / PlayStation / Xbox) */}
            <div className="space-y-3 bg-slate-50 dark:bg-slate-950/40 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="border-b border-slate-200 dark:border-slate-800/80 pb-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  {accountLabels.sectionTitle}
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Kredensial login Anda 100% aman dan hanya digunakan oleh tim
                  jokers pro saat sesi match.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-medium">
                    Nama / Panggilan Klien *
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Contoh: Farhan"
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-cyan-400 focus:outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-medium">
                    Nomor WhatsApp Aktif *
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-cyan-400 focus:outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-medium flex items-center justify-between">
                    <span>{accountLabels.usernameLabel}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Terenkripsi
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={accountUsername}
                    onChange={(e) => setAccountUsername(e.target.value)}
                    placeholder={accountLabels.usernamePlaceholder}
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:border-cyan-400 focus:outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-slate-700 dark:text-slate-300 block mb-1 font-medium">
                    {accountLabels.passwordLabel}
                  </label>
                  <input
                    type="password"
                    required
                    value={accountPassword}
                    onChange={(e) => setAccountPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:border-cyan-400 focus:outline-none shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* 4. Kode Referral (Opsional) */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>4. Kode Referral</span>
                </label>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Opsional
                </span>
              </div>

              {!appliedReferral ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralInput}
                    onChange={(e) => {
                      setReferralInput(e.target.value);
                      if (referralFeedback.message) setReferralFeedback({ type: null, message: "" });
                    }}
                    placeholder="Masukkan kode referral jika punya"
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white uppercase placeholder:normal-case placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleApplyReferral}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer shadow-sm"
                  >
                    Gunakan
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300 font-mono uppercase">
                        {appliedReferral.code}
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 ml-1.5 font-bold">
                        (-{formatRupiah(appliedReferral.discountAmount)})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveReferral}
                    className="text-[11px] text-red-500 hover:text-red-400 font-semibold underline cursor-pointer"
                  >
                    Hapus
                  </button>
                </div>
              )}

              {referralFeedback.message && !appliedReferral && (
                <p
                  className={`text-[11px] font-medium ${
                    referralFeedback.type === "success"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {referralFeedback.message}
                </p>
              )}
            </div>

            {/* 5. Pembayaran QRIS & Upload Bukti Transfer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  5. Pembayaran QRIS Resmi & Bukti Transfer *
                </label>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  ⚡️ QRIS All Payment
                </span>
              </div>

              {/* QRIS Card with User's Uploaded QR Image */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-xs font-bold mb-3 border border-cyan-500/20">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan QRIS Ben Balfas</span>
                  </div>

                  {/* QR Image Frame */}
                  <div className="p-3 bg-white rounded-2xl shadow-lg border border-slate-200/80 max-w-[260px] sm:max-w-[280px] mx-auto transition-transform hover:scale-[1.02]">
                    <img
                      src={APP_CONFIG.paymentAccounts.qris.qrisImageUrl}
                      alt="QRIS Ben Balfas"
                      className="w-full h-auto object-contain rounded-xl"
                    />
                  </div>

                  {/* QR Actions & Support Info */}
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    <a
                      href={APP_CONFIG.paymentAccounts.qris.qrisImageUrl}
                      download="QRIS_BenBalfas.webp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-cyan-600 dark:text-cyan-400 text-xs font-bold transition border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh / Simpan Gambar QR</span>
                    </a>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 max-w-md font-mono leading-relaxed">
                    Mendukung semua m-Banking (BCA, Mandiri, BRImo, BNI) & e-Wallet (GoPay, OVO, Dana, ShopeePay). Bebas biaya admin.
                  </p>
                </div>

                {/* Price Breakdown with Promo & Referral */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-1.5 text-xs">
                  {promoDiscount.isApplied && (
                    <>
                      <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                        <span>Harga Normal:</span>
                        <span className="line-through font-mono">
                          {formatRupiah(promoDiscount.basePrice)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>🎉 {promoDiscount.promoLabel}:</span>
                        <span className="font-mono">
                          -{formatRupiah(promoDiscount.discountAmount)}
                        </span>
                      </div>
                    </>
                  )}
                  {appliedReferral && (
                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
                      <span>🎟️ Kode Referral ({appliedReferral.code}):</span>
                      <span className="font-mono">
                        -{formatRupiah(appliedReferral.discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-800 dark:text-slate-200 font-bold">
                      Total Pembayaran:
                    </span>
                    <span className="text-lg font-black font-mono text-amber-600 dark:text-amber-400">
                      {formatRupiah(finalPrice)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Upload Screenshot Bukti Transfer Box */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <span>
                      Upload Bukti Transfer (Screenshot Struk / M-Banking) *
                    </span>
                  </label>
                  {transferProofPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveProof}
                      className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  )}
                </div>

                {transferProofPreview ? (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <img
                      src={transferProofPreview}
                      alt="Preview Bukti Transfer"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {transferProofName}
                      </p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                        ✅ File siap dikonfirmasi
                      </p>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-cyan-500 bg-white dark:bg-slate-900/50 cursor-pointer transition">
                    <ImageIcon className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                      Klik untuk Pilih Gambar Bukti Transfer
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      Format JPG, PNG, atau Screenshot WebP
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}

                <div>
                  <input
                    type="text"
                    value={transferProofNote}
                    onChange={(e) => setTransferProofNote(e.target.value)}
                    placeholder="Catatan tambahan (misal: Transfer via m-BCA a/n Farhan)"
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:border-cyan-400 focus:outline-none shadow-sm mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-display font-black text-base shadow-glow-cyan flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Mengamankan Pesanan...</span>
                ) : (
                  <>
                    <span>
                      Konfirmasi Pesanan ({getPlatformLabel(platform)}) & Lanjut
                      Handover OTP
                    </span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>
                Data Anda 100% aman dan langsung diserahkan ke WhatsApp Admin
                Benbalfas.
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

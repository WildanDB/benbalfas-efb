import { BracketTier, CalculationBreakdownItem, PricingCalculationResult, GamingPlatform } from '../types';

export const BRACKET_TIERS: BracketTier[] = [
  { id: 1, name: 'Tier 1 (1200 - 1800 Pts)', min: 1200, max: 1800, rate: 700, color: 'text-cyan-400 border-cyan-500/30' },
  { id: 2, name: 'Tier 2 (1801 - 1900 Pts)', min: 1800, max: 1900, rate: 1200, color: 'text-blue-400 border-blue-500/30' },
  { id: 3, name: 'Tier 3 (1901 - 2000 Pts)', min: 1900, max: 2000, rate: 1500, color: 'text-purple-400 border-purple-500/30' },
  { id: 4, name: 'Tier 4 (2001 - 2200 Pts)', min: 2000, max: 2200, rate: 1700, color: 'text-amber-400 border-amber-500/30' },
];

export function getPlatformLabel(platform: GamingPlatform): string {
  switch (platform) {
    case 'steam':
      return 'Steam (PC)';
    case 'xbox':
      return 'Xbox';
    case 'playstation':
      return 'PlayStation (PS4 / PS5)';
    default:
      return 'Steam (PC)';
  }
}

export function calculateProgressivePrice(initialPoints: number, targetPoints: number): PricingCalculationResult {
  if (isNaN(initialPoints) || isNaN(targetPoints)) {
    return {
      initialPoints: 1200,
      targetPoints: 1800,
      totalPoints: 600,
      totalPrice: 420000,
      slaDays: 4,
      slaText: '4 Hari (Estimasi)',
      breakdown: [],
      isValid: false,
      errorMessage: 'Masukkan angka poin yang valid.',
    };
  }

  if (initialPoints < 1200) {
    return {
      initialPoints,
      targetPoints,
      totalPoints: 0,
      totalPrice: 0,
      slaDays: 0,
      slaText: '-',
      breakdown: [],
      isValid: false,
      errorMessage: 'Poin awal minimal adalah 1200.',
    };
  }

  if (targetPoints > 2200) {
    return {
      initialPoints,
      targetPoints,
      totalPoints: 0,
      totalPrice: 0,
      slaDays: 0,
      slaText: '-',
      breakdown: [],
      isValid: false,
      errorMessage: 'Target poin maksimal adalah 2200.',
    };
  }

  if (targetPoints <= initialPoints) {
    return {
      initialPoints,
      targetPoints,
      totalPoints: 0,
      totalPrice: 0,
      slaDays: 0,
      slaText: '-',
      breakdown: [],
      isValid: false,
      errorMessage: 'Target poin harus lebih tinggi dari poin awal.',
    };
  }

  const totalPoints = targetPoints - initialPoints;
  const breakdown: CalculationBreakdownItem[] = [];
  let totalPrice = 0;

  for (const tier of BRACKET_TIERS) {
    const overlapStart = Math.max(initialPoints, tier.min);
    const overlapEnd = Math.min(targetPoints, tier.max);

    if (overlapEnd > overlapStart) {
      const pointsInBracket = overlapEnd - overlapStart;
      const subtotal = pointsInBracket * tier.rate;
      totalPrice += subtotal;

      breakdown.push({
        tierName: tier.name,
        points: pointsInBracket,
        rate: tier.rate,
        subtotal: subtotal,
      });
    }
  }

  let slaDays = 0;
  if (targetPoints <= 1800) {
    slaDays = Math.ceil(totalPoints / 100) * 1;
  } else {
    slaDays = Math.ceil(totalPoints / 150) * 2;
  }

  // Estimasi pengerjaan dibatasi tidak melebihi 4 hari seberapa banyak pun poin
  slaDays = Math.min(4, Math.max(1, slaDays));
  const slaText = slaDays === 1 ? '1 Hari' : `${slaDays} Hari (Estimasi)`;

  return {
    initialPoints,
    targetPoints,
    totalPoints,
    totalPrice,
    slaDays,
    slaText,
    breakdown,
    isValid: true,
  };
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function generateWhatsAppLink(
  ownerPhone: string,
  customOrderInfo?: { 
    clientName?: string; 
    orderDetails?: string; 
    amount?: string;
    platform?: GamingPlatform;
    hasTransferProof?: boolean;
    promoApplied?: string;
    referralApplied?: string;
  }
): string {
  let cleanPhone = ownerPhone.replace(/\D/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }

  let message = 'Halo Benbalfas, saya mau konfirmasi pemesanan joki eFootball dari website.';
  
  if (customOrderInfo?.clientName && customOrderInfo?.orderDetails) {
    message += `\n\n📌 *Detail Pesanan:*` +
      `\n👤 Nama: ${customOrderInfo.clientName}` +
      (customOrderInfo.platform ? `\n🎮 Platform: ${getPlatformLabel(customOrderInfo.platform)}` : '') +
      `\n⚡️ Layanan: ${customOrderInfo.orderDetails}` +
      (customOrderInfo.promoApplied ? `\n🎁 Promo: ${customOrderInfo.promoApplied}` : '') +
      (customOrderInfo.referralApplied ? `\n🎟️ Referral: ${customOrderInfo.referralApplied}` : '') +
      (customOrderInfo.amount ? `\n💰 Total: ${customOrderInfo.amount}` : '') +
      (customOrderInfo.hasTransferProof ? `\n🧾 Bukti Transfer: Telah dilampirkan` : '') +
      `\n\nSaya standby untuk koordinasi login akun. Terima kasih!`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

// =========================================================================
// SISTEM PROMO RILIS PERDANA (3 KLIEN PERTAMA)
// - Diskon 20% untuk semua kategori (Kalkulator Poin & Paket Standar)
// - Diskon 10% khusus Paket All-In (sultan-phase-clear) & Paket Event Weekend (event-weekend)
// =========================================================================

export interface PromoStatus {
  isActive: boolean;
  totalSlots: number;
  remainingSlots: number;
  claimedSlots: number;
  generalDiscountPercent: number; // 20%
  allInDiscountPercent: number;   // 10%
}

export const PROMO_CONFIG = {
  totalSlots: 3,
  generalDiscountPercent: 20,
  allInDiscountPercent: 10,
  title: 'Promo Spesial Rilis Perdana',
  badgeText: 'Diskon 3 Klien Pertama',
};

export function isTenPercentDiscountPackage(packageId?: string): boolean {
  if (!packageId) return false;
  return packageId === 'sultan-phase-clear' || packageId === 'event-weekend';
}

export function getPromoSlotsClaimed(): number {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem('benbalfas_promo_claimed_count');
  if (saved !== null) {
    const parsed = parseInt(saved, 10);
    return isNaN(parsed) ? 0 : Math.min(PROMO_CONFIG.totalSlots, Math.max(0, parsed));
  }
  return 0; // Default: 0 terpakai (3 slot tersedia)
}

export function getPromoStatus(): PromoStatus {
  const claimed = getPromoSlotsClaimed();
  const remaining = Math.max(0, PROMO_CONFIG.totalSlots - claimed);
  return {
    isActive: remaining > 0,
    totalSlots: PROMO_CONFIG.totalSlots,
    remainingSlots: remaining,
    claimedSlots: claimed,
    generalDiscountPercent: PROMO_CONFIG.generalDiscountPercent,
    allInDiscountPercent: PROMO_CONFIG.allInDiscountPercent,
  };
}

export function claimPromoSlot(): number {
  if (typeof window === 'undefined') return 0;
  const current = getPromoSlotsClaimed();
  if (current < PROMO_CONFIG.totalSlots) {
    const next = current + 1;
    localStorage.setItem('benbalfas_promo_claimed_count', next.toString());
    return next;
  }
  return current;
}

export function resetPromoSlots(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('benbalfas_promo_claimed_count');
}

export interface DiscountCalculation {
  basePrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  isApplied: boolean;
  promoLabel: string;
}

export function calculateDiscount(
  basePrice: number,
  isTenPercentTier: boolean = false,
  forcePromoActive?: boolean
): DiscountCalculation {
  const promoStatus = getPromoStatus();
  const active = forcePromoActive !== undefined ? forcePromoActive : promoStatus.isActive;

  if (!active || basePrice <= 0) {
    return {
      basePrice,
      discountPercent: 0,
      discountAmount: 0,
      finalPrice: basePrice,
      isApplied: false,
      promoLabel: '',
    };
  }

  const discountPercent = isTenPercentTier
    ? PROMO_CONFIG.allInDiscountPercent
    : PROMO_CONFIG.generalDiscountPercent;
  const discountAmount = Math.round((basePrice * discountPercent) / 100);
  const finalPrice = Math.max(0, basePrice - discountAmount);

  return {
    basePrice,
    discountPercent,
    discountAmount,
    finalPrice,
    isApplied: true,
    promoLabel: `Diskon ${discountPercent}% (Promo 3 Klien Pertama)`,
  };
}

// =========================================================================
// SISTEM KODE REFERRAL (JACK EFO)
// - Kode: "jack efo" (case-insensitive)
// - Diskon: Potongan langsung Rp 10.000 (10k)
// - Kuota: 5 Orang (5 Slot)
// =========================================================================

export interface ReferralStatus {
  code: string;
  totalSlots: number;
  remainingSlots: number;
  claimedSlots: number;
  discountAmount: number;
  isActive: boolean;
}

export const REFERRAL_CONFIG = {
  code: 'jack efo',
  totalSlots: 5,
  discountAmount: 10000,
};

export function getReferralSlotsClaimed(): number {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem('benbalfas_referral_claimed_count');
  if (saved !== null) {
    const parsed = parseInt(saved, 10);
    return isNaN(parsed) ? 0 : Math.min(REFERRAL_CONFIG.totalSlots, Math.max(0, parsed));
  }
  return 0;
}

export function getReferralStatus(): ReferralStatus {
  const claimed = getReferralSlotsClaimed();
  const remaining = Math.max(0, REFERRAL_CONFIG.totalSlots - claimed);
  return {
    code: REFERRAL_CONFIG.code,
    totalSlots: REFERRAL_CONFIG.totalSlots,
    remainingSlots: remaining,
    claimedSlots: claimed,
    discountAmount: REFERRAL_CONFIG.discountAmount,
    isActive: remaining > 0,
  };
}

export function validateReferralCode(inputCode: string): {
  isValid: boolean;
  discountAmount: number;
  message: string;
} {
  const cleanInput = inputCode.trim().toLowerCase().replace(/\s+/g, ' ');
  const targetCode = REFERRAL_CONFIG.code.toLowerCase();

  if (!cleanInput) {
    return {
      isValid: false,
      discountAmount: 0,
      message: 'Masukkan kode referral terlebih dahulu.',
    };
  }

  if (cleanInput !== targetCode) {
    return {
      isValid: false,
      discountAmount: 0,
      message: 'Kode referral tidak ditemukan atau salah.',
    };
  }

  const status = getReferralStatus();
  if (status.remainingSlots <= 0) {
    return {
      isValid: false,
      discountAmount: 0,
      message: 'Maaf, kuota kode referral "jack efo" sudah habis (5/5 terpakai).',
    };
  }

  return {
    isValid: true,
    discountAmount: REFERRAL_CONFIG.discountAmount,
    message: `Kode "${REFERRAL_CONFIG.code}" berhasil! Diskon Rp 10.000 diterapkan (Sisa ${status.remainingSlots} slot).`,
  };
}

export function claimReferralSlot(): number {
  if (typeof window === 'undefined') return 0;
  const current = getReferralSlotsClaimed();
  if (current < REFERRAL_CONFIG.totalSlots) {
    const next = current + 1;
    localStorage.setItem('benbalfas_referral_claimed_count', next.toString());
    return next;
  }
  return current;
}

export function resetReferralSlots(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('benbalfas_referral_claimed_count');
}


import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ValuePropositionSection } from './components/ValuePropositionSection';
import { JokiSection } from './components/JokiSection';
import { TrophyRoomSection } from './components/TrophyRoomSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { CheckoutModal } from './components/CheckoutModal';
import { SpreadsheetModal } from './components/SpreadsheetModal';
import { OrderType, GamingPlatform } from './types';
import { Calculator, Sparkles, MessageCircle, Flame, ShieldAlert, LogOut, RotateCcw, FileSpreadsheet } from 'lucide-react';
import { APP_CONFIG } from './config/constants';
import { getPromoStatus, resetPromoSlots, getReferralStatus, resetReferralSlots } from './utils/pricing';
import { subscribeToCloudPromo } from './services/firebase';

export function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'joki' | 'trophy'>('home');
  
  // Theme State: 'dark' | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('benbalfas_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  // Admin Mode State (?admin=benbalfas or stored in localStorage)
  const [isAdmin, setIsAdmin] = useState(false);
  const [promoStatus, setPromoStatus] = useState(getPromoStatus);
  const [referralStatus, setReferralStatus] = useState(getReferralStatus);

  useEffect(() => {
    // 1. Firebase Real-time Cloud Listener (Klaim promo di HP mana pun otomatis update di semua device)
    const unsubCloudPromo = subscribeToCloudPromo((cloudData) => {
      if (typeof cloudData.claimedPromoSlots === 'number') {
        localStorage.setItem('benbalfas_promo_claimed_count', String(cloudData.claimedPromoSlots));
      }
      if (typeof cloudData.claimedReferralSlots === 'number') {
        localStorage.setItem('benbalfas_referral_claimed_count', String(cloudData.claimedReferralSlots));
      }
      setPromoStatus(getPromoStatus());
      setReferralStatus(getReferralStatus());
    });

    // 2. Local Event Listener
    const handlePromoSync = () => {
      setPromoStatus(getPromoStatus());
      setReferralStatus(getReferralStatus());
    };
    window.addEventListener('benbalfas_promo_updated', handlePromoSync);
    window.addEventListener('storage', handlePromoSync);
    return () => {
      if (unsubCloudPromo) unsubCloudPromo();
      window.removeEventListener('benbalfas_promo_updated', handlePromoSync);
      window.removeEventListener('storage', handlePromoSync);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'benbalfas') {
      localStorage.setItem('benbalfas_is_admin', 'true');
      setIsAdmin(true);
    } else if (localStorage.getItem('benbalfas_is_admin') === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const handleResetPromo = () => {
    if (confirm('Kembalikan kuota promo 3 klien pertama ke 3 slot penuh?')) {
      resetPromoSlots();
    }
  };

  const handleResetReferral = () => {
    if (confirm('Kembalikan kuota kode referral ke 5 slot penuh?')) {
      resetReferralSlots();
    }
  };

  const handleExitAdmin = () => {
    localStorage.removeItem('benbalfas_is_admin');
    setIsAdmin(false);
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    window.history.replaceState({}, '', url.pathname);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('benbalfas_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Spreadsheet Modal State (Owner Mode)
  const [isSpreadsheetOpen, setIsSpreadsheetOpen] = useState(false);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutOrderType, setCheckoutOrderType] = useState<OrderType>('points');
  const [checkoutPackageId, setCheckoutPackageId] = useState<string | undefined>('sultan-phase-clear');
  const [checkoutPlatform, setCheckoutPlatform] = useState<GamingPlatform>('steam');
  const [checkoutPointsData, setCheckoutPointsData] = useState<{
    initial: number;
    target: number;
    price: number;
    sla: string;
  } | undefined>(undefined);

  const handleOpenCheckout = (
    type: 'points' | 'package' = 'points',
    packageId?: string,
    pointsData?: { initial: number; target: number; price: number; sla: string },
    platform?: GamingPlatform
  ) => {
    setCheckoutOrderType(type);
    if (packageId) setCheckoutPackageId(packageId);
    if (pointsData) setCheckoutPointsData(pointsData);
    if (platform) setCheckoutPlatform(platform);
    setIsCheckoutOpen(true);
  };

  const adminWhatsAppUrl = `https://wa.me/${APP_CONFIG.adminWhatsApp}?text=${encodeURIComponent(
    'Halo Admin Benbalfas, saya mau tanya-tanya seputar jasa joki eFootball.'
  )}`;

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-[#070A12] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black transition-colors duration-300 efootball-pitch-bg">
      
      {/* Top Banner Notice: Sedikit dibesarkan, Running Text (Seamless Marquee) di Mobile, Static di Desktop */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 py-1.5 text-white shadow-sm overflow-hidden w-full max-w-full">
        {/* Mobile View: Tulisan berjalan terus tanpa henti (Infinite Loop Seamless) */}
        <div className="sm:hidden w-full overflow-hidden flex">
          <div className="animate-marquee flex shrink-0 items-center">
            {/* Block 1 */}
            <div className="flex items-center gap-2.5 shrink-0 pr-8 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 shrink-0 fill-current animate-pulse text-amber-200" />
              <span>
                🔥 PROMO RILIS PERDANA: Diskon 20% (Khusus All-In & Event Weekend 10%) untuk 3 Klien Pertama! — Sisa [{promoStatus.remainingSlots}/3 Slot]
              </span>
              <span className="text-amber-200 font-extrabold mx-1">•</span>
            </div>

            {/* Block 2 (Clone untuk Seamless Loop tanpa jeda) */}
            <div className="flex items-center gap-2.5 shrink-0 pr-8 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 shrink-0 fill-current animate-pulse text-amber-200" />
              <span>
                🔥 PROMO RILIS PERDANA: Diskon 20% (Khusus All-In & Event Weekend 10%) untuk 3 Klien Pertama! — Sisa [{promoStatus.remainingSlots}/3 Slot]
              </span>
              <span className="text-amber-200 font-extrabold mx-1">•</span>
            </div>
          </div>
        </div>

        {/* Desktop View: Diam & Berada di Tengah */}
        <div className="hidden sm:flex items-center justify-center gap-2 text-xs sm:text-sm font-bold tracking-wide text-center px-3">
          <Sparkles className="w-4 h-4 shrink-0 fill-current animate-pulse text-amber-200" />
          <span>
            🔥 PROMO RILIS PERDANA: Diskon 20% (Khusus All-In & Event Weekend 10%) untuk 3 Klien Pertama! — Sisa [{promoStatus.remainingSlots}/3 Slot]
          </span>
        </div>
      </div>

      {/* Floating Admin Toolbar */}
      {isAdmin && (
        <div className="bg-amber-500 text-slate-950 px-3 sm:px-4 py-2 text-xs font-bold flex flex-wrap items-center justify-between gap-2 shadow-lg sticky top-0 z-50 w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="truncate">
              Mode Owner — Promo: {promoStatus.remainingSlots}/{promoStatus.totalSlots} | Referral: {referralStatus.remainingSlots}/{referralStatus.totalSlots} Tersedia
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsSpreadsheetOpen(true)}
              className="flex items-center gap-1 bg-slate-950 text-emerald-400 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-extrabold hover:bg-slate-900 transition border border-emerald-500/30"
              title="Buka data spreadsheet dan kelola pesanan masuk"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Spreadsheet & Joki</span>
            </button>
            <button
              onClick={handleResetPromo}
              className="flex items-center gap-1 bg-slate-900 text-amber-300 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-extrabold hover:bg-slate-800 transition"
              title="Kembalikan kuota promo ke 3 slot penuh"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Promo</span>
            </button>
            <button
              onClick={handleResetReferral}
              className="flex items-center gap-1 bg-slate-900 text-cyan-300 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-extrabold hover:bg-slate-800 transition"
              title="Kembalikan kuota kode referral ke 5 slot penuh"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Referral</span>
            </button>
            <button
              onClick={handleExitAdmin}
              className="shrink-0 flex items-center gap-1 bg-slate-950 text-amber-300 px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-extrabold hover:bg-slate-800 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Owner</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCheckout={handleOpenCheckout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-24 md:pb-12 w-full max-w-full overflow-x-hidden">
        {activeTab === 'home' && (
          <>
            <HeroSection
              onNavigateToJoki={() => {
                setActiveTab('joki');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onNavigateToTrophy={() => {
                setActiveTab('trophy');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenCheckout={handleOpenCheckout}
            />

            <ValuePropositionSection />

            {/* Joki Calculator Section */}
            <JokiSection onOpenCheckout={handleOpenCheckout} />

            {/* Trophy Room Preview */}
            <TrophyRoomSection onOpenCheckout={handleOpenCheckout} isEmbedPreview={true} />

            <FaqSection />
          </>
        )}

        {activeTab === 'joki' && (
          <div className="pt-4">
            <JokiSection onOpenCheckout={handleOpenCheckout} />
            <FaqSection />
          </div>
        )}

        {activeTab === 'trophy' && (
          <div className="pt-4">
            <TrophyRoomSection onOpenCheckout={handleOpenCheckout} />
          </div>
        )}
      </main>

      {/* Mobile Sticky Bottom Floating Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-2.5 bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-2xl">
        <a
          href={adminWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-3 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 active:scale-95 transition"
          title="Chat WhatsApp Admin"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
        </a>

        <button
          onClick={() => {
            setActiveTab('joki');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex-1 py-3 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 dark:border-cyan-500/30 active:scale-95 transition"
        >
          <Calculator className="w-4 h-4" />
          <span>Kalkulator</span>
        </button>

        <button
          onClick={() => handleOpenCheckout('package', 'sultan-phase-clear', undefined, 'steam')}
          className="flex-[1.2] py-3 px-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-display font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-glow-gold active:scale-95 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Paket All-In (135k)</span>
        </button>
      </div>

      {/* Footer */}
      <Footer
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCheckout={() => handleOpenCheckout()}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialOrderType={checkoutOrderType}
        selectedPackageId={checkoutPackageId}
        pointsData={checkoutPointsData}
        initialPlatform={checkoutPlatform}
      />

      {/* Spreadsheet & Order Database Modal (Owner Mode) */}
      <SpreadsheetModal
        isOpen={isSpreadsheetOpen}
        onClose={() => setIsSpreadsheetOpen(false)}
      />

    </div>
  );
}

export default App;

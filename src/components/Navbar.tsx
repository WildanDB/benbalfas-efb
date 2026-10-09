import React, { useState } from 'react';
import { Trophy, Calculator, Menu, X, Sparkles, MessageCircle, Sun, Moon, Zap, ShieldCheck } from 'lucide-react';
import { APP_CONFIG } from '../config/constants';

interface NavbarProps {
  activeTab: 'home' | 'joki' | 'trophy';
  setActiveTab: (tab: 'home' | 'joki' | 'trophy') => void;
  onOpenCheckout: (type?: 'points' | 'package', packageId?: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCheckout,
  theme,
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: 'home' | 'joki' | 'trophy') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const adminWhatsAppUrl = `https://wa.me/${APP_CONFIG.adminWhatsApp}?text=${encodeURIComponent(
    'Halo Admin Benbalfas, saya mau tanya-tanya seputar layanan joki eFootball.'
  )}`;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 dark:bg-[#070A12]/90 border-b border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 shadow-sm dark:shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Brand */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0"
          >
            <div className="relative shrink-0">
              <img 
                src="/images/logo/logo.webp" 
                alt="Benbalfas eFootball Logo" 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover shadow-glow-cyan transform group-hover:scale-105 transition duration-300 border border-slate-200 dark:border-slate-700 bg-slate-900"
              />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#070A12] animate-pulse"></div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition truncate">
                  BENBALFAS
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 shrink-0">
                  TERMURAH & AMAN
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0"></span>
                <span className="truncate">Jasa Joki eFootball Terpercaya #1</span>
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-900/70 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-inner">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'home'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-4 h-4" />
              Beranda
            </button>

            <button
              onClick={() => handleNavClick('joki')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'joki'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-800/60'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Kalkulator & Paket
            </button>

            <button
              onClick={() => handleNavClick('trophy')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'trophy'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md font-bold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/70 dark:hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Trophy Room
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Theme Toggle (Light / Dark Mode) */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Ganti ke Mode Terang (Light)' : 'Ganti ke Mode Gelap (Dark)'}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 text-slate-700 dark:text-amber-300 border border-slate-200 dark:border-slate-800 transition transform hover:scale-105"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Hubungi Admin via WhatsApp Button */}
            <a
              href={adminWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold text-xs sm:text-sm flex items-center gap-2 transition transform hover:scale-105"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Hubungi Admin</span>
            </a>

            {/* Main CTA: Hitung / Pesan Joki */}
            <button
              onClick={() => onOpenCheckout('package', 'sultan-phase-clear')}
              className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs sm:text-sm font-bold rounded-xl group bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500 text-slate-950 shadow-glow-gold hover:scale-105 transition duration-300"
            >
              <span className="relative px-4 py-2.5 rounded-lg flex items-center gap-1.5 font-display font-extrabold text-slate-950">
                <Sparkles className="w-4 h-4" />
                Pesan Paket All-In
              </span>
            </button>
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-amber-300 border border-slate-200 dark:border-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <a
              href={adminWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              title="Hubungi Admin"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] px-4 pt-3 pb-6 space-y-2 animate-fadeIn shadow-xl">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium ${
              activeTab === 'home'
                ? 'bg-cyan-500 text-white font-bold'
                : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/60'
            }`}
          >
            <Zap className="w-5 h-5" />
            Beranda
          </button>

          <button
            onClick={() => handleNavClick('joki')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium ${
              activeTab === 'joki'
                ? 'bg-cyan-500 text-white font-bold'
                : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/60'
            }`}
          >
            <Calculator className="w-5 h-5" />
            Kalkulator & Paket Joki
          </button>

          <button
            onClick={() => handleNavClick('trophy')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium ${
              activeTab === 'trophy'
                ? 'bg-cyan-500 text-white font-bold'
                : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/60'
            }`}
          >
            <Trophy className="w-5 h-5" />
            Trophy Room (Portofolio)
          </button>

          <a
            href={adminWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 font-bold text-sm"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span>Hubungi Admin WhatsApp</span>
          </a>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCheckout('package', 'sultan-phase-clear');
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-display font-extrabold rounded-xl shadow-glow-gold flex items-center justify-center gap-2 text-sm"
            >
              ⭐️ Pesan Paket All-In (Promo 135k)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

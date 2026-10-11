import React from "react";
import { ShieldCheck, MessageCircle, Send, ExternalLink } from "lucide-react";
import { APP_CONFIG } from "../config/constants";
import { TikTokIcon, YouTubeIcon, InstagramIcon } from "./SocialIcons";

interface FooterProps {
  onNavigate: (tab: "home" | "joki" | "trophy") => void;
  onOpenCheckout: () => void;
  onOpenOwnerPanel?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenOwnerPanel }) => {
  return (
    <footer className="bg-slate-900 dark:bg-[#05070a] border-t border-slate-800 text-slate-400 text-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/logo/logo.webp"
                alt="Benbalfas eFootball Logo"
                className="w-10 h-10 rounded-xl object-cover shadow-glow-cyan border border-slate-700 bg-slate-900"
              />
              <span className="font-display font-black text-2xl tracking-tight text-white">
                BENBALFAS
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Layanan digital profesional jasa joki push rank eFootball Divisi 1
              & Sapu Bersih Event Fase. Terpercaya, aman, 100% skill murni, dan
              harga paling ramah kantong.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <a
                href={`https://wa.me/${APP_CONFIG.adminWhatsApp}?text=${encodeURIComponent(
                  "Halo Admin Benbalfas, saya mau tanya-tanya seputar joki eFootball.",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 transition font-semibold"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WA: {APP_CONFIG.adminPhoneFormatted}</span>
              </a>

              <a
                href={APP_CONFIG.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-cyan-400 border border-blue-500/30 flex items-center gap-1.5 transition font-semibold"
              >
                <Send className="w-4 h-4" />
                <span>Telegram: {APP_CONFIG.adminPhoneFormatted}</span>
              </a>
            </div>

            {/* Quick Social Buttons */}
            <div className="pt-2 space-y-2">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Sosial Media Resmi:{" "}
                <span className="text-cyan-300 font-mono">ben balfas</span>
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <a
                  href="https://www.tiktok.com/@benbalfas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700 hover:border-cyan-400/50 text-slate-200 transition flex items-center gap-2 font-medium"
                >
                  <TikTokIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>TikTok</span>
                </a>
                <a
                  href="https://www.youtube.com/@benbalfas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700 hover:border-red-400/50 text-slate-200 transition flex items-center gap-2 font-medium"
                >
                  <YouTubeIcon className="w-3.5 h-3.5 text-red-500" />
                  <span>YouTube</span>
                </a>
                <a
                  href="https://www.instagram.com/benbalfas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700 hover:border-pink-400/50 text-slate-200 transition flex items-center gap-2 font-medium"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white text-sm">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate("home")}
                  className="hover:text-cyan-400 transition"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("joki")}
                  className="hover:text-cyan-400 transition"
                >
                  Kalkulator Poin Progresif
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("joki")}
                  className="hover:text-cyan-400 transition"
                >
                  Paket Hemat Instan (All-In)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate("trophy")}
                  className="hover:text-cyan-400 transition"
                >
                  Trophy Room & Portofolio
                </button>
              </li>
              {onOpenOwnerPanel && (
                <li>
                  <button
                    onClick={onOpenOwnerPanel}
                    className="hover:text-amber-400 text-slate-500 transition flex items-center gap-1.5 cursor-pointer pt-1"
                    title="Akses khusus Owner Ben Balfas untuk mengelola Database Cloud"
                  >
                    <span>🔒 Portal Owner (Database Cloud)</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Security Notice */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white text-sm">
              Jaminan Keamanan
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Anti-Banned Certified</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero Bot / Zero Mod APK</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Handover OTP Standby WhatsApp</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Showcase Media Sosial Resmi Ben Balfas */}
        <div className="border-t border-slate-800/80 pt-8 pb-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  Kanal Resmi & Media Sosial
                </span>
              </div>
              <h3 className="font-display font-black text-lg sm:text-xl text-white mt-1">
                Kunjungi Akun Resmi{" "}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  "Ben Balfas"
                </span>
              </h3>
            </div>
            <p className="text-slate-400 text-xs sm:text-right max-w-md">
              Semua platform resmi menggunakan nama identik{" "}
              <span className="text-cyan-300 font-bold font-mono">
                ben balfas
              </span>{" "}
              untuk menjamin keaslian dan keamanan Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* TikTok Card */}
            <a
              href="https://www.tiktok.com/@benbalfas"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-400/50 transition-all duration-300 flex items-center justify-between shadow-sm hover:shadow-cyan-500/10 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-transform shadow-inner shrink-0">
                  <TikTokIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-bold text-sm text-white">
                      TikTok
                    </span>
                  </div>
                  <p className="text-xs text-cyan-400 font-mono font-bold">
                    ben balfas
                  </p>
                  <p className="text-[10px] text-slate-400">@benbalfas</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition shrink-0" />
            </a>

            {/* YouTube Card */}
            <a
              href="https://www.youtube.com/@benbalfas"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-red-500/50 transition-all duration-300 flex items-center justify-between shadow-sm hover:shadow-red-500/10 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 group-hover:text-red-400 group-hover:scale-110 transition-transform shadow-inner shrink-0">
                  <YouTubeIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-bold text-sm text-white">
                      YouTube
                    </span>
                  </div>
                  <p className="text-xs text-red-400 font-mono font-bold">
                    ben balfas
                  </p>
                  <p className="text-[10px] text-slate-400">@benbalfas</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition shrink-0" />
            </a>

            {/* Instagram Card */}
            <a
              href="https://www.instagram.com/benbalfas"
              target="_blank"
              rel="noopener noreferrer"
              className="group p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-pink-500/50 transition-all duration-300 flex items-center justify-between shadow-sm hover:shadow-pink-500/10 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:text-pink-300 group-hover:scale-110 transition-transform shadow-inner shrink-0">
                  <InstagramIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-bold text-sm text-white">
                      Instagram
                    </span>
                  </div>
                  <p className="text-xs text-pink-400 font-mono font-bold">
                    ben balfas
                  </p>
                  <p className="text-[10px] text-slate-400">@benbalfas</p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-pink-400 transition shrink-0" />
            </a>
          </div>
        </div>

        {/* Bottom Legal Notice */}
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>
            © {new Date().getFullYear()} Benbalfas eFootball Services. All
            rights reserved.
          </p>
          <p className="text-center sm:text-right">
            Disclaimer: eFootball™ adalah merek dagang terdaftar milik Konami
            Digital Entertainment. Layanan ini adalah penyedia jasa waktu
            independen.
          </p>
        </div>
      </div>
    </footer>
  );
};

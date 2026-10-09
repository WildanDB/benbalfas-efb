import React from 'react';
import { ShieldCheck, Calculator, Zap, Check, X, CheckCircle } from 'lucide-react';

export const ValuePropositionSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-slate-100/70 dark:bg-[#0a0f18]/60 border-y border-slate-200/80 dark:border-slate-800/80 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
            3 Keunggulan Benbalfas
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight">
            Kenapa Ratusan Pemain Memilih <span className="bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500 bg-clip-text text-transparent">Benbalfas?</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
            Push rank eFootball anti-pusing tanpa perlu takut dibanned. Kami prioritaskan keamanan akun, kejujuran harga, dan gameplay murni skill.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-16">
          
          {/* Pillar 1: Jaminan Keamanan Mutlak */}
          <div className="relative group rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900/80 border border-emerald-500/30 hover:border-emerald-500/60 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-emerald-500/10">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 mb-3 border border-emerald-500/30">
              100% MURNI SKILL
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">
              Jaminan 100% Aman & Anti-Ban
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Akun Anda aman bersama kami. Koneksi IP lokal Indonesia yang stabil, device resmi, dan zero cheat/mod. Kredensial akun dienkripsi ketat.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Handover OTP Langsung via WhatsApp Admin</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Tanpa Bot / Auto-Clicker / Mod APK</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Data Login Dihapus Otomatis Pasca Selesai</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2: Harga Termurah & Transparan */}
          <div className="relative group rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900/80 border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-cyan-500/10">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <Calculator className="w-8 h-8" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 mb-3 border border-cyan-500/30">
              HARGA TERMURAH
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">
              Harga Termurah & Transparan
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Mulai dari Rp 700 per poin! Anda hanya membayar selisih poin yang dimainkan dengan kalkulator otomatis tanpa biaya siluman.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>Kalkulator Hitung Poin Otomatis</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>Rincian Biaya per Bracket Terbuka</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyan-500 shrink-0" />
                <span>Paket Hemat All-In Termasuk Event</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3: Cepat & SLA Terukur */}
          <div className="relative group rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900/80 border border-amber-500/30 hover:border-amber-500/60 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-amber-500/10">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
              <Zap className="w-8 h-8" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 mb-3 border border-amber-500/30">
              SLA TERUKUR
            </div>
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white mb-2">
              Pengerjaan Cepat & Bergaransi
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
              Estimasi waktu pengerjaan pasti dan cepat. Update riwayat match berkala dan garansi uang kembali jika target poin gagal dicapai.
            </p>
            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Selesai Cepat (Hitungan Jam s/d 2 Hari)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Laporan Match History & Win Rate &gt;90%</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Garansi Uang Kembali 100%</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Comparison Table */}
        <div className="rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden shadow-sm dark:shadow-md">
          <div className="mb-6">
            <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Perbandingan: Benbalfas vs Joki Abal-Abal
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Jangan pertaruhkan akun eFootball berharga Anda pada joki murahan yang rawan banned.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                  <th className="py-3 px-4">Fitur & Layanan</th>
                  <th className="py-3 px-4 text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30 rounded-t-xl font-bold">⚡️ BENBALFAS</th>
                  <th className="py-3 px-4 text-slate-400 dark:text-slate-500">Joki Abal-Abal / Anonim</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/60">
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">Metode Gameplay</td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold bg-cyan-50/50 dark:bg-cyan-950/20">
                    <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> 100% Murni Skill Mekanik</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 text-red-500"><X className="w-4 h-4" /> Rawan Mod Scripting / Lag Switch</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">Transparansi Biaya</td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold bg-cyan-50/50 dark:bg-cyan-950/20">
                    <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> Tarif Jelas Mulai 700/Poin</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 text-red-500"><X className="w-4 h-4" /> Nembak Harga & Biaya Tambahan</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">Keamanan OTP 2FA</td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-bold bg-cyan-50/50 dark:bg-cyan-950/20">
                    <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-500" /> WhatsApp Handover Standby</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 text-red-500"><X className="w-4 h-4" /> Respon Lambat & Akun Tertahan</span>
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">Event Phase Clear</td>
                  <td className="py-3.5 px-4 text-amber-600 dark:text-amber-400 font-bold bg-cyan-50/50 dark:bg-cyan-950/20">
                    <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-amber-500" /> Include di Paket All-In (150k)</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5 text-red-500"><X className="w-4 h-4" /> Dihitung Biaya Terpisah Mahal</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};

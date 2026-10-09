import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Plus, Trash2, Edit3, X, ExternalLink, RotateCcw, Copy } from 'lucide-react';
import { CaseStudy } from '../types';
import { INITIAL_CASE_STUDIES } from '../data/mockData';

export const sanitizeImagePath = (src?: string) => {
  if (!src) return '/images/logo/logo.webp';
  if (src.startsWith('/public/')) return src.replace('/public/', '/');
  return src;
};

interface TrophyRoomSectionProps {
  onOpenCheckout: (type?: 'points' | 'package', packageId?: string) => void;
  isEmbedPreview?: boolean;
}

export const TrophyRoomSection: React.FC<TrophyRoomSectionProps> = ({
  onOpenCheckout,
  isEmbedPreview = false,
}) => {
  // Check if owner activated secret admin mode (?admin=benbalfas)
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'benbalfas' || localStorage.getItem('benbalfas_is_admin') === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const CURRENT_INITIAL_FINGERPRINT = JSON.stringify(INITIAL_CASE_STUDIES);

  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>(() => {
    const savedFingerprint = localStorage.getItem('benbalfas_trophy_fingerprint');
    const saved = localStorage.getItem('benbalfas_trophy_data');

    // If mockData.ts has changed (or first time with fingerprint tracking),
    // automatically discard stale cache and prioritize latest mockData.ts!
    if (savedFingerprint !== CURRENT_INITIAL_FINGERPRINT) {
      localStorage.removeItem('benbalfas_trophy_data');
      localStorage.setItem('benbalfas_trophy_fingerprint', CURRENT_INITIAL_FINGERPRINT);
      return INITIAL_CASE_STUDIES;
    }

    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_CASE_STUDIES;
      }
    }
    return INITIAL_CASE_STUDIES;
  });

  // Hot reload sync: Automatically sync when INITIAL_CASE_STUDIES in mockData.ts changes
  useEffect(() => {
    const savedFingerprint = localStorage.getItem('benbalfas_trophy_fingerprint');
    if (savedFingerprint !== CURRENT_INITIAL_FINGERPRINT) {
      localStorage.removeItem('benbalfas_trophy_data');
      localStorage.setItem('benbalfas_trophy_fingerprint', CURRENT_INITIAL_FINGERPRINT);
      setCaseStudies(INITIAL_CASE_STUDIES);
    }
  }, [CURRENT_INITIAL_FINGERPRINT]);


  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);

  // Light CMS Modal state (Owner Only)
  const [isCmsOpen, setIsCmsOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Partial<CaseStudy> | null>(null);

  const filteredCases = isEmbedPreview
    ? caseStudies.slice(0, 3)
    : caseStudies;

  const handleSaveCaseStudy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCase?.title) return;

    let updated: CaseStudy[];
    if (editingCase.id) {
      // Update
      updated = caseStudies.map((c) => (c.id === editingCase.id ? (editingCase as CaseStudy) : c));
    } else {
      // Create new
      const newCase: CaseStudy = {
        id: 'cs-' + Date.now(),
        title: editingCase.title || 'Push Divisi 1 Match',
        clientName: editingCase.clientName || 'Klien Benbalfas',
        initialRating: Number(editingCase.initialRating) || 1400,
        targetRating: Number(editingCase.targetRating) || 1850,
        division: editingCase.division || 'Divisi 1',
        winStreak: Number(editingCase.winStreak) || 10,
        winRate: editingCase.winRate || '90%',
        slaActual: editingCase.slaActual || '1 Hari',
        tactics: editingCase.tactics || 'Meta 4-2-2-2 Formation',
        description: editingCase.description || 'Penjelasan proses push match dan taktik formasi.',
        image: sanitizeImagePath(editingCase.image || '/images/trophy/paman.webp'),
        tags: editingCase.tags || ['Divisi 1', 'Win-Streak'],
        date: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        clientFeedback: editingCase.clientFeedback,
      };
      updated = [newCase, ...caseStudies];
    }

    setCaseStudies(updated);
    localStorage.setItem('benbalfas_trophy_data', JSON.stringify(updated));
    localStorage.setItem('benbalfas_trophy_fingerprint', CURRENT_INITIAL_FINGERPRINT);
    setEditingCase(null);
    setIsCmsOpen(false);
  };

  const handleDeleteCaseStudy = (id: string) => {
    if (confirm('Hapus studi kasus portofolio ini?')) {
      const updated = caseStudies.filter((c) => c.id !== id);
      setCaseStudies(updated);
      localStorage.setItem('benbalfas_trophy_data', JSON.stringify(updated));
      localStorage.setItem('benbalfas_trophy_fingerprint', CURRENT_INITIAL_FINGERPRINT);
      if (selectedCase?.id === id) setSelectedCase(null);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Kembalikan ke data bawaan mockData.ts?')) {
      localStorage.removeItem('benbalfas_trophy_data');
      localStorage.setItem('benbalfas_trophy_fingerprint', CURRENT_INITIAL_FINGERPRINT);
      setCaseStudies(INITIAL_CASE_STUDIES);
      alert('Data Trophy Room berhasil disinkronkan kembali ke mockData.ts!');
    }
  };

  const handleCopyCode = () => {
    const code = `export const INITIAL_CASE_STUDIES: CaseStudy[] = ${JSON.stringify(caseStudies, null, 2)};`;
    navigator.clipboard.writeText(code);
    alert('Kode portofolio berhasil disalin! Anda bisa langsung mem-paste isi kode ke src/data/mockData.ts');
  };

  return (
    <section id="trophy" className="py-16 sm:py-24 relative overflow-hidden bg-slate-100/60 dark:bg-[#0a0f18]/90 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      
      {/* Background radial */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Trophy className="w-3.5 h-3.5" />
              Trophy Room & Portofolio
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight">
              Bukti Nyata <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">Kemenangan Klien</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2 max-w-2xl">
              Etalase analisis formasi meta 4-2-2-2/4-3-3, rekor win-streak tanpa kalah, dan akun-akun yang berhasil tembus Divisi 1 dengan aman.
            </p>
          </div>

          {/* Action Buttons: ONLY visible if owner opened ?admin=benbalfas */}
          {isAdmin && !isEmbedPreview && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleResetDefaults}
                title="Muat ulang dan sinkronkan data dari file src/data/mockData.ts"
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-500" />
                Sinkron mockData.ts
              </button>
              <button
                onClick={handleCopyCode}
                title="Salin data CMS ini dalam format TypeScript untuk di-paste ke mockData.ts"
                className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Copy className="w-3.5 h-3.5 text-purple-400" />
                Salin Kode TS
              </button>
              <button
                onClick={() => {
                  setEditingCase({
                    title: '',
                    clientName: 'Rian (Jakarta)',
                    initialRating: 1500,
                    targetRating: 1900,
                    division: 'Divisi 1 Guaranteed',
                    winStreak: 12,
                    winRate: '92%',
                    slaActual: '1 Hari',
                    tactics: 'Quick Counter 4-2-2-2',
                    description: '',
                    image: '/images/trophy/paman.webp',
                    tags: ['Divisi 1', 'Win Streak', 'Meta Tactic'],
                  });
                  setIsCmsOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Portofolio
              </button>
            </div>
          )}
        </div>



        {/* Grid of Case Studies */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCases.map((cs) => (
            <div
              key={cs.id}
              className="group relative rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 transition-all duration-300 shadow-sm hover:shadow-xl flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Image Screenshot Card */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={sanitizeImagePath(cs.image)}
                    alt={cs.title}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/logo/logo.webp';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-400 text-black shadow-md flex items-center gap-1">
                      <Flame className="w-3 h-3 fill-current" />
                      Win-Streak: {cs.winStreak}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-900/90 text-cyan-300 border border-slate-700">
                      WR: {cs.winRate}
                    </span>
                  </div>

                  {/* Rating Boost Overlay */}
                  <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-right">
                    <p className="text-[10px] text-slate-400 font-mono">Rating Naik</p>
                    <p className="text-xs font-bold text-emerald-400 font-mono">
                      {cs.initialRating} → {cs.targetRating} Pts
                    </p>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono uppercase tracking-wider font-semibold">
                      {cs.division} • {cs.date}
                    </span>
                    <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mt-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition line-clamp-2">
                      {cs.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {cs.description}
                  </p>

                  {/* Tactical Meta pill */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold">⚽️ Taktik:</span>
                    <span className="font-mono text-[11px] truncate">{cs.tactics}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {cs.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-[10px] font-mono border border-slate-200 dark:border-slate-700/60"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  {/* Client Feedback quote if any */}
                  {cs.clientFeedback && (
                    <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/20 text-xs text-slate-700 dark:text-slate-300 italic">
                      {cs.clientFeedback}
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono not-italic mt-1 text-right">— {cs.clientName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800/60 mt-2">
                <button
                  onClick={() => setSelectedCase(cs)}
                  className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Lihat Detail Taktik
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                {/* Edit & Delete ONLY visible for owner */}
                {isAdmin && !isEmbedPreview && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingCase(cs);
                        setIsCmsOpen(true);
                      }}
                      title="Edit Portofolio"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-cyan-500"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCaseStudy(cs.id)}
                      title="Hapus"
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>

        {/* Bottom CTA for Trophy Room */}
        {isEmbedPreview ? (
          <div className="mt-12 text-center">
            <button
              onClick={() => onOpenCheckout('package', 'sultan-phase-clear')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-display font-extrabold text-sm shadow-glow-gold hover:scale-105 transition inline-flex items-center gap-2"
            >
              ⭐️ Mau Akun Anda Tembus Divisi 1 Seperti Ini? Pesan Sekarang
            </button>
          </div>
        ) : (
          isAdmin && (
            <div className="mt-12 flex justify-between items-center flex-wrap gap-4 text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-6">
              <p>Mode Admin Aktif. Perubahan tersimpan di browser Anda.</p>
              <button
                onClick={handleResetDefaults}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white underline cursor-pointer"
              >
                Reset ke Portofolio Bawaan
              </button>
            </div>
          )
        )}

      </div>

      {/* Detail Case Study Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-cyan-500/40 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-cyan-600 dark:text-cyan-400 font-mono uppercase font-bold">{selectedCase.division}</span>
                <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1">{selectedCase.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedCase.clientName} • Selesai: {selectedCase.slaActual}</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden max-h-64 bg-slate-950">
              <img
                src={sanitizeImagePath(selectedCase.image)}
                alt={selectedCase.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/logo/logo.webp';
                }}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 font-mono">Win Streak</p>
                <p className="text-lg font-bold text-amber-500 font-mono">{selectedCase.winStreak} Match 🔥</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 font-mono">Win Rate</p>
                <p className="text-lg font-bold text-emerald-500 font-mono">{selectedCase.winRate}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <p className="text-[10px] text-slate-500 font-mono">Rating Final</p>
                <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400 font-mono">{selectedCase.targetRating} Pts</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                🧠 Analisis Taktik & Eksekusi:
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/70 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                {selectedCase.description}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setSelectedCase(null);
                  onOpenCheckout('package', 'sultan-phase-clear');
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold shadow-glow-cyan"
              >
                Pesan Joki Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Light CMS Modal (Owner Only) */}
      {isAdmin && isCmsOpen && editingCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white">
                {editingCase.id ? 'Edit Portofolio' : 'Tambah Portofolio Baru'}
              </h3>
              <button
                onClick={() => setIsCmsOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCaseStudy} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Judul Portofolio</label>
                <input
                  type="text"
                  required
                  value={editingCase.title || ''}
                  onChange={(e) => setEditingCase({ ...editingCase, title: e.target.value })}
                  placeholder="Misal: Push 1950 ke 2100 dengan Perubahan Meta 4-2-2-2"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Nama Klien</label>
                  <input
                    type="text"
                    value={editingCase.clientName || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, clientName: e.target.value })}
                    placeholder="Farhan (Surabaya)"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Divisi Target</label>
                  <input
                    type="text"
                    value={editingCase.division || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, division: e.target.value })}
                    placeholder="Divisi 1 Top 1000"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Poin Awal</label>
                  <input
                    type="number"
                    value={editingCase.initialRating || 1400}
                    onChange={(e) => setEditingCase({ ...editingCase, initialRating: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Target Poin</label>
                  <input
                    type="number"
                    value={editingCase.targetRating || 1850}
                    onChange={(e) => setEditingCase({ ...editingCase, targetRating: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Win Streak</label>
                  <input
                    type="number"
                    value={editingCase.winStreak || 10}
                    onChange={(e) => setEditingCase({ ...editingCase, winStreak: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Taktik Formasi Meta</label>
                <input
                  type="text"
                  value={editingCase.tactics || ''}
                  onChange={(e) => setEditingCase({ ...editingCase, tactics: e.target.value })}
                  placeholder="Quick Counter 4-2-2-2 (Dual AMF)"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">URL Gambar Screenshot</label>
                <input
                  type="text"
                  value={editingCase.image || ''}
                  onChange={(e) => setEditingCase({ ...editingCase, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-slate-700 dark:text-slate-300 font-semibold block mb-1">Deskripsi & Proses Joki</label>
                <textarea
                  rows={3}
                  value={editingCase.description || ''}
                  onChange={(e) => setEditingCase({ ...editingCase, description: e.target.value })}
                  placeholder="Jelaskan bagaimana proses joki dan perubahan formasi berhasil tembus..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCmsOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 text-white font-bold shadow-md"
                >
                  Simpan Portofolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
};

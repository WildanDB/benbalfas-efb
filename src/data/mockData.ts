import { JokiPackage, CaseStudy, RecentJoki } from "../types";

export const INITIAL_RECENT_JOKIS: RecentJoki[] = [
  {
    id: "rj-1",
    clientName: "I'm paman (Papua)",
    packageName: "Push Poin Progresif (1710 ➔ 1810)",
    initialRating: 1710,
    targetRating: 1810,
    status: "Selesai",
    duration: "2 Jam",
    date: "Kemarin",
    winStreak: 5,
  },
  {
    id: "rj-2",
    clientName: "Ervanza (Jakarta)",
    packageName: "Push Poin Progresif (1734 ➔ 1846)",
    initialRating: 1734,
    targetRating: 1846,
    status: "Selesai",
    duration: "2 Jam",
    date: "Kemarin",
    winStreak: 8,
  },
  {
    id: "rj-3",
    clientName: "MNP (Subang)",
    packageName: "Paket Hard Carry (Div 3 ➔ 1)",
    initialRating: 1417,
    targetRating: 1816,
    status: "Selesai",
    duration: "2 Hari",
    date: "5 Hari Lalu",
    winStreak: 9,
  },
  {
    id: "rj-4",
    clientName: "Eko Wibowo (Sumsel)",
    packageName: "Push High MMR (1850 ➔ 2005)",
    initialRating: 1550,
    targetRating: 2005,
    status: "Selesai",
    duration: "2 Hari",
    date: "7 Hari Lalu",
    winStreak: 14,
  },
];

export const PACKAGES_DATA: JokiPackage[] = [
  {
    id: "fast-track",
    title: "Paket Fast Track",
    badge: "Termurah & Cepat",
    subtitle: "Divisi 2 ke Divisi 1",
    price: 90000,
    formattedPrice: "Rp 90.000",
    sla: "1 - 2 Hari",
    isPopular: false,
    isDecoy: false,
    colorTheme: "blue",
    benefits: [
      "Garansi Tembus Divisi 1 (Rating 1800+)",
      "100% Skill Murni, Anti-Scripting & Anti-Banned",
      "Harga Paling Ramah Kantong di Kelasnya",
      "Update Progres Tiap Selesai Sesi Match",
      "Estimasi Waktu Pengerjaan 1-2 Hari",
      "🛡️ Proteksi IP & Keamanan Akun 100% Garansi Anti-Banned",
    ],
    ctaText: "Pilih Fast Track (90k)",
  },
  {
    id: "hard-carry",
    title: "Paket Hard Carry",
    badge: "Deep Push (Hemat)",
    subtitle: "Divisi 3 ke Divisi 1",
    price: 130000,
    formattedPrice: "Rp 130.000",
    sla: "2 - 4 Hari",
    isPopular: false,
    isDecoy: true,
    colorTheme: "purple",
    benefits: [
      "Garansi Tembus Divisi 1 dari Divisi 3",
      "100% Skill Murni Tanpa Cheat/Bot/VPN Anomali",
      "Penyesuaian Taktik Meta & Review Skuad Klien",
      "Pelaporan Match History & Win-Rate",
      "Estimasi Waktu Pengerjaan 2-3 Hari",
      "🛡️ Proteksi IP & Keamanan Akun 100% Garansi Anti-Banned",
    ],
    ctaText: "Pilih Hard Carry (130k)",
  },
  {
    id: "sultan-phase-clear",
    title: "Paket All-In (1 Phase Clear)",
    badge: "⭐️ PALING LARIS • ALL-IN EVENT",
    subtitle: "Divisi 1 + Sapu Bersih Seluruh Event Fase",
    price: 150000,
    formattedPrice: "Rp 150.000",
    sla: "Sesuai Sisa Hari Fase Game",
    isPopular: true,
    colorTheme: "gold",
    benefits: [
      "⭐️ Garansi Tembus Divisi 1 (Target Rating Bebas Request)",
      "🏆 SAPU BERSIH Seluruh Event Tour, Challenge, & Skill Training Fase Berjalan",
      "⚡️ Dapatkan Seluruh Hadiah Koin eFootball, GP, & Booster Token",
      "🧠 Konsultasi Eksklusif: Racikan Build Pemain & Taktik Rahasia Meta Pro Player",
      "🪙 Mendapatkan up to 500 Koin",
      "🔒 Prioritas Jalur Express & Handover Akun Prioritas VIP",
      "🛡️ Proteksi IP & Keamanan Akun 100% Garansi Anti-Banned",
    ],
    ctaText: "🔥 Ambil Paket All-In (150k)",
  },
];

export const INITIAL_CASE_STUDIES: CaseStudy[] = [
  {
    id: "cs-1",
    title: "Push 1710 ke 1810 dengan Perubahan Meta 4-1-3-2",
    clientName: "I'm Paman (Papua)",
    initialRating: 1710,
    targetRating: 1810,
    division: "Divisi 1 Guaranteed",
    winStreak: 5,
    winRate: "92.7%",
    slaActual: "2.5 Jam (Selesai Cepat)",
    tactics: "Quick Counter 4-1-3-2",
    description:
      "Klien sempat stuck 3 minggu di kisaran 1700 karena scripting eFootball update terbaru. Kami merombak build individual booster dan instruksi bertahan. Akun tembus rating 1810 dengan 5 kemenangan beruntun tanpa kalah.",
    image: "/images/trophy/paman.webp",
    tags: ["Rating 1800+", "Win-Streak 5", "Anti-Scripting", "Meta 4-1-3-2"],
    date: "Oktober 2026",
    clientFeedback:
      '"Gila sih rapih banget mainnya, harganya murah tapi servisnya bintang 5. Formasi juga jadi enak banget dipake main sendiri. Recommended banget!"',
  },
  {
    id: "cs-2",
    title:
      "Paket All-In: Divisi 3 ke Divisi 1 + Sapu Bersih Seluruh Event 100%",
    clientName: "Ervanza (Jakarta)",
    initialRating: 1734,
    targetRating: 1846,
    division: "Divisi 1 Guaranteed",
    winStreak: 11,
    winRate: "82.2%",
    slaActual: "2 Jam (Selesai Cepat)",
    tactics: "Overload 4-1-3-2 ",
    description:
      "Klien ingin dapatkan hadiah divisi dan divisi akan di reset keesokan harinya.",
    image: "/images/trophy/ervanza.webp",
    tags: [
      "Win-Streak 11",
      "Divisi 1 Guaranteed",
      "Hadiah divisi",
      "overload meta",
    ],
    date: "Oktober 2026",
    clientFeedback: '"Mantap joki selesai cepat, terima kasih ben balfas!."',
  },
  {
    id: "cs-3",
    title: "Fast Track: Divisi 2 ke Divisi 1 Hanya Dalam 18 Match",
    clientName: "Eko Wibowo (Sumsel)",
    initialRating: 1550,
    targetRating: 2005,
    division: "Top Tier Divisi 1",
    winStreak: 14,
    winRate: "93.9%",
    slaActual: "2 Hari (Selesai Cepat)",
    tactics: "Quick Counter 4-1-2-3 ",
    description:
      "Mengoptimalkan build kartu Epic booster klien dan menyesuaikan formasi meta 4-1-2-3. Akun berhasil tembus Top Tier Divisi 1 dengan 14 kemenangan beruntun.",
    image: "/images/trophy/eko.webp",
    tags: ["Top Tier", "Quick Counter meta", "Racik Susun", "Win-Streak 14"],
    date: "September 2026",
    clientFeedback:
      '"Cepat dan ramah kantong. Cuma 2 hari udah sampe top tier. Rekomended buat siapa saja yang mau rank naik tanpa pusing."',
  },
];

export const VALUE_PROPOSITIONS = [
  {
    title: "Jaminan 100% Aman & Terpercaya",
    subtitle: "Garansi Anti-Banned & IP Bersih",
    description:
      "Akun Anda kami kelola menggunakan device terverifikasi tanpa cheat, bot, mod APK, atau scripting. 100% murni skill pro player.",
    icon: "ShieldCheck",
    badge: "100% Aman",
  },
  {
    title: "Harga Termurah & Transparan",
    subtitle: "Mulai Rp 700 / Poin & Paket Hemat",
    description:
      "Hitung kebutuhan poin Anda dengan kalkulator transparan. Tidak ada biaya siluman atau pungutan biaya aneh di tengah pengerjaan.",
    icon: "Calculator",
    badge: "Paling Hemat",
  },
  {
    title: "Cepat, Bergaransi & Anti-Scripting",
    subtitle: "SLA Terukur & Handover OTP Mudah",
    description:
      "Estimasi waktu pengerjaan pasti dan cepat. Update progres rutin dan sistem handover OTP WhatsApp langsung responsif.",
    icon: "Zap",
    badge: "SLA Cepat",
  },
];

export const FAQS = [
  {
    question: "Apakah harga joki di Benbalfas terjangkau dan transparan?",
    answer:
      "Sangat terjangkau! Kami menyediakan sistem kalkulator poin progresif mulai dari Rp 700/poin dan pilihan paket instan hemat mulai dari Rp 90.000. Anda hanya membayar sesuai kebutuhan tanpa ada biaya tambahan tersembunyi.",
  },
  {
    question: "Bagaimana alur pengisian OTP (Verifikasi 2 Langkah Konami)?",
    answer:
      "Setelah mengisi formulir dan transfer pembayaran, Anda langsung terhubung ke WhatsApp Admin Benbalfas. Saat admin login ke ID Anda, admin akan mengabari via WhatsApp agar Anda dapat memberikan 6 digit kode OTP yang masuk ke email. Proses cepat dan aman!",
  },
  {
    question: "Apakah akun saya dijamin aman dari risiko banned?",
    answer:
      "100% Aman dan Bergaransi. Kami menggunakan koneksi IP lokal Indonesia yang stabil, device resmi tanpa root/jailbreak, dan murni mengandalkan skill mekanik pro player tanpa bantuan cheat/scripting game apa pun.",
  },
  {
    question: "Berapa lama estimasi pengerjaan pesanan joki saya?",
    answer:
      "Estimasi pengerjaan otomatis dihitung berdasarkan poin atau paket yang Anda pilih. Untuk paket Fast Track rata-rata selesai dalam 1-2 hari (bahkan bisa dalam hitungan jam tergantung antrean).",
  },
  {
    question: "Mengapa Paket All-In (150k) sangat direkomendasikan?",
    answer:
      "Dengan selisih harga yang sangat sedikit, Paket All-In memberikan keuntungan menyeluruh: Garansi Tembus Divisi 1 ditambah klaim seluruh hadiah koin eFootball, GP, dan booster token dari semua Event Fase tanpa perlu Anda capek grinding!",
  },
  {
    question: "Bagaimana jika target poin tidak tercapai sesuai estimasi?",
    answer:
      "Kami memberikan Garansi Uang Kembali 100% proporsional jika terjadi kegagalan target di luar kendali teknis maintenance Konami.",
  },
  {
    question: "Apa nomor kontak dan akun sosial media resmi Ben Balfas?",
    answer:
      "Transaksi dan komunikasi resmi Ben Balfas HANYA melalui nomor WhatsApp dan Telegram 0821-2190-2700. Seluruh akun sosial media resmi kami di TikTok, YouTube, dan Instagram semuanya menggunakan nama 'ben balfas'. Selalu pastikan Anda bertransaksi langsung melalui nomor resmi kami untuk keamanan 100%.",
  },
];

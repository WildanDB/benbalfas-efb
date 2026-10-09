// Konfigurasi Utama Website Benbalfas eFootball Services
// Ubah data di sini untuk update nomor WhatsApp, Telegram, Rekening Bank, dan Sosial Media.

export const APP_CONFIG = {
  // Nomor Kontak Resmi WhatsApp & Telegram Admin
  adminPhone: "082121902700",
  adminWhatsApp: "6282121902700", // Format WhatsApp API: 6282121902700
  adminPhoneFormatted: "0821-2190-2700",

  // Telegram Admin Resmi
  telegramPhone: "082121902700",
  telegramUsername: "benbalfas",
  telegramUrl: "https://t.me/+6282121902700",

  // Akun Sosial Media Resmi Ben Balfas
  socialMedia: [
    {
      platform: "TikTok",
      name: "TikTok",
      handle: "ben balfas",
      username: "@benbalfas",
      url: "https://www.tiktok.com/@benbalfas",
      color: "hover:text-pink-400 hover:border-pink-500/40",
    },
    {
      platform: "YouTube",
      name: "YouTube",
      handle: "ben balfas",
      username: "@benbalfas",
      url: "https://www.youtube.com/@benbalfas",
      color: "hover:text-red-400 hover:border-red-500/40",
    },
    {
      platform: "Instagram",
      name: "Instagram (IG)",
      handle: "ben balfas",
      username: "@benbalfas",
      url: "https://www.instagram.com/benbalfas",
      color: "hover:text-purple-400 hover:border-purple-500/40",
    },
  ],

  // Telegram Bot Alert (Untuk notifikasi pesanan masuk otomatis)
  telegramBotToken: "", // Masukkan bot token jika ingin webhook aktif
  telegramChatId: "", // Masukkan chat ID telegram admin

  // Integrasi Google Spreadsheet (Webhook Real-time ke Google Drive Ben Balfas Aset)
  // Masukkan URL Google Apps Script Web App jika ingin data langsung terkirim otomatis
  googleSheetWebhookUrl:
    "https://script.google.com/macros/s/AKfycbwgaLTxPmH1W_fzdmZsm8F3o8QL20GoECyzXB8bsktqcqZ9SZhlEyOjAusbepqAwKzEQg/exec",

  // Rekening Pembayaran Resmi (Saat ini BCA & Mandiri dinonaktifkan sementara, hanya QRIS yang aktif)
  paymentAccounts: {
    bca: {
      bankName: "Bank BCA",
      accountNumber: "8220198821",
      accountHolder: "BEN BALFAS",
      isActive: false,
    },
    mandiri: {
      bankName: "Bank Mandiri",
      accountNumber: "1370019283741",
      accountHolder: "BEN BALFAS",
      isActive: false,
    },
    qris: {
      qrisName: "QRIS All Payment Ben Balfas",
      qrisImageUrl: "/images/QR_benbalfas.webp",
      isActive: true,
    },
  },
};

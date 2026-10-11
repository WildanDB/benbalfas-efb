import { RecentJoki, GamingPlatform, OrderType } from '../types';
import { APP_CONFIG } from '../config/constants';
import { INITIAL_RECENT_JOKIS } from '../data/mockData';
import { formatRupiah, getPlatformLabel } from './pricing';
import { saveRecentJokisCloud, saveOrderToCloud } from '../services/firebase';

export interface SpreadsheetOrderRecord {
  timestamp: string;          // Tanggal & Jam Pemesanan
  orderId: string;            // ID Pesanan Unik
  clientName: string;         // Nama Klien
  whatsappNumber: string;     // No WhatsApp
  platform: GamingPlatform;   // steam | playstation | xbox
  platformLabel: string;      // Label Platform
  orderType: OrderType;       // points | package
  orderDescription: string;   // Nama Layanan / Paket
  initialRating: number;      // Poin Awal (Data Joki Terakhir)
  targetRating: number;       // Poin Target (Data Joki Terakhir)
  originalPrice: number;      // Harga Sebelum Diskon
  discountPercent: number;    // Persentase Diskon (%)
  referralCode?: string;      // Kode Referral (e.g. 'jack efo')
  referralDiscount?: number;  // Diskon Referral (e.g. 10000)
  finalPrice: number;         // Total Tagihan (Rp)
  duration: string;           // Estimasi SLA
  status: 'Sedang Proses' | 'Selesai'; // Status Joki
  paymentMethod: string;      // QRIS
  accountUsername: string;    // Username Game
  accountPassword: string;    // Password Game
  transferProofName: string;  // Nama File Bukti Transfer
  transferProofNote: string;  // Catatan Bukti Klien
  hasTransferProof: boolean;  // Upload Berhasil
}

const STORAGE_KEY_SPREADSHEET = 'benbalfas_spreadsheet_records';
const STORAGE_KEY_RECENT_JOKIS = 'benbalfas_recent_jokis';

/**
 * Mengambil seluruh data pesanan tersimpan dari localStorage
 */
export const getSpreadsheetRecords = (): SpreadsheetOrderRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SPREADSHEET);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Gagal membaca record spreadsheet:', err);
    return [];
  }
};

/**
 * Menyimpan record pesanan baru ke localStorage
 */
export const saveSpreadsheetRecord = (record: SpreadsheetOrderRecord): void => {
  try {
    const records = getSpreadsheetRecords();
    const updated = [record, ...records];
    localStorage.setItem(STORAGE_KEY_SPREADSHEET, JSON.stringify(updated));
  } catch (err) {
    console.error('Gagal menyimpan ke spreadsheet records:', err);
  }
};

export const getActiveGoogleSheetWebhookUrl = (): string => {
  return (
    localStorage.getItem('benbalfas_google_sheet_webhook_url') ||
    APP_CONFIG.googleSheetWebhookUrl ||
    ''
  );
};

export const getActiveTelegramConfig = () => {
  return {
    botToken:
      localStorage.getItem('benbalfas_telegram_bot_token') ||
      APP_CONFIG.telegramBotToken ||
      '',
    chatId:
      localStorage.getItem('benbalfas_telegram_chat_id') ||
      APP_CONFIG.telegramChatId ||
      '',
  };
};

/**
 * Mengirim payload baris pesanan ke Google Apps Script Webhook (Google Sheets di Google Drive)
 */
export const sendToGoogleSheetWebhook = async (record: SpreadsheetOrderRecord): Promise<boolean> => {
  const webhookUrl = getActiveGoogleSheetWebhookUrl();
  if (!webhookUrl || !webhookUrl.startsWith('http')) {
    return false;
  }

  try {
    // Menggunakan mode no-cors untuk kompatibilitas penuh dengan Google Apps Script Web App
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        timestamp: record.timestamp,
        orderId: record.orderId,
        clientName: record.clientName,
        whatsappNumber: record.whatsappNumber,
        platform: record.platformLabel,
        orderDescription: record.orderDescription,
        initialRating: record.initialRating,
        targetRating: record.targetRating,
        originalPrice: record.originalPrice,
        discountPercent: record.discountPercent + '%',
        referralCode: record.referralCode || '-',
        referralDiscount: record.referralDiscount || 0,
        finalPrice: record.finalPrice,
        duration: record.duration,
        status: record.status,
        paymentMethod: record.paymentMethod,
        accountUsername: record.accountUsername,
        accountPassword: record.accountPassword,
        transferProofName: record.transferProofName || 'Tidak dilampirkan',
        transferProofNote: record.transferProofNote || '-',
      }),
    });
    return true;
  } catch (err) {
    console.warn('Google Sheet webhook fetch warning (no-cors fallback triggered):', err);
    return false;
  }
};

/**
 * Menguji koneksi webhook Google Sheets
 */
export const testGoogleSheetWebhook = async (
  url: string
): Promise<{ success: boolean; message: string }> => {
  if (!url || !url.startsWith('http')) {
    return {
      success: false,
      message: 'URL Webhook tidak valid. Pastikan dimulai dengan https://script.google.com/macros/s/.../exec',
    };
  }
  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        timestamp: new Date().toLocaleString('id-ID'),
        orderId: 'TEST-BENBALFAS-' + Math.floor(Math.random() * 1000),
        clientName: 'Ben Balfas (Sistem Testing)',
        whatsappNumber: '085111418780',
        platform: 'Steam (PC)',
        orderDescription: 'Testing Koneksi Google Sheets (ID: 1KcBcdx0W8y46vGjcs9QXVLB744KnvOY8YO1bXWSsJPo)',
        initialRating: '-',
        targetRating: '-',
        originalPrice: 70000,
        discountPercent: '10%',
        finalPrice: 63000,
        duration: 'Instan',
        status: 'Selesai',
        paymentMethod: 'QRIS',
        accountUsername: 'test_user',
        accountPassword: 'test_password',
        transferProofName: 'test.jpg',
        transferProofNote: 'Uji coba koneksi dari panel Owner',
      }),
    });
    return {
      success: true,
      message: 'Data testing berhasil dikirim! Silakan buka Google Sheet Anda untuk melihat baris baru.',
    };
  } catch (err: any) {
    return { success: false, message: 'Gagal mengirim data test: ' + (err.message || 'Error jaringan') };
  }
};

/**
 * Menguji notifikasi Telegram Bot
 */
export const testTelegramNotification = async (
  botToken: string,
  chatId: string
): Promise<{ success: boolean; message: string }> => {
  if (!botToken || !chatId) {
    return {
      success: false,
      message: 'Bot Token dan Chat ID wajib diisi. Dapatkan Bot Token dari @BotFather dan Chat ID dari @userinfobot.',
    };
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `✅ <b>TES KONEKSI TELEGRAM BERHASIL - BEN BALFAS</b>\n\nSelamat! Notifikasi bot Telegram resmi Anda sudah aktif dan terhubung dengan website.\nSetiap ada pesanan joki baru masuk, detail akun klien akan otomatis terkirim ke chat ini secara instan! ⚽️⚡️`,
        parse_mode: 'HTML',
      }),
    });
    const data = await res.json();
    if (data.ok) {
      return { success: true, message: 'Notifikasi test Telegram berhasil terkirim ke chat Anda!' };
    } else {
      return { success: false, message: 'Telegram Error: ' + (data.description || 'Token atau Chat ID salah') };
    }
  } catch (err: any) {
    return { success: false, message: 'Gagal menghubungi Telegram API: ' + (err.message || 'Error jaringan') };
  }
};

/**
 * Mengirim notifikasi detail pesanan baru ke Bot Telegram Admin
 * Menggunakan HTML mode dengan escape lengkap dan fallback otomatis ke plain text
 * sehingga dijamin 100% terkirim tanpa gagal akibat karakter khusus (seperti underscore '_' pada username, password, atau nama file bukti transfer)
 */
export const sendTelegramOrderNotification = async (
  record: SpreadsheetOrderRecord
): Promise<{ success: boolean; message?: string }> => {
  const telegramConfig = getActiveTelegramConfig();
  if (!telegramConfig.botToken || !telegramConfig.chatId) {
    return {
      success: false,
      message: 'Bot Token atau Chat ID Telegram belum dikonfigurasi.',
    };
  }

  const escapeHtml = (str: any): string => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  const cleanWa = record.whatsappNumber.replace(/\D/g, '');
  const waLink = cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa;

  const promoLine =
    record.discountPercent > 0
      ? `🎁 <b>Promo:</b> Diskon ${record.discountPercent}%\n`
      : '';

  const referralLine =
    record.referralCode
      ? `🎟️ <b>Kode Referral:</b> <code>${escapeHtml(record.referralCode)}</code> (-${formatRupiah(record.referralDiscount || 0)})\n`
      : '';

  const proofLine =
    record.transferProofName
      ? `🧾 <b>Bukti Transfer:</b> <code>${escapeHtml(record.transferProofName)}</code> (Terlampir)\n`
      : '';

  const noteLine =
    record.transferProofNote
      ? `📝 <b>Catatan Klien:</b> ${escapeHtml(record.transferProofNote)}\n`
      : '';

  // Format 1: HTML Elegan & Terstruktur
  const htmlMessage =
    `🚨 <b>PESANAN JOKI MASUK - BEN BALFAS</b> 🚨\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🆔 <b>ID Pesanan:</b> <code>${escapeHtml(record.orderId)}</code>\n` +
    `🎮 <b>Platform Game:</b> ${escapeHtml(record.platformLabel)}\n` +
    `📦 <b>Tipe Layanan:</b> ${escapeHtml(record.orderType === 'points' ? 'Hitung via Poin' : 'Paket Instan')}\n` +
    `⚡️ <b>Layanan / Paket:</b> <b>${escapeHtml(record.orderDescription)}</b>\n` +
    promoLine +
    referralLine +
    `💰 <b>Total Tagihan:</b> <b>${formatRupiah(record.finalPrice)}</b>\n` +
    `⏱️ <b>Estimasi SLA:</b> ${escapeHtml(record.duration)}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>Nama Klien:</b> ${escapeHtml(record.clientName)}\n` +
    `📱 <b>WhatsApp:</b> <a href="https://wa.me/${waLink}">${escapeHtml(record.whatsappNumber)}</a>\n` +
    `🔑 <b>Akun Game / Email:</b> <code>${escapeHtml(record.accountUsername)}</code>\n` +
    `🔒 <b>Password:</b> <code>${escapeHtml(record.accountPassword)}</code>\n` +
    `💳 <b>Metode Bayar:</b> ${escapeHtml(record.paymentMethod || 'QRIS Instant')}\n` +
    proofLine +
    noteLine +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `⚡️ <b>Status Joki:</b> ${escapeHtml(record.status)}\n` +
    `⏳ Segera hubungi nomor WhatsApp klien untuk konfirmasi & OTP!`;

  // Format 2: Plain Text Fallback (Garansi Anti-Gagal terhadap karakter apa pun)
  const plainTextMessage =
    `🚨 PESANAN JOKI MASUK - BEN BALFAS 🚨\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `ID Pesanan: ${record.orderId}\n` +
    `Platform: ${record.platformLabel}\n` +
    `Layanan: ${record.orderDescription}\n` +
    (record.discountPercent > 0 ? `Promo: Diskon ${record.discountPercent}%\n` : '') +
    (record.referralCode ? `Referral: ${record.referralCode} (-${formatRupiah(record.referralDiscount || 0)})\n` : '') +
    `Total Bayar: ${formatRupiah(record.finalPrice)}\n` +
    `Estimasi SLA: ${record.duration}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `Nama: ${record.clientName}\n` +
    `WhatsApp: ${record.whatsappNumber} (https://wa.me/${waLink})\n` +
    `Akun Game: ${record.accountUsername}\n` +
    `Password: ${record.accountPassword}\n` +
    `Metode: ${record.paymentMethod || 'QRIS Instant'}\n` +
    (record.transferProofName ? `Bukti: ${record.transferProofName}\n` : '') +
    (record.transferProofNote ? `Catatan: ${record.transferProofNote}\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `Status: ${record.status}`;

  try {
    // Percobaan 1: Kirim mode HTML
    const res = await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramConfig.chatId,
        text: htmlMessage,
        parse_mode: 'HTML',
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (data.ok) {
      console.log('Notifikasi Telegram berhasil dikirim via HTML mode.');
      return { success: true, message: 'Notifikasi terkirim' };
    }

    console.warn('Telegram HTML parse warning, mencoba fallback ke Plain Text:', data);

    // Percobaan 2: Fallback ke Plain Text jika ada karakter yang ditolak parser HTML
    const fallbackRes = await fetch(`https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramConfig.chatId,
        text: plainTextMessage,
      }),
    });

    const fallbackData = await fallbackRes.json().catch(() => ({}));
    if (fallbackData.ok) {
      console.log('Notifikasi Telegram berhasil dikirim via Plain Text fallback.');
      return { success: true, message: 'Notifikasi terkirim (Fallback Plain Text)' };
    }

    console.error('Telegram dispatch fallback gagal:', fallbackData);
    return {
      success: false,
      message: fallbackData.description || 'Gagal mengirim notifikasi ke bot Telegram',
    };
  } catch (err: any) {
    console.error('Network error saat kirim notifikasi Telegram:', err);
    return {
      success: false,
      message: err.message || 'Error jaringan ke Telegram API',
    };
  }
};

/**
 * Mengintegrasikan pesanan baru langsung ke "Data Joki Terakhir"
 */
export const addOrderToRecentJoki = (record: SpreadsheetOrderRecord): void => {
  try {
    let existing: RecentJoki[] = [];
    const saved = localStorage.getItem(STORAGE_KEY_RECENT_JOKIS);
    if (saved) {
      try {
        existing = JSON.parse(saved);
      } catch {
        existing = [...INITIAL_RECENT_JOKIS];
      }
    } else {
      existing = [...INITIAL_RECENT_JOKIS];
    }

    const isWdl = record.orderDescription.toLowerCase().includes('weekend');

    const newRecentJoki: RecentJoki = {
      id: 'rj-' + record.orderId,
      clientName: record.clientName,
      packageName: record.orderDescription,
      recordType: isWdl ? 'wdl' : 'points',
      initialRating: isWdl ? undefined : record.initialRating,
      targetRating: isWdl ? undefined : record.targetRating,
      wdlRecord: isWdl ? { win: 0, draw: 0, loss: 0 } : undefined,
      status: 'Sedang Proses',
      duration: record.duration,
      date: 'Hari Ini',
      winStreak: 0,
      platform: record.platform,
    };

    // Sisipkan di posisi terdepan (terbaru)
    const updatedJokis = [newRecentJoki, ...existing];
    localStorage.setItem(STORAGE_KEY_RECENT_JOKIS, JSON.stringify(updatedJokis));

    // Dispatch event agar HeroSection me-refresh data tanpa reload halaman
    window.dispatchEvent(new CustomEvent('benbalfas_recent_jokis_updated', {
      detail: updatedJokis,
    }));

    // Push ke Firebase Cloud (Otomatis muncul di HP/device semua pengunjung)
    saveRecentJokisCloud(updatedJokis).catch(() => {});
  } catch (err) {
    console.error('Gagal memasukkan order ke Data Joki Terakhir:', err);
  }
};

/**
 * Sinkronisasi lengkap saat tombol "Konfirmasi Pesanan" ditekan:
 * 1. Simpan ke Database Lokal
 * 2. Integrasikan ke "Data Joki Terakhir" (Local & Cloud Firebase)
 * 3. Simpan ke Firebase Cloud Database (Real-time di semua device)
 * 4. Kirim notifikasi instan ke Bot Telegram Admin (Real-time)
 */
export const syncOrderToSpreadsheetAndRecentJoki = async (
  record: SpreadsheetOrderRecord
): Promise<void> => {
  // 1. Simpan ke database lokal
  saveSpreadsheetRecord(record);

  // 2. Integrasikan ke Data Joki Terakhir (Realtime Showcase)
  addOrderToRecentJoki(record);

  // 3. Simpan ke Firebase Cloud Database (Real-time di seluruh device)
  saveOrderToCloud(record).catch(() => {});

  // 4. Kirim notifikasi instan ke Bot Telegram Admin
  sendTelegramOrderNotification(record).catch((err) => {
    console.warn('Telegram background dispatch warning:', err);
  });
};

/**
 * Download file Spreadsheet dalam format CSV (UTF-8 BOM)
 * Dapat langsung di-upload ke Google Drive Ben Balfas Aset atau dibuka di Excel / Google Sheets
 */
export const exportSpreadsheetToCsv = (records?: SpreadsheetOrderRecord[]): void => {
  const data = records || getSpreadsheetRecords();

  const headers = [
    'Tanggal Pesanan',
    'ID Pesanan',
    'Nama Klien',
    'Nomor WhatsApp',
    'Platform Game',
    'Tipe Layanan',
    'Deskripsi Layanan / Paket',
    'Poin Awal (Data Joki)',
    'Target Poin (Data Joki)',
    'Harga Normal (Rp)',
    'Diskon Promo (%)',
    'Kode Referral',
    'Diskon Referral (Rp)',
    'Total Pembayaran (Rp)',
    'Estimasi Selesai (SLA)',
    'Status Pengerjaan',
    'Metode Pembayaran',
    'Username Akun Game',
    'Password Akun Game',
    'File Bukti Transfer',
    'Catatan Klien',
  ];

  const escapeCsv = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = data.map((r) => [
    escapeCsv(r.timestamp),
    escapeCsv(r.orderId),
    escapeCsv(r.clientName),
    escapeCsv(r.whatsappNumber),
    escapeCsv(r.platformLabel),
    escapeCsv(r.orderType === 'points' ? 'Hitung Poin' : 'Paket Instan'),
    escapeCsv(r.orderDescription),
    escapeCsv(r.initialRating),
    escapeCsv(r.targetRating),
    escapeCsv(r.originalPrice),
    escapeCsv(r.discountPercent + '%'),
    escapeCsv(r.referralCode || '-'),
    escapeCsv(r.referralDiscount ? formatRupiah(r.referralDiscount) : 'Rp 0'),
    escapeCsv(r.finalPrice),
    escapeCsv(r.duration),
    escapeCsv(r.status),
    escapeCsv(r.paymentMethod),
    escapeCsv(r.accountUsername),
    escapeCsv(r.accountPassword),
    escapeCsv(r.transferProofName || 'Tidak dilampirkan'),
    escapeCsv(r.transferProofNote || '-'),
  ]);

  const csvContent =
    '\uFEFF' + // UTF-8 BOM untuk Excel & Google Sheets
    [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  link.setAttribute('href', url);
  link.setAttribute('download', `Data_Pesanan_Joki_BenBalfas_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Salin baris record tunggal ke clipboard dalam format TSV (Tab-Separated)
 * Memudahkan Ben Balfas untuk langsung Paste (Ctrl+V) ke baris kosong Google Sheets
 */
export const copySpreadsheetRowToClipboard = async (
  record: SpreadsheetOrderRecord
): Promise<boolean> => {
  const fields = [
    record.timestamp,
    record.orderId,
    record.clientName,
    record.whatsappNumber,
    record.platformLabel,
    record.orderDescription,
    record.initialRating,
    record.targetRating,
    record.originalPrice,
    record.discountPercent + '%',
    record.referralCode || '-',
    record.referralDiscount ? formatRupiah(record.referralDiscount) : 'Rp 0',
    record.finalPrice,
    record.duration,
    record.status,
    record.paymentMethod,
    record.accountUsername,
    record.accountPassword,
    record.transferProofName || 'Tidak dilampirkan',
    record.transferProofNote || '-',
  ];

  try {
    await navigator.clipboard.writeText(fields.join('\t'));
    return true;
  } catch {
    return false;
  }
};

/**
 * Template Kode Google Apps Script siap pakai untuk Google Drive Ben Balfas Aset
 */
export const getGoogleAppsScriptCodeTemplate = (): string => {
  return `/**
 * GOOGLE APPS SCRIPT - SINKRONISASI OTOMATIS BEN BALFAS EFOOTBALL
 * 
 * Target Google Spreadsheet:
 * https://docs.google.com/spreadsheets/d/1KcBcdx0W8y46vGjcs9QXVLB744KnvOY8YO1bXWSsJPo/edit
 *
 * CARA MEMASANG (HANYA 1 MENIT):
 * 1. Buka spreadsheet Anda di atas.
 * 2. Klik menu "Ekstensi" (Extensions) > "Apps Script".
 * 3. Hapus semua kode bawaan (myFunction), lalu paste seluruh kode ini (Ctrl+V).
 * 4. Klik ikon Disket (Simpan / Save project).
 * 5. Klik tombol biru "Deploy" (Terapkan) di pojok kanan atas > "New deployment" (Deployment baru).
 * 6. Klik ikon gerigi (Select type) > pilih "Web app".
 * 7. Isi pengaturan:
 *    - Description: "Webhook Ben Balfas eFootball"
 *    - Execute as: "Me" (email Google Anda)
 *    - Who has access: "Anyone" (Siapa saja)  <-- PENTING agar website bisa kirim data!
 * 8. Klik tombol "Deploy". Jika diminta otorisasi izin (Authorize access), berikan izin.
 * 9. Salin "Web app URL" (akhiran /exec).
 * 10. Paste URL tersebut ke panel Owner di website (Auto-Sync Cloud > Simpan URL Webhook)!
 */

function doPost(e) {
  try {
    var ss;
    try {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    } catch(err) {}
    
    if (!ss) {
      ss = SpreadsheetApp.openById("1KcBcdx0W8y46vGjcs9QXVLB744KnvOY8YO1bXWSsJPo");
    }
    
    var sheet = ss.getActiveSheet();
    
    // Otomatis buat header tabel di Baris 1 jika spreadsheet masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Waktu & Tanggal",
        "ID Pesanan",
        "Nama Klien",
        "Nomor WhatsApp",
        "Platform",
        "Layanan / Paket",
        "Poin Awal",
        "Target Poin / Hasil",
        "Harga Normal",
        "Diskon Promo",
        "Kode Referral",
        "Diskon Referral",
        "Total Pembayaran",
        "Estimasi SLA",
        "Status Joki",
        "Metode Pembayaran",
        "Username Game",
        "Password Game",
        "Bukti Transfer",
        "Catatan Klien"
      ]);
    }
    
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
    
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString('id-ID'),
      data.orderId || '',
      data.clientName || '',
      data.whatsappNumber || '',
      data.platform || '',
      data.orderDescription || '',
      (data.initialRating !== undefined && data.initialRating !== null) ? data.initialRating : '-',
      (data.targetRating !== undefined && data.targetRating !== null) ? data.targetRating : '-',
      data.originalPrice || 0,
      data.discountPercent || '0%',
      data.referralCode || '-',
      data.referralDiscount || 0,
      data.finalPrice || 0,
      data.duration || '',
      data.status || 'Sedang Proses',
      data.paymentMethod || 'QRIS',
      data.accountUsername || '',
      data.accountPassword || '',
      data.transferProofName || 'Tidak dilampirkan',
      data.transferProofNote || '-'
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      message: "Data pesanan berhasil dicatat ke Spreadsheet Ben Balfas" 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Webhook Google Sheets Benbalfas eFootball aktif!"
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
};

import { RecentJoki, GamingPlatform, OrderType } from '../types';
import { APP_CONFIG } from '../config/constants';
import { INITIAL_RECENT_JOKIS } from '../data/mockData';
import { formatRupiah, getPlatformLabel } from './pricing';

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

/**
 * Mengirim payload baris pesanan ke Google Apps Script Webhook (Google Sheets di Google Drive)
 */
export const sendToGoogleSheetWebhook = async (record: SpreadsheetOrderRecord): Promise<boolean> => {
  const webhookUrl = APP_CONFIG.googleSheetWebhookUrl;
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

    const newRecentJoki: RecentJoki = {
      id: 'rj-' + record.orderId,
      clientName: record.clientName,
      packageName: record.orderDescription,
      initialRating: record.initialRating,
      targetRating: record.targetRating,
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
  } catch (err) {
    console.error('Gagal memasukkan order ke Data Joki Terakhir:', err);
  }
};

/**
 * Sinkronisasi lengkap saat tombol "Konfirmasi Pesanan" ditekan:
 * 1. Simpan ke Database Spreadsheet Lokal
 * 2. Integrasikan ke "Data Joki Terakhir" (status: Sedang Proses)
 * 3. Kirim ke Webhook Google Apps Script (jika ada)
 */
export const syncOrderToSpreadsheetAndRecentJoki = async (
  record: SpreadsheetOrderRecord
): Promise<void> => {
  // 1. Simpan ke spreadsheet lokal
  saveSpreadsheetRecord(record);

  // 2. Integrasikan ke Data Joki Terakhir
  addOrderToRecentJoki(record);

  // 3. Kirim ke Google Apps Script (Background)
  sendToGoogleSheetWebhook(record).catch(() => {});
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
 * Cara Pasang di Google Drive Ben Balfas Aset:
 * 1. Buka Google Sheet baru di Drive Ben Balfas Aset (Beri nama: "Data Pesanan Joki Ben Balfas")
 * 2. Buat header di Baris 1:
 *    [Timestamp | Order ID | Nama Klien | WhatsApp | Platform | Layanan | Poin Awal | Target Poin | Harga Normal | Diskon | Total Bayar | Estimasi SLA | Status | Metode Bayar | Username | Password | Bukti Transfer | Catatan]
 * 3. Klik menu "Ekstensi" (Extensions) > "Apps Script"
 * 4. Hapus isi bawaan, paste kode di bawah ini, lalu klik icon Simpan (Ctrl+S)
 * 5. Klik tombol biru "Deploy" (Terapkan) > "New deployment" (Deployment baru)
 * 6. Pilih jenis: "Web app" (Aplikasi Web)
 * 7. Setting:
 *    - Execute as: Me (email Anda)
 *    - Who has access: Anyone (Siapa saja)
 * 8. Klik Deploy, salin Web App URL, lalu paste ke APP_CONFIG.googleSheetWebhookUrl di file constants.ts!
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString('id-ID'),
      data.orderId || '',
      data.clientName || '',
      data.whatsappNumber || '',
      data.platform || '',
      data.orderDescription || '',
      data.initialRating || '',
      data.targetRating || '',
      data.originalPrice || '',
      data.discountPercent || '',
      data.finalPrice || '',
      data.duration || '',
      data.status || 'Sedang Proses',
      data.paymentMethod || 'QRIS',
      data.accountUsername || '',
      data.accountPassword || '',
      data.transferProofName || '',
      data.transferProofNote || ''
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;
};

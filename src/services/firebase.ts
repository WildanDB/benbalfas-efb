import { initializeApp, getApps, getApp, FirebaseApp, deleteApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  getDocFromServer,
  onSnapshot,
  collection,
  query,
  orderBy,
  Firestore,
  Unsubscribe,
} from "firebase/firestore";
import { APP_CONFIG } from "../config/constants";
import { RecentJoki } from "../types";
import { SpreadsheetOrderRecord } from "../utils/spreadsheet";
import { PromoStatus, ReferralStatus } from "../utils/pricing";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const STORAGE_KEY_FIREBASE = "benbalfas_firebase_config";

/**
 * Mendapatkan konfigurasi Firebase aktif
 * Urutan prioritas:
 * 1. Pengaturan yang disimpan Owner via UI (localStorage)
 * 2. APP_CONFIG.firebase di constants.ts
 * 3. Environment variables (Vite)
 */
export const getActiveFirebaseConfig = (): FirebaseConfig | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FIREBASE);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch {}

  if (APP_CONFIG.firebase?.apiKey && APP_CONFIG.firebase?.projectId) {
    return APP_CONFIG.firebase;
  }

  // Fallback ke Vite env
  const envApiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
  const envProjectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID;
  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
      messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
      appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "",
    };
  }

  return null;
};

// Singleton Firebase instances
let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;

export const saveFirebaseConfig = (config: FirebaseConfig): void => {
  localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(config));
  cachedApp = null;
  cachedDb = null;
};

export const clearFirebaseConfig = (): void => {
  localStorage.removeItem(STORAGE_KEY_FIREBASE);
  cachedApp = null;
  cachedDb = null;
};

export const isFirebaseConfigured = (): boolean => {
  const config = getActiveFirebaseConfig();
  return !!(config && config.apiKey && config.projectId);
};

export const getFirebaseDb = (): Firestore | null => {
  const config = getActiveFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    if (!cachedApp) {
      const apps = getApps();
      const defaultApp = apps.find((a) => a.name === "[DEFAULT]");
      if (defaultApp) {
        cachedApp = defaultApp;
      } else {
        cachedApp = initializeApp(config);
      }
    }
    if (!cachedDb && cachedApp) {
      cachedDb = getFirestore(cachedApp);
    }
    return cachedDb;
  } catch (err) {
    console.warn("Gagal inisialisasi Firebase Firestore:", err);
    return null;
  }
};

/**
 * Menguji koneksi ke Firebase Firestore
 * Terlindungi dari hanging/loading terus menerus:
 * 1. REST API Pre-check cepat (< 1 detik) untuk deteksi apakah Database sudah dibuat di Firebase Console
 * 2. Timeout ketat 5 detik pada SDK real-time write/read
 * 3. Pembersihan instance testApp otomatis
 */
export const testFirebaseConnection = async (
  customConfig?: FirebaseConfig
): Promise<{ success: boolean; message: string }> => {
  const config = customConfig || getActiveFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return {
      success: false,
      message: "API Key dan Project ID Firebase belum diisi.",
    };
  }

  // Langkah 1: REST API Pre-check cepat (Direct Google Cloud Check)
  // Mengetahui seketika jika database belum dibuat di Firebase Console
  try {
    const controller = new AbortController();
    const restTimeout = setTimeout(() => controller.abort(), 3500);
    const restUrl = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      config.projectId
    )}/databases/(default)/documents?key=${encodeURIComponent(config.apiKey)}`;

    const restRes = await fetch(restUrl, { signal: controller.signal });
    clearTimeout(restTimeout);

    if (restRes.status === 404) {
      return {
        success: false,
        message:
          `⚠️ Database Firestore BELUM DIBUAT di Firebase Console!\n\n` +
          `Project "${config.projectId}" ada, namun Anda belum mengaktifkan Firestore Database.\n\n` +
          `Cara Mengaktifkan (Hanya 1 Menit):\n` +
          `1. Buka console.firebase.google.com\n` +
          `2. Pilih project "${config.projectId}"\n` +
          `3. Di menu sebelah kiri: Build ➔ Firestore Database\n` +
          `4. Klik tombol "Create database"\n` +
          `5. Pilih lokasi default & centang "Start in test mode"\n` +
          `6. Klik "Create/Enable", lalu tes kembali di sini!`,
      };
    }

    if (restRes.status === 400) {
      const errJson = await restRes.json().catch(() => ({}));
      const errMsg = errJson?.error?.message || "API Key tidak valid";
      return {
        success: false,
        message: `⚠️ API Key atau Project ID Firebase salah: ${errMsg}. Periksa Project Settings di Firebase Console.`,
      };
    }
  } catch (err: any) {
    // Abaikan jika network offline, lanjut ke SDK test dengan timeout
    console.warn("REST pre-check skipped:", err);
  }

  // Langkah 2: Real-time SDK Write & Read dengan timeout ketat 5 detik
  let testApp: FirebaseApp | null = null;
  try {
    const testAppName = "test-app-" + Date.now();
    testApp = initializeApp(config, testAppName);
    const testDb = getFirestore(testApp);

    const pingRef = doc(testDb, "system", "connection_ping");

    const testWriteRead = async () => {
      await setDoc(
        pingRef,
        {
          lastPing: new Date().toISOString(),
          testBy: "Ben Balfas Owner",
          status: "connected",
        },
        { merge: true }
      );
      const snap = await getDocFromServer(pingRef);
      return snap.exists();
    };

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error("FIRESTORE_TIMEOUT"));
      }, 5000);
    });

    const isSuccess = await Promise.race([testWriteRead(), timeoutPromise]);

    if (isSuccess) {
      return {
        success: true,
        message: `✅ Koneksi Real-time ke Project "${config.projectId}" Berhasil!\nDatabase aktif. Seluruh pesanan, pengurangan slot promo, dan data joki akan sinkron di semua device secara otomatis.`,
      };
    } else {
      return {
        success: false,
        message: "Dokumen test tidak dapat dibaca kembali dari Firestore.",
      };
    }
  } catch (err: any) {
    if (err?.message === "FIRESTORE_TIMEOUT") {
      return {
        success: false,
        message:
          `⚠️ Waktu Tes Koneksi Habis (Timeout 5 Detik).\n\n` +
          `Firestore tidak merespons. Kemungkinan besar:\n` +
          `1. Database Firestore belum dibuat (Build ➔ Firestore Database ➔ Create Database).\n` +
          `2. Security Rules terkunci. Pastikan di tab "Rules" Firestore tertera:\n` +
          `   allow read, write: if true;\n` +
          `3. Koneksi internet Anda sedang tidak stabil.`,
      };
    }

    if (
      err?.code === "permission-denied" ||
      String(err).includes("permission-denied") ||
      String(err).includes("PERMISSION_DENIED")
    ) {
      return {
        success: false,
        message:
          `⚠️ Akses Ditolak oleh Security Rules Firebase.\n\n` +
          `Solusi:\n` +
          `1. Buka console.firebase.google.com ➔ Firestore Database\n` +
          `2. Klik tab "Rules"\n` +
          `3. Ubah aturan menjadi:\n` +
          `   rules_version = '2';\n` +
          `   service cloud.firestore {\n` +
          `     match /databases/{database}/documents {\n` +
          `       match /{document=**} {\n` +
          `         allow read, write: if true;\n` +
          `       }\n` +
          `     }\n` +
          `   }\n` +
          `4. Klik "Publish" dan tes kembali.`,
      };
    }

    return {
      success: false,
      message: "Gagal terhubung ke Firebase: " + (err.message || String(err)),
    };
  } finally {
    if (testApp) {
      try {
        await deleteApp(testApp);
      } catch {}
    }
  }
};

/* =========================================================================
   1. REAL-TIME PROMO & REFERRAL SYNC
   ========================================================================= */

const PROMO_DOC_PATH = { collection: "settings", doc: "promos" };

export interface CloudPromoState {
  claimedPromoSlots: number;
  promoLimit: number;
  claimedReferralSlots: number;
  referralLimit: number;
  updatedAt?: string;
}

/**
 * Berlangganan (Real-time listener) ke status promo & referral
 * Setiap ada pelanggan yang klaim diskon di HP mana pun, fungsi callback akan dipanggil seketika!
 */
export const subscribeToCloudPromo = (
  callback: (data: CloudPromoState) => void
): Unsubscribe | null => {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const promoRef = doc(db, PROMO_DOC_PATH.collection, PROMO_DOC_PATH.doc);
    return onSnapshot(
      promoRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as CloudPromoState;
          callback(data);
        } else {
          // Inisialisasi awal di cloud jika belum ada
          const initial: CloudPromoState = {
            claimedPromoSlots: 0,
            promoLimit: 3,
            claimedReferralSlots: 0,
            referralLimit: 5,
            updatedAt: new Date().toISOString(),
          };
          setDoc(promoRef, initial, { merge: true }).catch(() => {});
          callback(initial);
        }
      },
      (err) => {
        console.warn("Firebase promo onSnapshot error:", err);
      }
    );
  } catch (err) {
    console.warn("Gagal membuat promo subscription:", err);
    return null;
  }
};

/**
 * Klaim 1 slot promo di Cloud (Mengurangi sisa slot secara global)
 */
export const claimPromoSlotCloud = async (): Promise<void> => {
  const db = getFirebaseDb();
  if (!db) return;

  try {
    const promoRef = doc(db, PROMO_DOC_PATH.collection, PROMO_DOC_PATH.doc);
    const snap = await getDoc(promoRef);
    let currentClaimed = 0;
    if (snap.exists()) {
      currentClaimed = snap.data().claimedPromoSlots || 0;
    }
    const nextClaimed = Math.min(3, currentClaimed + 1);
    await setDoc(
      promoRef,
      {
        claimedPromoSlots: nextClaimed,
        promoLimit: 3,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Gagal klaim promo di cloud:", err);
  }
};

/**
 * Klaim 1 slot referral di Cloud
 */
export const claimReferralSlotCloud = async (): Promise<void> => {
  const db = getFirebaseDb();
  if (!db) return;

  try {
    const promoRef = doc(db, PROMO_DOC_PATH.collection, PROMO_DOC_PATH.doc);
    const snap = await getDoc(promoRef);
    let currentClaimed = 0;
    if (snap.exists()) {
      currentClaimed = snap.data().claimedReferralSlots || 0;
    }
    const nextClaimed = Math.min(5, currentClaimed + 1);
    await setDoc(
      promoRef,
      {
        claimedReferralSlots: nextClaimed,
        referralLimit: 5,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Gagal klaim referral di cloud:", err);
  }
};

/**
 * Reset slot promo di Cloud (Khusus Owner)
 */
export const resetPromoSlotsCloud = async (): Promise<void> => {
  const db = getFirebaseDb();
  if (!db) return;

  try {
    const promoRef = doc(db, PROMO_DOC_PATH.collection, PROMO_DOC_PATH.doc);
    await setDoc(
      promoRef,
      {
        claimedPromoSlots: 0,
        promoLimit: 3,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Gagal reset promo di cloud:", err);
  }
};

/**
 * Reset slot referral di Cloud (Khusus Owner)
 */
export const resetReferralSlotsCloud = async (): Promise<void> => {
  const db = getFirebaseDb();
  if (!db) return;

  try {
    const promoRef = doc(db, PROMO_DOC_PATH.collection, PROMO_DOC_PATH.doc);
    await setDoc(
      promoRef,
      {
        claimedReferralSlots: 0,
        referralLimit: 5,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Gagal reset referral di cloud:", err);
  }
};

/* =========================================================================
   2. REAL-TIME DATA JOKI TERAKHIR (SHOWCASE ETALASE)
   ========================================================================= */

const SHOWCASE_DOC_PATH = { collection: "showcase", doc: "recent_jokis" };

/**
 * Berlangganan ke update Data Joki Terakhir secara Real-time
 * Setiap Owner menambah, mengupdate skor, atau mengubah status joki, semua layar pengunjung otomatis update!
 */
export const subscribeToCloudRecentJokis = (
  callback: (jokis: RecentJoki[]) => void
): Unsubscribe | null => {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const showcaseRef = doc(db, SHOWCASE_DOC_PATH.collection, SHOWCASE_DOC_PATH.doc);
    return onSnapshot(
      showcaseRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (Array.isArray(data.list) && data.list.length > 0) {
            callback(data.list.slice(0, 10));
          }
        }
      },
      (err) => {
        console.warn("Firebase recent jokis onSnapshot error:", err);
      }
    );
  } catch (err) {
    console.warn("Gagal membuat recent jokis subscription:", err);
    return null;
  }
};

/**
 * Menyimpan seluruh daftar Data Joki Terakhir ke Cloud (Maks 10 Jokian Terakhir)
 */
export const saveRecentJokisCloud = async (jokis: RecentJoki[]): Promise<boolean> => {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const showcaseRef = doc(db, SHOWCASE_DOC_PATH.collection, SHOWCASE_DOC_PATH.doc);
    await setDoc(
      showcaseRef,
      {
        list: jokis.slice(0, 10),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn("Gagal menyimpan Data Joki Terakhir ke cloud:", err);
    return false;
  }
};

/* =========================================================================
   3. REAL-TIME ORDERS DATABASE (SINKRONISASI PESANAN SEMUA DEVICE)
   ========================================================================= */

/**
 * Menyimpan pesanan baru ke koleksi 'orders' di Firebase
 */
export const saveOrderToCloud = async (
  record: SpreadsheetOrderRecord
): Promise<boolean> => {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const orderDocRef = doc(db, "orders", record.orderId);
    await setDoc(orderDocRef, {
      ...record,
      createdAtServer: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn("Gagal menyimpan order ke Firestore:", err);
    return false;
  }
};

/**
 * Berlangganan ke koleksi 'orders' secara Real-time (Untuk panel Owner/Database)
 * Mengambil seluruh data pesanan langsung dari Firebase Firestore
 */
export const subscribeToCloudOrders = (
  callback: (orders: SpreadsheetOrderRecord[]) => void
): Unsubscribe | null => {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const ordersCol = collection(db, "orders");
    return onSnapshot(
      ordersCol,
      (snapshot) => {
        const records: SpreadsheetOrderRecord[] = [];
        snapshot.forEach((docSnap) => {
          records.push(docSnap.data() as SpreadsheetOrderRecord);
        });
        // Urutkan pesanan terbaru di paling atas secara instan di JS
        records.sort((a, b) => {
          const timeA = (a as any).createdAtServer || a.timestamp || "";
          const timeB = (b as any).createdAtServer || b.timestamp || "";
          return timeB.localeCompare(timeA);
        });
        callback(records);
      },
      (err) => {
        console.warn("Firebase orders subscription error:", err);
      }
    );
  } catch (err) {
    console.warn("Gagal membuat orders subscription:", err);
    return null;
  }
};

/**
 * Update status pesanan di Cloud ('Sedang Proses' / 'Selesai')
 */
export const updateOrderStatusCloud = async (
  orderId: string,
  newStatus: "Sedang Proses" | "Selesai"
): Promise<boolean> => {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const orderDocRef = doc(db, "orders", orderId);
    await setDoc(
      orderDocRef,
      {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn("Gagal update status order di cloud:", err);
    return false;
  }
};

/**
 * Menghapus pesanan dari Cloud Firebase
 */
export const deleteOrderFromCloud = async (orderId: string): Promise<boolean> => {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const orderDocRef = doc(db, "orders", orderId);
    await deleteDoc(orderDocRef);
    return true;
  } catch (err) {
    console.warn("Gagal menghapus order dari cloud:", err);
    return false;
  }
};

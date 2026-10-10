import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
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

export const saveFirebaseConfig = (config: FirebaseConfig): void => {
  localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(config));
};

export const clearFirebaseConfig = (): void => {
  localStorage.removeItem(STORAGE_KEY_FIREBASE);
};

export const isFirebaseConfigured = (): boolean => {
  const config = getActiveFirebaseConfig();
  return !!(config && config.apiKey && config.projectId);
};

// Singleton Firebase instances
let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;

export const getFirebaseDb = (): Firestore | null => {
  const config = getActiveFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    if (!cachedApp) {
      const apps = getApps();
      if (apps.length > 0) {
        cachedApp = getApp();
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

  try {
    // Inisialisasi app test tersendiri agar tidak bentrok
    const testAppName = "test-app-" + Date.now();
    const testApp = initializeApp(config, testAppName);
    const testDb = getFirestore(testApp);

    const pingRef = doc(testDb, "system", "connection_ping");
    await setDoc(
      pingRef,
      {
        lastPing: new Date().toISOString(),
        testBy: "Ben Balfas Admin",
        status: "connected",
      },
      { merge: true }
    );

    const snap = await getDoc(pingRef);
    if (snap.exists()) {
      return {
        success: true,
        message: `Koneksi Real-time ke Project "${config.projectId}" Berhasil! Database siap digunakan di semua device.`,
      };
    } else {
      return {
        success: false,
        message: "Dokumen test tidak dapat dibaca kembali dari Firestore.",
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: "Gagal terhubung ke Firebase: " + (err.message || String(err)),
    };
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
            callback(data.list);
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
 * Menyimpan seluruh daftar Data Joki Terakhir ke Cloud
 */
export const saveRecentJokisCloud = async (jokis: RecentJoki[]): Promise<boolean> => {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const showcaseRef = doc(db, SHOWCASE_DOC_PATH.collection, SHOWCASE_DOC_PATH.doc);
    await setDoc(
      showcaseRef,
      {
        list: jokis,
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
 * Berlangganan ke koleksi 'orders' secara Real-time (Untuk panel Owner/Spreadsheet)
 */
export const subscribeToCloudOrders = (
  callback: (orders: SpreadsheetOrderRecord[]) => void
): Unsubscribe | null => {
  const db = getFirebaseDb();
  if (!db) return null;

  try {
    const ordersCol = collection(db, "orders");
    const q = query(ordersCol, orderBy("timestamp", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const records: SpreadsheetOrderRecord[] = [];
        snapshot.forEach((docSnap) => {
          records.push(docSnap.data() as SpreadsheetOrderRecord);
        });
        if (records.length > 0) {
          callback(records);
        }
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

import * as SQLite from 'expo-sqlite';
import defaultCategories from "@/constants/defaultCategories.json";
import defaultAccounts from "@/constants/defaultAccounts.json";

let db: SQLite.SQLiteDatabase;

export let seededUserCategories = false;
let seededUserAccounts = false;

export const initDatabase = async () => {
  db = await SQLite.openDatabaseAsync('fiscus.db');

  // await db.execAsync(`
  //   DROP TABLE IF EXISTS transactions;
  //   DROP TABLE IF EXISTS categories;
  //   DROP TABLE IF EXISTS accounts;
  //   DROP TABLE IF EXISTS tags;
  //   DROP TABLE IF EXISTS merchants;
  //   DROP TABLE IF EXISTS sync_queue;
  //   DROP TABLE IF EXISTS sync_metadata;
  // `);
  // console.log('🗑️ Dropped existing tables');

  await db.execAsync(`
    -- Accounts Table
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT NOT NULL,
      uid TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER DEFAULT NULL,
      PRIMARY KEY (uid, id)
    );

    -- Tags Table
    CREATE TABLE IF NOT EXISTS tags (
      id TEXT NOT NULL,
      uid TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER DEFAULT NULL,
      PRIMARY KEY (uid, id)
    );

    -- Merchants Table
    CREATE TABLE IF NOT EXISTS merchants (
      id TEXT NOT NULL,
      uid TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER DEFAULT NULL,
      PRIMARY KEY (uid, id)
    );

    -- Transactions Table (Updated)
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL DEFAULT 'expense',
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      account TEXT NOT NULL,
      merchant TEXT,
      place TEXT DEFAULT NULL,
      tags TEXT DEFAULT '[]',
      date TEXT NOT NULL,
      description TEXT DEFAULT '',
      uid TEXT NOT NULL,
      sync_status TEXT DEFAULT 'LOCAL_ONLY',
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER DEFAULT NULL,
      FOREIGN KEY (account) REFERENCES accounts(id),
      FOREIGN KEY (merchant) REFERENCES merchants(id),
      FOREIGN KEY (category) REFERENCES categories(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_transactions_uid ON transactions(uid);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_account ON transactions(account);
    CREATE INDEX IF NOT EXISTS idx_transactions_merchant ON transactions(merchant);

    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      operation TEXT NOT NULL,
      document_id TEXT NOT NULL,
      data TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      status TEXT DEFAULT 'PENDING',
      uid TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sync_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT NOT NULL,
      uid TEXT NOT NULL,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      icon TEXT NOT NULL,
      bgColor TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('expense','income')),
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER DEFAULT NULL,
      PRIMARY KEY (uid, value) -- enforce one category per user per value
    );
  `);
};

export const seedUserCategories = async(uid: string) => {

  const existingCategories = await db.getAllAsync(
    "SELECT * FROM categories WHERE uid = ?",
    [uid]
  );

  if (!existingCategories || existingCategories.length === 0) {
    for (const cat of defaultCategories) {
    const id = `cat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await db.runAsync(
      `INSERT INTO categories (id, uid, label, value, icon, bgColor, type, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, uid, cat.label, cat.value, cat.icon, cat.bgColor, cat.type, Date.now()]
    );
  }
  }
}

export const seedUserAccounts = async(uid: string) => {
  if (seededUserAccounts) return;

  const existingAccounts = await db.getAllAsync(
    "SELECT * FROM accounts WHERE uid = ?",
    [uid]
  );

  if (!existingAccounts || existingAccounts.length === 0) {
    for (const account of defaultAccounts.defaultAccounts) {
      const id = `acc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await db.runAsync(
        `INSERT INTO accounts (id, uid, name, color, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, uid, account.name, account.color, Date.now()]
      );
    }
    seededUserAccounts = true;
  }
}

export const seedUserMerchants = async(uid: string) => {
  if (seededUserMerchants) return;

  const existingMerchants = await db.getAllAsync(
    "SELECT * FROM merchants WHERE uid = ?",
    [uid]
  );

  if (!existingMerchants || existingMerchants.length === 0) {
    for (const merchant of defaultMerchants.defaultMerchants) {
      const id = `mer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await db.runAsync(
        `INSERT INTO merchants (id, uid, name, color, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [id, uid, merchant.name, merchant.color, Date.now()]
      );
    }
    seededUserMerchants = true;
  }
}

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    console.log('🔄 Database not initialized, initializing now...');
    await initDatabase();
  }
  return db;
};

export { db };
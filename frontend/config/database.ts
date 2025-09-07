import * as SQLite from 'expo-sqlite';
import defaultCategories from "@/constants/defaultCategories.json";

let db: SQLite.SQLiteDatabase;

export let seededUserCategories = false;

export const initDatabase = async () => {
  db = await SQLite.openDatabaseAsync('fiscus.db');

  // await db.execAsync(`
  //   DROP TABLE IF EXISTS categories;
  //   DROP TABLE IF EXISTS transactions;
  //   DROP TABLE IF EXISTS sync_queue;
  //   DROP TABLE IF EXISTS sync_metadata;
  // `);
  // console.log('🗑️ Dropped existing tables');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      merchant TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'expense',
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      place TEXT,
      description TEXT DEFAULT '',
      uid TEXT NOT NULL,
      sync_status TEXT DEFAULT 'LOCAL_ONLY',
      updated_at INTEGER NOT NULL,
      deleted_at INTEGER DEFAULT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_transactions_uid ON transactions(uid);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);

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

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    console.log('🔄 Database not initialized, initializing now...');
    await initDatabase();
  }
  return db;
};

export { db };
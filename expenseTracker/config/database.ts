import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase;

export const initDatabase = async () => {
  db = await SQLite.openDatabaseAsync('expenses.db');

  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL DEFAULT 'expense',
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      uid TEXT NOT NULL
    );
    
    CREATE INDEX IF NOT EXISTS idx_transactions_uid ON transactions(uid);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
  `);
};

export { db };
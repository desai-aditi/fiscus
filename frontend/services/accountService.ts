import { getDatabase } from '@/config/database';
import { generateRandomColor } from '@/utils/styling';
import { Option } from '@/components/inputs/NotionSelect';

export interface Account extends Option {
  uid: string;
  updated_at: number;
  deleted_at?: number | null;
}

export const accountService = {
  async createAccount(uid: string, name: string, color?: string): Promise<Account> {
    const db = await getDatabase();
    const id = `acc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const account: Account = {
      id,
      uid,
      name,
      color: color || generateRandomColor(),
      updated_at: Date.now()
    };

    await db.runAsync(
      `INSERT INTO accounts (id, uid, name, color, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [account.id, account.uid, account.name, account.color, account.updated_at]
    );

    return account;
  },

  async getAccounts(uid: string): Promise<Account[]> {
    const db = await getDatabase();
    return await db.getAllAsync(
      'SELECT * FROM accounts WHERE uid = ? AND deleted_at IS NULL ORDER BY name',
      [uid]
    );
  },

  async updateAccount(account: Partial<Account> & { id: string }): Promise<void> {
    const db = await getDatabase();
    
    const updates = Object.entries(account)
      .filter(([key]) => key !== 'id')
      .map(([key]) => `${key} = ?`)
      .join(', ');
    
    const values = Object.entries(account)
      .filter(([key]) => key !== 'id')
      .map(([, value]) => value);

    await db.runAsync(
      `UPDATE accounts SET ${updates}, updated_at = ? WHERE id = ?`,
      [...values, Date.now(), account.id]
    );
  },

  async deleteAccount(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE accounts SET deleted_at = ? WHERE id = ?',
      [Date.now(), id]
    );
  }
};
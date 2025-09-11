import { getDatabase } from '@/config/database';
import { generateRandomColor } from '@/utils/styling';

import { Option } from '@/components/inputs/NotionSelect';

export interface Merchant extends Option {
  uid: string;
  updated_at: number;
  deleted_at?: number | null;
}

export const merchantService = {
  async createMerchant(uid: string, name: string, color?: string): Promise<Merchant> {
    const db = await getDatabase();
    const id = `mer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const merchant: Merchant = {
      id,
      uid,
      name,
      color: color || generateRandomColor(),
      updated_at: Date.now()
    };

    await db.runAsync(
      `INSERT INTO merchants (id, uid, name, color, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [merchant.id, merchant.uid, merchant.name, merchant.color, merchant.updated_at]
    );

    return merchant;
  },

  async getMerchants(uid: string): Promise<Merchant[]> {
    const db = await getDatabase();
    return await db.getAllAsync(
      'SELECT * FROM merchants WHERE uid = ? AND deleted_at IS NULL ORDER BY name',
      [uid]
    );
  },

  async updateMerchant(merchant: Partial<Merchant> & { id: string }): Promise<void> {
    const db = await getDatabase();
    const updates = Object.entries(merchant)
      .filter(([key]) => key !== 'id')
      .map(([key]) => `${key} = ?`)
      .join(', ');

    const values = Object.entries(merchant)
      .filter(([key]) => key !== 'id')
      .map(([, value]) => value);

    await db.runAsync(
      `UPDATE merchants SET ${updates}, updated_at = ? WHERE id = ?`,
      [...values, Date.now(), merchant.id]
    );
  },

  async deleteMerchant(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE merchants SET deleted_at = ? WHERE id = ?',
      [Date.now(), id]
    );
  }
};

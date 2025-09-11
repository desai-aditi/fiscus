import { getDatabase } from '@/config/database';
import { generateRandomColor } from '@/utils/styling';

import { Option } from '@/components/inputs/NotionSelect';

export interface Tag extends Option {
  uid: string;
  updated_at: number;
  deleted_at?: number | null;
}

export const tagService = {
  async createTag(uid: string, name: string, color?: string): Promise<Tag> {
    const db = await getDatabase();
    const id = `tag_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const tag: Tag = {
      id,
      uid,
      name,
      color: color || generateRandomColor(),
      updated_at: Date.now()
    };

    await db.runAsync(
      `INSERT INTO tags (id, uid, name, color, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      [tag.id, tag.uid, tag.name, tag.color, tag.updated_at]
    );

    return tag;
  },

  async getTags(uid: string): Promise<Tag[]> {
    const db = await getDatabase();
    return await db.getAllAsync(
      'SELECT * FROM tags WHERE uid = ? AND deleted_at IS NULL ORDER BY name',
      [uid]
    );
  },

  async updateTag(tag: Partial<Tag> & { id: string }): Promise<void> {
    const db = await getDatabase();
    const updates = Object.entries(tag)
      .filter(([key]) => key !== 'id')
      .map(([key]) => `${key} = ?`)
      .join(', ');

    const values = Object.entries(tag)
      .filter(([key]) => key !== 'id')
      .map(([, value]) => value);

    await db.runAsync(
      `UPDATE tags SET ${updates}, updated_at = ? WHERE id = ?`,
      [...values, Date.now(), tag.id]
    );
  },

  async deleteTag(id: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE tags SET deleted_at = ? WHERE id = ?',
      [Date.now(), id]
    );
  }
};

import { db } from "@/config/database"
import { CategoryType } from "@/types/categories";

export class CategoryService {
    static async getAllCategories(uid: string): Promise<CategoryType[]> {
        const result = await db.getAllAsync<CategoryType>(
            'SELECT * FROM categories WHERE uid = ? AND deleted_at IS NULL', [uid]
        );
        return [...result];
    }
}
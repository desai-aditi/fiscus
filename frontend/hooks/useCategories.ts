import { CategoryService } from "@/services/categoryService";
import { CategoryType } from "@/types/categories";
import { useCallback, useEffect, useState } from "react";

export const useCategories = (uid: string) => {
    const [categories, setCategories] = useState<CategoryType[]>([]);

    const loadCategories = useCallback(async () => {
      try {
        const data = await CategoryService.getAllCategories(uid);
        setCategories([...data]);
    } catch (err) {
        console.log('error getting categories: ', err)
    }
    }, [uid]);
    
    useEffect(() => {
        if (uid) loadCategories();
    }, [uid, loadCategories]);

    const getCategoryByValue = useCallback((value: string) => {
        return categories.find(category => category.value === value);
    }, [categories]);

    return {
        categories,
        loadCategories,
        getCategoryByValue
    }
}
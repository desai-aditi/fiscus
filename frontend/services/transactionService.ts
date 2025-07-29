import { TransactionType } from '@/types/transaction';
import {db} from '../config/database';

export class TransactionService {
    
    // fetch transactions
    static async getAllTransactions(uid: string): Promise<TransactionType[]> {
        const result = await db.getAllAsync<TransactionType>(
            'SELECT * FROM transactions WHERE uid = ? ORDER BY date DESC', [uid]
        );
        return result;
    }

    // add transaction
    static async addTransaction(transaction: Omit<TransactionType, 'id'>): Promise<string> {
        const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`  ;

        await db.runAsync(
            `INSERT INTO transactions (id, type, amount, category, date, description, uid) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, transaction.type, transaction.amount, transaction.category, transaction.date, transaction.description || '', transaction.uid]
        );
        return id;
    }

    // update transaction
    static async updateTransaction(id: string, updates: Partial<Omit<TransactionType, 'id' | 'uid'>>): Promise<void>{
        const fields: string[] = [];
        const values: any[] = [];
        
        Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
        });
        
        if (fields.length === 0) return;
        
        values.push(id);
        
        await db.runAsync(
        `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`,
        values
        );
    }

    // delete transaction
    static async deleteTransaction(id: string): Promise<void> {
        await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
    }

    // group transactions by date
    static groupTransactionsByDate(transactions: TransactionType[]): Record<string, TransactionType[]> {
        return transactions.reduce((groups, transaction) => {
        const dateKey = transaction.date.split('T')[0]; // Get just the date part
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(transaction);
        return groups;
        }, {} as Record<string, TransactionType[]>);
    }
}
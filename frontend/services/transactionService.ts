import { Transaction } from '@/types/transaction';
import {db} from '../config/database';
import { SyncStatus } from '@/types/sync';

export class TransactionService {
    
    // fetch transactions
    static async getAllTransactions(uid: string): Promise<Transaction[]> {
        const result = await db.getAllAsync<Transaction>(
            'SELECT * FROM transactions WHERE uid = ? ORDER BY date DESC', [uid]
        );
        return result;
    }

    // add transaction
    static async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
        const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`  ;

        await db.runAsync(
            `INSERT INTO transactions (id, type, amount, category, date, description, uid) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, transaction.type, transaction.amount, transaction.category, transaction.date, transaction.description || '', transaction.uid]
        );
        return id;
    }

    // update transaction
    static async updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id' | 'uid'>>): Promise<void>{
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

    // update sync status
    static async updateSyncStatus(id: string, status: SyncStatus): Promise<void> {
        await db.runAsync(
            'UPDATE transactions SET sync_status = ? WHERE id = ?',
            [status, id]
        );
    }
}
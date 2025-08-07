import { Transaction } from '@/types/transaction';
import {db} from '../config/database';
import { SyncStatus } from '@/types/sync';

export class TransactionService {

    // 
    static async getTransaction(uid: string, transactionId: string): Promise<Transaction | null> {
        const result = await db.getFirstAsync<Transaction>(
            'SELECT * FROM transactions where uid = ? AND id = ?', [uid, transactionId]
        );
        return result;
    }
    
    // fetch transactions
    static async getAllTransactions(uid: string): Promise<Transaction[]> {
        const result = await db.getAllAsync<Transaction>(
            'SELECT * FROM transactions WHERE uid = ? AND deleted_at IS NULL ORDER BY date DESC', [uid]
        );
        return [...result];
    }

    // add transaction
    static async addTransactionWithId(transaction: Transaction): Promise<void> {
        await db.runAsync(
            `INSERT INTO transactions (id, type, amount, category, date, description, uid, created_at, updated_at, deleted_at, sync_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
            transaction.id, // Use the existing ID from Firestore
            transaction.type,
            transaction.amount,
            transaction.category,
            transaction.date,
            transaction.description || '',
            transaction.uid,
            transaction.updated_at,
            transaction.deleted_at || null,
            'SYNCED' // Mark as synced since it came from remote
            ]
        );
    }

    static async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
        const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`  ;

        await db.runAsync(
            `INSERT INTO transactions (id, type, amount, category, date, description, uid, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, transaction.type, transaction.amount, transaction.category, transaction.date, transaction.description || '', transaction.uid, Date.now(), Date.now()]
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
        await db.runAsync('UPDATE transactions SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    }

    // update sync status
    static async updateSyncStatus(id: string, status: SyncStatus): Promise<void> {
        await db.runAsync(
            'UPDATE transactions SET sync_status = ? WHERE id = ?',
            [status, id]
        );
    }
}
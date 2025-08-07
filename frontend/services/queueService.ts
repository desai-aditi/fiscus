import { db } from "@/config/database";
import { SyncOperation, SyncQueueItem } from "@/types/sync";
import { Transaction } from "@/types/transaction";

export class QueueService{
    static async getAllQueuedItems(uid: string): Promise<SyncQueueItem[]> {
        const items = await db.getAllAsync<SyncQueueItem>('SELECT * FROM sync_queue WHERE uid = ? AND status = ?', [uid, 'PENDING']);
        return items
    }

    static async enqueue(operation: SyncOperation, transaction: Transaction): Promise<void> {
        const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        const existingItem = await db.getFirstAsync('SELECT * FROM sync_queue WHERE operation = ? AND document_id = ?', [operation, transaction.id]);

        if (existingItem) {
            return;
        }

        await db.runAsync(
            `INSERT INTO sync_queue (id, operation, document_id, data, timestamp, status, uid, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id, 
                operation, 
                transaction.id, 
                JSON.stringify(transaction), 
                Date.now(), 
                'PENDING', 
                transaction.uid,
                Date.now()
            ]
        );
    }

    static async dequeue(transactionId: string): Promise<void> {
        const transaction = await db.getFirstAsync('SELECT * FROM sync_queue WHERE document_id = ?', [transactionId]);
        // console.log("Transaction exists in queue:", transaction);
        if (transaction!== null) {
            await db.runAsync(
                'DELETE FROM sync_queue WHERE document_id = ?', [transactionId]
            );
        }
        
    }

    static async markAllAsProcessed(transactionId: string): Promise<void> {
        // Remove or mark as processed all queue items for this transaction ID
        await db.runAsync(
            'DELETE FROM sync_queue WHERE document_id = ?',
            [transactionId]
        );
    }

        static async markAsFailed(transactionId: string): Promise<void> {
        // Mark all queue items for this transaction as failed
        await db.runAsync(
            'UPDATE sync_queue SET status = ? WHERE document_id = ?',
            ['FAILED', transactionId]
        );
    }
}
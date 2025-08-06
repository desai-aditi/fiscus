import { db } from "@/config/database";
import { SyncOperation } from "@/types/sync";
import { Transaction } from "@/types/transaction";

export class QueueService{
    static async enqueue(operation: SyncOperation, transaction: Transaction): Promise<void> {
        const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

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
}
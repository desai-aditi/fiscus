import { db } from "@/config/database";
import { SyncOperation } from "@/types/sync";
import { Transaction } from "@/types/transaction";

export class QueueService{
    static async enqueue(operation: SyncOperation, transaction: Transaction): Promise<void> {
        const id = crypto.randomUUID();
        
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
}
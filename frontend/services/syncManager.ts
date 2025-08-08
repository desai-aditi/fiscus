import { SyncOperation, SyncQueueItem } from "@/types/sync";
import { Transaction } from "@/types/transaction";
import { QueueService } from "./queueService";
import { TransactionService } from "./transactionService";
import { APIService } from "./apiService";
import { db } from "@/config/database";

export class syncManager {
    private static networkAvailable: boolean = true;

    static setNetworkAvailability(status: boolean): void {
        this.networkAvailable = status;
    }

    static async syncTransaction(operation:SyncOperation, transaction: Transaction, authToken: string): Promise<void> {
        if (!syncManager.networkAvailable){
            await QueueService.enqueue(operation, transaction);
            return;
        }

        try {
            switch (operation) {
                case 'POST':
                    await APIService.createTransaction(transaction, authToken);
                    await QueueService.dequeue(transaction.id);
                    break;
            
                case 'PUT':
                    await APIService.updateTransaction(transaction, authToken);
                    await QueueService.dequeue(transaction.id);
                    break;

                case 'DELETE':
                    await APIService.deleteTransaction(transaction.id, authToken);
                    await QueueService.dequeue(transaction.id);
                    break;
            }

            await TransactionService.updateSyncStatus(transaction.id, 'SYNCED');
            
        } catch (apiError) {
            console.error("API Error during sync:", apiError);
            await QueueService.enqueue(operation, transaction);
            await TransactionService.updateSyncStatus(transaction.id, 'LOCAL_ONLY');
            
            throw apiError;
        }
    }

    static async batchPush(authToken: string, uid: string): Promise<Transaction[] | void> {
        try {
            const pendingItems = await QueueService.getAllQueuedItems(uid);
            
            const latestOperations = this.getLatestOperationsById(pendingItems);
            
            for (const item of latestOperations) {
                const transaction = JSON.parse(item.data) as Transaction
                try {
                    console.log(`executing ${item.operation} on this transaction ${transaction.id}`)
                    await this.syncTransaction(item.operation, transaction, authToken);
                    await QueueService.markAllAsProcessed(transaction.id);
                } catch (error) {
                    console.error(`Failed to sync transaction ${transaction.id}:`, error);
                    await QueueService.markAsFailed(transaction.id);
                }
            }
        } catch (error) {
            throw error;
        }
    }

    static async getLastSyncTimestamp(uid: string): Promise<number> {
        const result = await db.getFirstAsync(
            'SELECT value FROM sync_metadata WHERE key = ?',
            [`last_sync_${uid}`]
        ) as { value: string } | null;

        return result ? parseInt(result.value) : 0; // Return 0 if never synced
    }

    static async setLastSyncTimestamp(uid: string, timestamp: number): Promise<void>{
        await db.runAsync(
            `INSERT OR REPLACE INTO sync_metadata (key, value, updated_at) 
            VALUES (?, ?, ?)`,
            [`last_sync_${uid}`, timestamp.toString(), Date.now()]
        );
    }

    static async batchPull(authToken: string, uid: string): Promise<Transaction[] | void> {
        try {
            const lastSyncTimestamp = await this.getLastSyncTimestamp(uid);
            console.log(`Last sync was at: ${lastSyncTimestamp}`);

            const firestoreTransactions = await APIService.fetchUpdatedTransactions(authToken, uid, lastSyncTimestamp);
            console.log('pulled:', firestoreTransactions);

            const currentSyncTime = Date.now();
            
            for (const transaction of firestoreTransactions) {
                const existingTransaction = await TransactionService.getTransaction(uid, transaction.id);
                
                if (existingTransaction) {
                    if (transaction.deleted_at) {
                        await TransactionService.deleteTransaction(transaction.id);
                    } else {
                    if (transaction.updated_at > existingTransaction.updated_at) {
                        await TransactionService.updateTransaction(transaction.id, {
                        type: transaction.type,
                        amount: transaction.amount,
                        category: transaction.category,
                        date: transaction.date,
                        description: transaction.description,
                        updated_at: transaction.updated_at,
                        sync_status: 'SYNCED'
                        });
                    }
                    }
                } else {
                    if (!transaction.deleted_at) {
                        await TransactionService.addTransactionWithId(transaction);
                    }
                }
            }

            await this.setLastSyncTimestamp(uid, currentSyncTime);
            console.log('updated last sync timestamp')
            
            // Return updated local transactions
            return await TransactionService.getAllTransactions(uid);
        } catch (error) {
            console.error('unable to pull transactions from DB at this time.');
            throw error;
        }
    }

    private static getLatestOperationsById(queueItems: SyncQueueItem[]): SyncQueueItem[] {
        const latestByTransactionId = new Map<string, SyncQueueItem>();
        
        for (const item of queueItems) {
            const existingItem = latestByTransactionId.get(item.document_id);
            
            if (!existingItem || item.timestamp > existingItem.timestamp) {
                latestByTransactionId.set(item.document_id, item);
            }
        }
        
        return Array.from(latestByTransactionId.values());
    }
}
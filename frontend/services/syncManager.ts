import { SyncOperation } from "@/types/sync";
import { Transaction } from "@/types/transaction";
import { QueueService } from "./queueService";
import { TransactionService } from "./transactionService";
import { APIService } from "./apiService";

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

            for (const item of pendingItems) {
                try {
                    await this.syncTransaction(item.operation, item.transaction, authToken)
                } catch (error) {
                    await QueueService.markAsFailed(item.transaction.id)
                }
            }

        } catch (error) {
            throw error;
        }
    }
}
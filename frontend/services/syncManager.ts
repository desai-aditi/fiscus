import { SyncOperation } from "@/types/sync";
import { Transaction } from "@/types/transaction";
import { QueueService } from "./queueService";
import { TransactionService } from "./transactionService";
import { APIService } from "./apiService";
import { CurlTestService } from "./curltestservice";
import { NetworkDebugService } from "./networkDebugService";

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
                    console.log("Syncing MANAGER:", transaction);
                    await APIService.createTransaction(transaction, authToken);
                    break;
            
                case 'PUT':
                    break;

                case 'DELETE':
                    break;
            }

            await TransactionService.updateSyncStatus(transaction.id, 'SYNCED');
            
        } catch (apiError) {
            console.error("API Error during sync:", apiError);
            await QueueService.enqueue(operation, transaction);
            await TransactionService.updateSyncStatus(transaction.id, 'LOCAL_ONLY');

            console.warn("Network is unavailable, transaction will be queued for later sync.");
            
            throw apiError;
        }
    }
}
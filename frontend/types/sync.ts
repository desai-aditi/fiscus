export type SyncStatus = 'SYNCED' | 'PENDING' | 'FAILED';
export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE';

export interface SyncQueueItem {
  id: string;
  operation: SyncOperation;
  table_name: 'transactions';
  document_id: string; 
  data: string; 
  timestamp: number;
  retry_count: number;
}
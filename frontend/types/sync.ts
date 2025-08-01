export type SyncStatus = 'LOCAL_ONLY' | 'SYNCED' | 'CONFLICT';
export type SyncOperation = 'POST' | 'PUT' | 'DELETE';

export interface SyncQueueItem {
  id: string;
  operation: SyncOperation;
  table_name: 'transactions';
  document_id: string; 
  data: string; 
  timestamp: number;
  retry_count: number;
}
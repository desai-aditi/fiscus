export type SyncStatus = 'LOCAL_ONLY' | 'SYNCED' | 'CONFLICT';
export type SyncOperation = 'POST' | 'PUT' | 'DELETE';

export interface SyncQueueItem {
  id: string;
  operation: SyncOperation;
  document_id: string; 
  data: string; 
  timestamp: number;
  status: 'PENDING' | 'SYNCED' | 'FAILED';
  uid: string;
  created_at: string;
}
import { SyncStatus } from "./sync";

export type Transaction = {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  date: string;  // Always ISO string for consistency
  description: string;
  uid: string;
  sync_status: SyncStatus;
  deleted_at?: number;  // Unix timestamp in milliseconds
  created_at: number;   // Unix timestamp in milliseconds
  updated_at: number;   // Unix timestamp in milliseconds
};
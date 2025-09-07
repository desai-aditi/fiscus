import { SyncStatus } from "./sync";

export type Transaction = {
  id: string;
  type: 'expense' | 'income';
  merchant: string;
  place: string;
  amount: number;
  category: string;
  date: string;  // Always ISO string for consistency
  description: string;
  uid: string;
  sync_status: SyncStatus;
  deleted_at?: number;  // Unix timestamp in milliseconds
  created_at?: number;   // Unix timestamp in milliseconds
  updated_at: number;   // Unix timestamp in milliseconds
};

export type TransactionListType = {
  data: Transaction[];
};

export type TransactionItemProps = {
  item: Transaction;
  index: number;
  handleClick: Function;
};
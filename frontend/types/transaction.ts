export type Transaction = {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  date: Date | string;
  description?: string;
  uid: string;
  sync_status: 'SYNCED' | 'LOCAL_ONLY' | 'failed';
};
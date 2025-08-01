import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/types/transaction';
import { TransactionService } from '@/services/transactionService';
import { syncManager } from '@/services/syncManager';
import { useAuth } from '@/contexts/authContext';

export const useTransactions = (uid: string) => {
  const { token: authToken } = useAuth();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sync, setSync] = useState(false);

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await TransactionService.getAllTransactions(uid);
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const id = await TransactionService.addTransaction(transaction);

      try {
        console.log("Syncing transaction:", transaction);
        console.log('auth token:', authToken);
        await syncManager.syncTransaction('POST', {...transaction, id}, authToken);
      } catch (syncError) {
        console.error('Sync failed:', syncError);
      }

      await loadTransactions(); // Refresh the list
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Omit<Transaction, 'id' | 'uid'>>) => {
    try {
      await TransactionService.updateTransaction(id, updates);
      await loadTransactions(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      await TransactionService.deleteTransaction(id);
      await loadTransactions(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      throw err;
    }
  };

  // const groupedTransactions = TransactionService.groupTransactionsByDate(transactions);

  return {
    transactions,
    // groupedTransactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions: loadTransactions,
  };
};

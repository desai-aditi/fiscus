import { useState, useEffect, useCallback } from 'react';
import { TransactionType } from '@/types/transaction';
import { TransactionService } from '@/services/transactionService';


export const useTransactions = (uid: string) => {
  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const addTransaction = async (transaction: Omit<TransactionType, 'id'>) => {
    try {
      const id = await TransactionService.addTransaction(transaction);
      await loadTransactions(); // Refresh the list
      return id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Omit<TransactionType, 'id' | 'uid'>>) => {
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

  const groupedTransactions = TransactionService.groupTransactionsByDate(transactions);

  return {
    transactions,
    groupedTransactions,
    loading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshTransactions: loadTransactions,
  };
};

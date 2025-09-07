import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SyncStatus } from '@/types/sync';
import { Transaction, TransactionItemProps, TransactionListType } from '@/types/transaction';
import { scale, verticalScale } from '@/utils/styling';
import Typo from './Typo';
import { colors } from '@/constants/theme';
import { radius } from '@/constants/scaling';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/authContext';

type GroupedTransaction = {
  title: string;
  data: Transaction[];
};

// Helper function to format date groups
const getDateGroupTitle = (dateString: string): string => {
  const transactionDate = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Reset time to compare dates only
  const transactionDateOnly = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  
  if (transactionDateOnly.getTime() === todayOnly.getTime()) {
    return 'TODAY';
  } else if (transactionDateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'YESTERDAY';
  } else {
    return transactionDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
};

// Helper function to group transactions by date
const groupTransactionsByDate = (transactions: Transaction[]): GroupedTransaction[] => {
  const grouped = transactions.reduce((acc, transaction) => {
    const groupTitle = getDateGroupTitle(transaction.date);
    
    if (!acc[groupTitle]) {
      acc[groupTitle] = [];
    }
    acc[groupTitle].push(transaction);
    return acc;
  }, {} as Record<string, Transaction[]>);
  
  // Sort groups by date (newest first)
  const sortedGroups = Object.entries(grouped)
    .map(([title, data]) => ({ title, data }))
    .sort((a, b) => {
      if (a.title === 'TODAY') return -1;
      if (b.title === 'TODAY') return 1;
      if (a.title === 'YESTERDAY') return -1;
      if (b.title === 'YESTERDAY') return 1;
      
      // For other dates, parse and compare
      const dateA = new Date(a.data[0].date);
      const dateB = new Date(b.data[0].date);
      return dateB.getTime() - dateA.getTime();
    });
  
  return sortedGroups;
};

// Individual Transaction Item Component
export const TransactionItem: React.FC<TransactionItemProps> = ({
  item,
  index,
  handleClick,
}) => {
  const formatAmount = (amount: number, type: 'expense' | 'income'): string => {
    const formattedAmount = Math.abs(amount).toFixed(2);
    return type === 'expense' ? `-$${formattedAmount}` : `+$${formattedAmount}`;
  };

  const {user} = useAuth();
  const {getCategoryByValue} = useCategories(user?.uid);
  
  return (
    <TouchableOpacity
      style={styles.transactionItem}
      onPress={() => handleClick(item)}
    >
      <View style={styles.transactionLeft}>
        <View style={[styles.categoryIcon, { backgroundColor: getCategoryByValue(item.category)?.bgColor || colors.neutral300 }]}>
          <Text style={styles.categoryIconText}>
            {getCategoryByValue(item.category)?.icon || '💰'}
          </Text>
        </View>
        <View style={styles.transactionDetails}>
          <Typo fontWeight={'600'} size={15}>{item.merchant}</Typo>
          <Typo fontWeight={'300'} size={13} color={colors.neutral500}>{item.category}</Typo>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Typo size={scale(16)} style={ {color: item.type === 'expense' ? colors.red : colors.primary} }>
          {formatAmount(item.amount, item.type)}
        </Typo>
      </View>
    </TouchableOpacity>
  );
};

// Main Transaction List Component
export const TransactionList: React.FC<TransactionListType> = ({ data }) => {
  const router = useRouter();
  
  const processedTransactions = useMemo(() => {
    // Filter out deleted transactions and sort by date (newest first)
    return data
      .filter(transaction => !transaction.deleted_at)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data]);
  
  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(processedTransactions);
  }, [processedTransactions]);
  
  const handleTransactionClick = (transaction: Transaction) => {
    router.push({
      pathname: '/(modals)/transaction',
      params: {
        transactionString: JSON.stringify(transaction), // Pass the entire transaction as a string
      },
    });
  };
  
  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Typo color={colors.black} size={12} fontWeight={'bold'} style={{textTransform: 'uppercase'}}>{title}</Typo>
    </View>
  );
  
  const renderTransactionGroup = ({ item: group }: { item: GroupedTransaction }) => (
    <View style={styles.groupContainer}>
      {renderSectionHeader(group.title)}
      {group.data.map((transaction, index) => (
        <TransactionItem
          key={transaction.id}
          item={transaction}
          index={index}
          handleClick={handleTransactionClick}
        />
      ))}
    </View>
  );
  
  if (groupedTransactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Typo size={16} >No transactions found</Typo>
      </View>
    );
  }
  
  return (
    <FlatList
      data={groupedTransactions}
      renderItem={renderTransactionGroup}
      keyExtractor={(item) => item.title}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  groupContainer: {
    marginBottom: verticalScale(16),
    gap: verticalScale(14)
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: scale(42),
    height: scale(42),
    borderRadius: radius._20,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    marginRight: scale(9),
  },
  categoryIconText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  categoryText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});
import { Button, FlatList, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useAuth } from '@/contexts/authContext';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction } from '@/types/transaction';
import { Link, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { syncManager } from '@/services/syncManager';
import { useCallback, useEffect } from 'react';

export default function TabOneScreen() {
  const { token, user } = useAuth();

  const handlePush = async () => {
    syncManager.batchPush(token, user.uid);
  };

  const handlePull = async () => {
    syncManager.batchPull(token, user.uid);
  };

  const params = useLocalSearchParams();

  const {loading, error, transactions, refreshTransactions} = useTransactions(user.uid);

  useFocusEffect(
  useCallback(() => {
    refreshTransactions();
  }, [refreshTransactions])
);

  const TransactionListItem = ({ item }: { item: Transaction }) => (
  <Link 
    href={{ pathname: "/modal", params: { transactionString: JSON.stringify(item) } }} 
    asChild
  >
    <TouchableOpacity>
      <View >
        <Text>{item.category}</Text>
        <Text>{item.description || 'No description'}</Text>
        <Text>Status: {item.sync_status}</Text>
      </View>
      <Text style={[{ color: item.type === 'income' ? '#34C759' : '#FF3B30' }]}>
        {item.type === 'income' ? '+' : '-'} ${item.amount.toFixed(2)}
      </Text>
    </TouchableOpacity>
  </Link>
);

  return (
    <View style={styles.container}>
      {/* <Button title='pull' onPress={() => handlePull()}/> */}
      <Button title='Push' onPress={() => handlePush()}/>
      <Button title='Pull' onPress={() => handlePull()}/>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>
        {transactions.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 40 }}>
            No transactions yet. Tap the '+' to add one!
          </Text>
        ) : (
          transactions.map((item) => (
            <TransactionListItem key={item.id} item={item} />
          ))
        )}
      </ScrollView>
      <Button title="Refresh Transactions" onPress={refreshTransactions} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
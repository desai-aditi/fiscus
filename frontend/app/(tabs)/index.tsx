import { StyleSheet, TouchableOpacity, FlatList } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useTransactions } from '@/hooks/useTransactions';
import { Link, router } from 'expo-router';
import { Transaction } from '@/types/transaction';

export default function TabOneScreen() {
  const {loading, error, transactions} = useTransactions('RMQXmpNwx3Q5W0285Z90V40kGEt1');

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
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionListItem item={item} />}
        ListEmptyComponent={() => (
            <View>
                <Text>No transactions yet.</Text>
                <Text>Tap the '+' to add one!</Text>
            </View>
        )}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
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

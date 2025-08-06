import { Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from '@/components/Themed';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useAuth } from '@/contexts/authContext';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction } from '@/types/transaction';
import { Link } from 'expo-router';
import { syncManager } from '@/services/syncManager';

export default function TabOneScreen() {
  const { token, user } = useAuth();

  const handlePush = async () => {
    syncManager.batchPush(token, user.uid);
  };

  const {loading, error, transactions} = useTransactions(user.uid);

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
      <Button title='push' onPress={() => handlePush()}/>
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
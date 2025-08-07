import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';

import { useTransactions } from '@/hooks/useTransactions';
import { Transaction } from '@/types/transaction';
import { CATEGORIES } from '@/constants/categories';
import { CategoryType } from '@/types/categories';
import { useAuth } from '@/contexts/authContext';

// Prepare data for the dropdown
const incomeCategory: CategoryType = { label: 'Income', value: 'Income', icon: 'dollar-sign', bgColor: '#16A34A' };
const expenseCategories: CategoryType[] = Object.values(CATEGORIES);
const dropdownData: CategoryType[] = [incomeCategory, ...expenseCategories];

// A simple styled button component for consistency
const ActionButton = ({ title, onPress, color = '#007AFF', disabled = false }) => (
  <TouchableOpacity style={[styles.button, { backgroundColor: color, opacity: disabled ? 0.5 : 1 }]} onPress={onPress} disabled={disabled}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

export default function TransactionModalScreen() {
  const router = useRouter();
  const { user } = useAuth(); // Get the current user from context
  const params = useLocalSearchParams<{ transactionString?: string }>();

  // Determine if we are in "edit" mode and memoize existingTransaction
  const existingTransaction = useMemo(() => {
    return params.transactionString ? (JSON.parse(params.transactionString) as Transaction) : null;
  }, [params.transactionString]); // Depend on params.transactionString

  const isEditMode = !!existingTransaction;

  // Get data mutation functions from our hook
  const { addTransaction, updateTransaction, deleteTransaction, refreshTransactions } = useTransactions(user.uid);

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Populate form if we are editing an existing transaction
  useEffect(() => {
    if (isEditMode && existingTransaction) {
      setAmount(existingTransaction.amount.toString());
      setCategory(existingTransaction.category);
      setDate(new Date(existingTransaction.date));
      setDescription(existingTransaction.description || '');
    }
  }, [isEditMode, existingTransaction]);

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const validateForm = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        Alert.alert('Invalid Input', 'Please enter a valid amount.');
        return false;
    }
    if (!category) {
        Alert.alert('Invalid Input', 'Please select a category.');
        return false;
    }
    return true;
  };

  const handleSaveOrUpdate = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    const transactionData = {
      type: category === 'Income' ? ('income' as const) : ('expense' as const),
      amount: parseFloat(amount),
      category: category!,
      date: date.toISOString(),
      description,
      uid: user.uid,
    };

    try {
      if (isEditMode && existingTransaction) {
        await updateTransaction(existingTransaction.id, existingTransaction.uid, transactionData);
        await refreshTransactions();
      } else {
        console.log("Adding new transaction:");
        await addTransaction({...transactionData, sync_status: 'LOCAL_ONLY'});
        await refreshTransactions();
      }
      router.setParams({ refreshed: Date.now().toString() });
      router.back();
    } catch (error) {
      console.error("Failed to save transaction:", error);
      Alert.alert('Error', 'Could not save the transaction. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: handleDelete },
      ]
    );
  };

  const handleDelete = async () => {
    if (!isEditMode || !existingTransaction) return;
    setIsSaving(true);
    try {
        await deleteTransaction(existingTransaction);
        await refreshTransactions();
        router.setParams({ refreshed: Date.now().toString() });
        router.back();
    } catch (error) {
        console.error("Failed to delete transaction:", error);
        Alert.alert('Error', 'Could not delete the transaction. Please try again.');
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
    >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.title}>{isEditMode ? 'Edit Transaction' : 'New Transaction'}</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount</Text>
                <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    keyboardType="numeric"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Category</Text>
                <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    data={dropdownData}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Select category"
                    value={category}
                    onChange={item => setCategory(item.value)}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                    <Text style={styles.datePickerText}>{date.toLocaleDateString()}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                    />
                )}
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                    style={[styles.input, styles.descriptionInput]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="e.g., Groceries from store"
                    multiline
                />
            </View>

            <View style={styles.buttonContainer}>
                <ActionButton 
                    title={isEditMode ? 'Update' : 'Save'} 
                    onPress={handleSaveOrUpdate} 
                    disabled={isSaving}
                />
                {isEditMode && (
                    <ActionButton 
                        title="Delete" 
                        onPress={confirmDelete} 
                        color="#FF3B30"
                        disabled={isSaving}
                    />
                )}
                 <ActionButton 
                    title="Cancel" 
                    onPress={() => router.back()} 
                    color="#8E8E93"
                    disabled={isSaving}
                />
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#3C3C43',
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  dropdown: {
    height: 50,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#C7C7CD'
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  datePickerButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  datePickerText: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

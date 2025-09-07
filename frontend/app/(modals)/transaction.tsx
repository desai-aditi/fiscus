import BackButton from '@/components/BackButton';
import Input from '@/components/Input';
import SwitchButton from '@/components/SwitchButton';
import Typo from '@/components/Typo';
import { radius } from '@/constants/scaling';
import { colors } from '@/constants/theme';
import { Transaction } from '@/types/transaction';
import DateTimePicker, { DateType, useDefaultStyles } from 'react-native-ui-datepicker';
import { format } from 'date-fns';
import { scale, verticalScale } from '@/utils/styling';
import { SymbolView } from 'expo-symbols';
import { useState, useRef, useMemo, useEffect, use } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, Modal } from 'react-native';
import Button from '@/components/Button';
import { useAuth } from '@/contexts/authContext';
import { useTransactions } from '@/hooks/useTransactions';
import { useLocalSearchParams } from 'expo-router';
import { useCategories } from '@/hooks/useCategories';

export default function TransactionModal() {
  const {user} = useAuth();

  const { addTransaction, updateTransaction, deleteTransaction, refreshTransactions } = useTransactions(user.uid);
  const {categories} = useCategories(user.uid);

  // existing transaction (edit mode)
  const params = useLocalSearchParams<{ transactionString?: string }>();
  const existingTransaction = useMemo(() => {
    return params.transactionString ? (JSON.parse(params.transactionString) as Transaction) : null;
  }, [params.transactionString]);

  const isEditMode = !!existingTransaction;

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [merchant, setMerchant] = useState('');
  const [place, setPlace] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [date, setDate] = useState<DateType>(new Date()); // Default to today
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isEditMode && existingTransaction) {
      setAmount(existingTransaction.amount.toString());
      setType(existingTransaction.type); // Add this line
      setMerchant(existingTransaction.merchant || ''); // Add this line
      setPlace(existingTransaction.place || ''); // Add this line
      setCategory(existingTransaction.category);
      setDate(new Date(existingTransaction.date));
      setDescription(existingTransaction.description || '');
    }
  }, [isEditMode, existingTransaction]);
  
  const handleAmountChange = (text: string) => {
    const numericText = text.replace(/[^0-9.]/g, '');
    setAmount(numericText);
  };

  const handleDateSelect = (selectedDate: DateType) => {
    setDate(selectedDate);
    setShowDatePicker(false);
  };

const handleSubmit = async () => {
  const transactionData = {
    type: type,
    amount: parseFloat(amount),
    merchant: merchant,
    place: place,
    category: category!,
    date: date.toString(),
    description,
    uid: user.uid,
  };

  try {
    if (isEditMode && existingTransaction) {
      // Update existing transaction
      await updateTransaction(existingTransaction.id, user?.uid, {
        ...transactionData, 
        sync_status: 'LOCAL_ONLY', 
        updated_at: Date.now()
      });
    } else {
      // Add new transaction
      await addTransaction({
        ...transactionData, 
        sync_status: 'LOCAL_ONLY', 
        updated_at: Date.now()
      });
    }
    // Navigate back or show success message
  } catch (error) {
    console.error("Failed to save transaction:", error);
  }
};

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.container}
    >
        <ScrollView style={{gap: verticalScale(16)}}>
          <View style={{
            width: '100%',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: scale(36),
            paddingVertical: verticalScale(20),
            justifyContent: 'center',
            position: 'relative',
          }}>
            {/* Back button on the left */}
            <BackButton style={{ paddingHorizontal: scale(36), position: 'absolute', left: 0 }} />

            {/* Title centered */}
            <Typo size={scale(22)}>
              {isEditMode ? 'Edit transaction' : 'Add new transaction'}
            </Typo>

          </View>

          <View style={{paddingHorizontal: scale(36), gap: verticalScale(16)}}>
            <SwitchButton
              leftLabel="Expense"
              rightLabel="Income"
              isLeftButtonActive={type=='expense'} // or a state variable
              onLeftTabClicked={() => {
                setType('expense')
              }}
              onRightTabClicked={() => {
                setType('income')
              }}
            />
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              onChangeText={handleAmountChange}
              value={amount ? `$${amount}` : '$'}
              placeholder="0.00"
            />
          </View>

          <View style={{width: '100%', marginTop: verticalScale(12), paddingLeft: scale(36)}}>
            <Typo size={14} color={colors.neutral500} style={styles.inputLabel}>Select category</Typo>
            <FlatList
              data={categories}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.category, category === item.value && styles.activeCategory]}
                  onPress={() => setCategory(item.value)}
                >
                  <Text style={{ color: category === item.value ? colors.white : colors.black }}>{item.label}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              contentContainerStyle={styles.categories}
            />
          </View>

          <View style={{paddingHorizontal: scale(36), gap: verticalScale(12)}}>
              <Input 
                label='Merchant name'
                placeholder='Costco'
                containerStyle={styles.inputContainer}
                style={{width: '100%'}}
                onChangeText={setMerchant}
                value={merchant}
              />

              <View style={{width: '100%'}}>
                <Typo size={14} color={colors.neutral500} style={styles.inputLabel}>Date</Typo>
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {format(new Date(date), 'MMM dd, yyyy')}
                  </Text>
                  <SymbolView 
                    name="calendar" 
                    size={20} 
                    tintColor={colors.neutral500}
                  />
                </TouchableOpacity>
              </View>

              <Input 
                label='Place'
                placeholder='None'
                containerStyle={styles.inputContainer}
                style={{width: '100%'}}
                onChangeText={setPlace}
                value={place}
              />

              <Input 
                label='Notes'
                placeholder='Add any description'
                multiline
                containerStyle={[styles.inputContainer, {minHeight: verticalScale(70), borderRadius: radius._10, alignItems: 'flex-start'}]}
                inputStyle={{fontSize: scale(16)}}
                style={{width: '100%'}}
                onChangeText={setDescription}
                value={description}
              />

              <Button style={{backgroundColor: colors.primary}} onPress={handleSubmit}>
                <Typo color={colors.white} size={16}>
                  {isEditMode ? 'Update Transaction' : 'Add Transaction'}
                </Typo>
              </Button>
          </View>
    </ScrollView>

    {/* Date Picker Modal */}
    <Modal
      visible={showDatePicker}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.datePickerModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Date</Text>
            <TouchableOpacity onPress={() => handleDateSelect(date)}>
              <Text style={styles.doneButton}>Done</Text>
            </TouchableOpacity>
          </View>
          
          <DateTimePicker
            mode="single"
            date={date}
            onChange={({ date }) => setDate(date)}
            styles={useDefaultStyles()}
          />
        </View>
      </View>
    </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white
  },
  
  amountInput:{
    minWidth: '100%',
    backgroundColor: colors.neutral200,
    padding: scale(22),
    fontSize: scale(36),
    borderRadius: radius._20,
    textAlign: 'center'
  },
  inputLabel:{
    marginBottom: verticalScale(10),
  },
  inputContainer:{
    backgroundColor: colors.offwhite,
    paddingVertical: verticalScale(10),
    flexDirection: 'row',
    borderRadius: radius._30,
    borderCurve: 'continuous',
    paddingHorizontal: scale(20),
  },
  categories:{
    flexDirection: 'row',
    gap: scale(8),
    marginBottom: verticalScale(16),
    paddingRight: scale(36)
  },
  category:{
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    backgroundColor: colors.neutral100,
    borderRadius: radius._6
  },
  activeCategory: {
    backgroundColor: colors.lightGreen,
  },
  datePickerButton: {
    backgroundColor: colors.offwhite,
    paddingVertical: verticalScale(15),
    paddingHorizontal: scale(20),
    borderRadius: radius._30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: scale(16),
    color: colors.black,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerModal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius._20,
    borderTopRightRadius: radius._20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Account for home indicator
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  modalTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: colors.black,
  },
  cancelButton: {
    fontSize: scale(16),
    color: colors.neutral500,
  },
  doneButton: {
    fontSize: scale(16),
    color: colors.primary,
    fontWeight: '600',
  },
});
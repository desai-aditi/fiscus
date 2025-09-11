import BackButton from '@/components/BackButton';
import Input from '@/components/Input';
import SwitchButton from '@/components/SwitchButton';
import Typo from '@/components/Typo';
import Button from '@/components/Button';
import { radius } from '@/constants/scaling';
import { colors } from '@/constants/theme';
import { Transaction } from '@/types/transaction';
import DateTimePicker, { DateType, useDefaultStyles } from 'react-native-ui-datepicker';
import { Option } from '@/components/inputs/NotionSelect';
import { format } from 'date-fns';
import { scale, verticalScale } from '@/utils/styling';
import { SymbolView } from 'expo-symbols';
import { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Keyboard, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Modal 
} from 'react-native';
import { useAuth } from '@/contexts/authContext';
import { useTransactions } from '@/hooks/useTransactions';
import { useLocalSearchParams, router } from 'expo-router';
import { useCategories } from '@/hooks/useCategories';
import { NotionSelect } from '@/components/inputs/NotionSelect';
import { NotionMultiSelect } from '@/components/inputs/NotionMultiSelect';
import { accountService } from '@/services/accountService';
import { merchantService } from '@/services/merchantService';
import { tagService } from '@/services/tagService';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  amountInput: {
    fontSize: scale(42),
    color: colors.black,
    marginTop: verticalScale(8),
    width: '100%',
  },
  inputLabel: {
    marginBottom: verticalScale(8),
  },
  categories: {
    paddingHorizontal: scale(16),
    gap: scale(8),
  },
  category: {
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    backgroundColor: colors.neutral100,
    borderRadius: radius._8,
  },
  activeCategory: {
    backgroundColor: colors.primary,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.neutral100,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(12),
    borderRadius: radius._8,
  },
  dateText: {
    fontSize: scale(16),
    color: colors.black,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerModal: {
    backgroundColor: colors.white,
    padding: scale(16),
    borderRadius: radius._16,
    width: '90%',
  },
  inputContainer: {
    backgroundColor: colors.neutral100,
    paddingVertical: verticalScale(12),
    flexDirection: 'row',
    borderRadius: radius._8,
    borderCurve: 'continuous',
    paddingHorizontal: scale(12),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(16),
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  modalTitle: {
    fontSize: scale(16),
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
  scrollContent: {
    gap: verticalScale(16),
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(36),
    paddingVertical: verticalScale(20),
    justifyContent: 'center',
    position: 'relative',
  },
  backButtonContainer: {
    paddingHorizontal: scale(36),
    position: 'absolute',
    left: 0,
  },
  amountSection: {
    paddingHorizontal: scale(36),
    gap: verticalScale(16),
  },
  categorySection: {
    width: '100%',
    marginTop: verticalScale(12),
    paddingLeft: scale(36),
  },
  fieldsSection: {
    paddingHorizontal: scale(36),
    gap: verticalScale(12),
  },
  dateContainer: {
    width: '100%',
  },
  notesInput: {
    // ...styles.inputContainer,
    minHeight: verticalScale(70),
    borderRadius: radius._10,
    alignItems: 'flex-start',
  },
});

export default function TransactionModal() {
  const { user } = useAuth();
  
  const [accounts, setAccounts] = useState<Option[]>([]);
  const [merchants, setMerchants] = useState<Option[]>([]);
  const [tags, setTags] = useState<Option[]>([]);

  const { addTransaction, updateTransaction, deleteTransaction, refreshTransactions } = useTransactions(user?.uid || '');
  const { categories } = useCategories(user?.uid || '');

  // Fetch initial data
  useEffect(() => {
    if (user?.uid) {
      // Load accounts
      accountService.getAccounts(user.uid).then(setAccounts);
      // Load merchants
      merchantService.getMerchants(user.uid).then(setMerchants);
      // Load tags
      tagService.getTags(user.uid).then(setTags);
    }
  }, [user?.uid]);

  // existing transaction (edit mode)
  const params = useLocalSearchParams<{ transactionString?: string }>();
  const existingTransaction = useMemo(() => {
    return params.transactionString ? (JSON.parse(params.transactionString) as Transaction) : null;
  }, [params.transactionString]);

  const isEditMode = !!existingTransaction;

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [selectedAccount, setSelectedAccount] = useState<Option | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<Option | null>(null);
  const [selectedTags, setSelectedTags] = useState<Option[]>([]);
  const [place, setPlace] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date()); // Default to today
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isEditMode && existingTransaction && accounts.length > 0 && merchants.length > 0 && tags.length > 0) {
      setAmount(existingTransaction.amount.toString());
      setType(existingTransaction.type);
      setCategory(existingTransaction.category);
      setDate(new Date(existingTransaction.date));
      setDescription(existingTransaction.description || '');
      setPlace(existingTransaction.place || '');
      
      // Set account if it exists
      if (existingTransaction.account) {
        const existingAccount = accounts.find(acc => acc.id === existingTransaction.account);
        if (existingAccount) setSelectedAccount(existingAccount);
      }
      
      // Set merchant if it exists
      if (existingTransaction.merchant) {
        const existingMerchant = merchants.find(m => m.id === existingTransaction.merchant);
        if (existingMerchant) setSelectedMerchant(existingMerchant);
      }
      
      // Set tags if they exist
      if (existingTransaction.tags) {
        try {
          const tagIds = JSON.parse(existingTransaction.tags);
          const existingTags = tags.filter(tag => tagIds.includes(tag.id));
          setSelectedTags(existingTags);
        } catch (error) {
          console.error('Error parsing tags:', error);
        }
      }
    }
  }, [isEditMode, existingTransaction, accounts, merchants, tags]);
  
  const handleAmountChange = (text: string) => {
    // Remove the dollar sign and any non-numeric characters except decimal point
    const cleanText = text.replace('$', '');
    const numericText = cleanText.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = numericText.split('.');
    if (parts.length > 2) {
      return; // Don't update if there are multiple decimal points
    }
    
    setAmount(numericText);
  };

  const handleDateSelect = (selectedDate: DateType) => {
    if (selectedDate) {
      setDate(new Date(selectedDate));
      setShowDatePicker(false);
    }
  };

  // Filter categories based on transaction type
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => cat.type === type);
  }, [categories, type]);

  // Reset category when type changes if it's not compatible
  useEffect(() => {
    if (category && !filteredCategories.find(cat => cat.value === category)) {
      setCategory(null);
    }
  }, [type, category, filteredCategories]);

  const handleSubmit = async () => {
    if (!user?.uid || !selectedAccount || !category || !amount) {
      console.error('Missing required fields');
      return;
    }

    const transactionData = {
      type: type,
      amount: parseFloat(amount),
      account: selectedAccount.id,
      merchant: selectedMerchant?.id || null,
      tags: JSON.stringify(selectedTags.map(tag => tag.id)),
      category: category,
      date: date.toISOString(),
      description,
      place: place,
      uid: user.uid,
    };

    try {
      if (isEditMode && existingTransaction) {
        await updateTransaction(existingTransaction.id, user.uid, {
          ...transactionData, 
          sync_status: 'LOCAL_ONLY', 
          updated_at: Date.now()
        });
      } else {
        await addTransaction({
          ...transactionData, 
          sync_status: 'LOCAL_ONLY', 
          updated_at: Date.now()
        });
      }
      await refreshTransactions();
      router.back(); // Navigate back after successful submission
    } catch (error) {
      console.error('Error submitting transaction:', error);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          {/* Back button on the left */}
          <BackButton style={styles.backButtonContainer} />

          {/* Title centered */}
          <Typo size={scale(22)}>
            {isEditMode ? 'Edit transaction' : 'Add new transaction'}
          </Typo>
        </View>

        <View style={styles.amountSection}>
          <SwitchButton
            leftLabel="Expense"
            rightLabel="Income"
            isLeftButtonActive={type === 'expense'}
            onLeftTabClicked={() => setType('expense')}
            onRightTabClicked={() => setType('income')}
          />
          <TextInput
            style={styles.amountInput}
            keyboardType="numeric"
            onChangeText={handleAmountChange}
            value={amount ? `$${amount}` : '$'}
            placeholder="$0.00"
          />
        </View>

        <View style={styles.categorySection}>
          <Typo size={14} color={colors.neutral500} style={styles.inputLabel}>
            Select category
          </Typo>
          <FlatList
            data={filteredCategories}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.category, category === item.value && styles.activeCategory]}
                onPress={() => setCategory(item.value)}
              >
                <Text style={{ 
                  color: category === item.value ? colors.white : colors.black 
                }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.value}
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled
            contentContainerStyle={styles.categories}
          />
        </View>

        <View style={styles.fieldsSection}>
          <NotionSelect
            value={selectedAccount}
            options={accounts}
            placeholder="Select or create account..."
            onSelect={setSelectedAccount}
            onCreateNew={async (name) => {
              if (!user?.uid) throw new Error('User not logged in');
              const newAccount = await accountService.createAccount(user.uid, name);
              setAccounts([...accounts, newAccount]);
              return newAccount;
            }}
            label="Account"
          />

          <NotionSelect
            value={selectedMerchant}
            options={merchants}
            placeholder="Select or create merchant..."
            onSelect={setSelectedMerchant}
            onCreateNew={async (name) => {
              if (!user?.uid) throw new Error('User not logged in');
              const newMerchant = await merchantService.createMerchant(user.uid, name);
              setMerchants([...merchants, newMerchant]);
              return newMerchant;
            }}
            label="Merchant"
          />

          <NotionMultiSelect
            value={selectedTags}
            options={tags}
            placeholder="Select or create tags..."
            onSelect={setSelectedTags}
            onCreateNew={async (name) => {
              if (!user?.uid) throw new Error('User not logged in');
              const newTag = await tagService.createTag(user.uid, name);
              setTags([...tags, newTag]);
              return newTag;
            }}
            label="Tags"
          />

          <View style={styles.dateContainer}>
            <Typo size={14} color={colors.neutral500} style={styles.inputLabel}>
              Date
            </Typo>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateText}>
                {format(date, 'MMM dd, yyyy')}
              </Text>
              <SymbolView 
                name="calendar" 
                size={20} 
                tintColor={colors.neutral500}
              />
            </TouchableOpacity>
          </View>

          <Input 
            label="Place"
            placeholder="None"
            containerStyle={styles.inputContainer}
            style={{width: '100%'}}
            onChangeText={setPlace}
            value={place}
          />

          <Input 
            label="Notes"
            placeholder="Add any description"
            multiline
            containerStyle={styles.notesInput}
            inputStyle={{fontSize: scale(16)}}
            style={{width: '100%'}}
            onChangeText={setDescription}
            value={description}
          />

          <Button 
            style={{
              backgroundColor: (!selectedAccount || !category || !amount || parseFloat(amount) <= 0) 
                ? colors.neutral300 
                : colors.primary
            }} 
            onPress={handleSubmit}
            disabled={!selectedAccount || !category || !amount || parseFloat(amount) <= 0}
          >
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
              onChange={({ date: selectedDate }) => {
                if (selectedDate) {
                  if (typeof selectedDate === 'string') {
                    setDate(new Date(selectedDate));
                  } else if (selectedDate instanceof Date) {
                    setDate(selectedDate);
                  } else {
                    // Handle dayjs object
                    setDate(new Date(selectedDate.valueOf()));
                  }
                }
              }}
              styles={useDefaultStyles()}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
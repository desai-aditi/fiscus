import Button from '@/components/Button';
import Input from '@/components/Input';
import ModalWrapper from '@/components/ModalWrapper';
import Typo from '@/components/Typo';
import { expenseCategories } from '@/constants/data';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/contexts/authContext';
import { useTransactions } from '@/hooks/useTransactions';
// import { createOrUpdateTransaction, deleteTransaction } from '@/services/transactionService';
import { TransactionType } from '@/types';
import { scale, verticalScale } from '@/utils/styling';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { GoogleGenAI, Type } from '@google/genai';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

export default function TransactionModal() {
  const { user, updateUserData } = useAuth();

  const { addTransaction, updateTransaction, deleteTransaction } = useTransactions(user.uid);

  const [transaction, setTransaction] = useState<TransactionType>({
    amount: 0,
    description: "",
    category: "",
    type: 'expense',
    date: new Date().toISOString(),
    uid: user?.uid
  });

  // Ensure type matches category selection
  useEffect(() => {
    if (transaction.category === "Income") {
      setTransaction(prev => ({ ...prev, type: "income" }));
    } else if (transaction.type !== "expense") {
      setTransaction(prev => ({ ...prev, type: "expense" }));
    }
  }, [transaction.category]);

  const [amountInput, setAmountInput] = useState("0");
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const router = useRouter();

  type paramType = {
    id?: string;
    type?: string;
    amount?: string;
    category?: string;
    date?: string;
    description?: string;
    uid: string;
  }
  const oldTransaction = useLocalSearchParams() as paramType;

  useEffect(() => {
    if (oldTransaction?.id) {
      setTransaction({
        type: oldTransaction?.type === "income" ? "income" : "expense",
        amount: Number(oldTransaction?.amount),
        description: oldTransaction?.description || "",
        id: oldTransaction?.id,
        category: oldTransaction?.category || "",
        date: oldTransaction.date && !isNaN(new Date(oldTransaction.date).getTime())
          ? new Date(oldTransaction.date).toISOString()
          : new Date().toISOString(),
        uid: oldTransaction?.uid
      });
      setAmountInput(oldTransaction?.amount || "0");
    } else if (oldTransaction?.date) {
      const parsedDate = new Date(oldTransaction.date);
      setTransaction(prev => ({
        ...prev,
        type: oldTransaction.type === "income" ? "income" : "expense",
        date: isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString(), // ✅ Only set if valid
      }));
      setAmountInput("0");
    }
  }, []);

  const onDateChange = (event: DateTimePickerEvent, selectedDate: Date) => {
    const currentDate = selectedDate || transaction.date;
    setTransaction({...transaction, date: currentDate});
    setShowDatePicker(false)
  }

  const onSubmit = async () => {
    const {type, description, category, date} = transaction;
    const amount = Number(amountInput);

    if(type === 'expense' ? !date || amount <= 0 || !category : !date || amount <= 0) {
      Alert.alert("Transaction", "Please fill in all the fields");
      return;
    }

    setLoading(true);

    try {
      if (oldTransaction?.id) {
        // Update existing transaction
        await updateTransaction(oldTransaction.id, {
          amount,
          description,
          category,
          type,
          date
        });
      } else {
        // Add new transaction
        await addTransaction({
          amount,
          description,
          category,
          type,
          date,
          uid: user?.uid || ''
        });
      }
      router.back();
    } catch (error) {
      console.log("Error saving transaction:", error);
      Alert.alert("Transaction", "Failed to save transaction");
    } finally {
      setLoading(false);
    }
  }

  const onDelete = async () => {
    setLoading(true);
    
    try {
      await deleteTransaction(oldTransaction?.id || '');
      router.back();
    } catch (error) {
      console.log("Error deleting transaction:", error);
      Alert.alert("Transaction", "Failed to delete transaction");
    } finally {
      setLoading(false);
    }
  }

  const showDeleteAlert = () => {
    Alert.alert("Transaction", "Are you sure you want to delete this transaction?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
        onPress: () => onDelete(),
        style: "destructive"
      }
    ])
  }

  const [isFocus, setIsFocus] = useState(false);

  const categoryOptions = [
    { label: 'Income', value: 'Income' },
    ...Object.values(expenseCategories)
  ];

  const handleNumpadPress = (value: string) => {
    if (value === 'backspace') {
      if (amountInput.length === 1) {
        setAmountInput("0");
      } else {
        setAmountInput(amountInput.slice(0, -1));
      }
    } else if (value === '.') {
      if (!amountInput.includes('.')) {
        setAmountInput(amountInput + '.');
      }
    } else {
      if (amountInput === "0") {
        setAmountInput(value);
      } else {
        setAmountInput(amountInput + value);
      }
    }
  };

  const renderNumpad = () => {
    const buttons = [
      '1','2','3',
      '4','5','6',
      '7','8','9',
      '.', '0', 'backspace'
    ];

    return (
      <View style={styles.numpadContainer}>
        {buttons.map((btn) => (
          <TouchableOpacity
            key={btn}
            style={styles.numpadButton}
            onPress={() => handleNumpadPress(btn)}
            activeOpacity={0.7}
          >
            {btn === 'backspace' ? (
              <FontAwesome5 name="backspace" size={verticalScale(24)} color={colors.white} />
            ) : (
              <Text style={styles.numpadButtonText}>{btn}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // const onScan = async () => {
  //   try {
  //     setLoading(true);
  //   const genAI = new GoogleGenAI({apiKey: 'AIzaSyC0YXx41Yy6CJqVc3wnMqoVffBzLfsZbi4'});

  //   // launch image picker
  //   let result = await ImagePicker.launchImageLibraryAsync({
  //     mediaTypes: ['images'],
  //   });

  //   const fileUri = FileSystem.cacheDirectory + 'temp.jpg';

  //   if (!result.canceled) {
  //     await FileSystem.downloadAsync(result.assets[0].uri, fileUri);
  //   }

  //   // Read the file as base64
  //   const base64ImageData = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.Base64 });

  //   // prompt model to extract information from the image
  //   // Generate content using structured output
  //   const response = await genAI.models.generateContent({
  //     model: "gemini-2.5-flash",
  //     contents: [
  //       {
  //         inlineData: {
  //           mimeType: 'image/jpeg',
  //           data: base64ImageData,
  //         },
  //       },
  //       {
  //         text: "You are part of an expense tracker app. Extract and return total amount, category, and purchase date from this receipt image. Convert the date from whatever format it is to ISO 8601 standard format. Generate a short, one-sentence, accurate description of the transaction.",
  //       }
  //     ],
  //     config: {
  //       responseMimeType: "application/json",
  //       responseSchema: {
  //         type: Type.OBJECT,
  //         properties: {
  //           amount: { type: Type.NUMBER },
  //           category: {
  //             type: Type.STRING,
  //             enum: [
  //               "income", "groceries", "rent", "utilities", "transportation",
  //               "entertainment", "dining", "health", "savings", "clothing", "personal"
  //             ]
  //           },
  //           date: { type: Type.STRING }, // Optionally format: Type.DATE
  //           description: { type: Type.STRING },
  //         },
  //         required: [], // optional: can add ['amount', 'category', 'date'] if strict
  //       },
  //     }
  //   });

  //   const data = response.text ? JSON.parse(response.text) : {};
  //   console.log("Extracted data:", data);

  //   setTransaction(prev => ({
  //     ...prev,
  //     amount: typeof data.amount === 'number' ? data.amount : prev.amount,
  //     category: data.category ?? prev.category,
  //     date: typeof data.date === 'string' && !isNaN(Date.parse(data.date))
  //       ? new Date(data.date)
  //       : prev.date,
  //     description: data.description || prev.description,
  //   }));
  //   setAmountInput(
  //     typeof data.amount === 'number' ? data.amount.toString() : amountInput
  //   );
  //   } catch (error) {
  //     console.error("Error during receipt scan:", error);
  //   } finally{
  //     setLoading(false);
  //   }
  // }

  return (
   <ModalWrapper bg={colors.primaryDark}>
      <View style={styles.container}>
        {/* Top Section - Amount and Description */}
        <View style={styles.topSection}>
          {/* Amount display - Super big at the top */}
          <View style={styles.amountDisplayContainer}>
            <Typo style={styles.amountDisplayText}>${amountInput}</Typo>
          </View>
          
          {/* Description input - Small, expandable */}
          <View>
            <Input 
              multiline
              placeholder='Description'
              icon={<FontAwesome5 name="file-alt" size={20} color="white" />}
              value={transaction.description}
              onPress={() => {}}
              onChangeText={(value) => 
                setTransaction({
                  ...transaction,
                  description: value
                })
              }
            />
          </View>
        </View>

        {/* Spacer to push bottom content down */}
        <View style={styles.spacer} />
        
        {/* Bottom Section - Pills, Numpad, Button */}
        <View style={styles.bottomSection}>
          {/* Pills row */}
          <View style={styles.pillRow}>
            {/* Category pill */}
            <View style={styles.pill}>
              <Dropdown
                style={styles.dropdownContainer}
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                iconStyle={{display: 'none', width: 0, height: 0}}
                data={categoryOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                itemTextStyle={styles.dropdownItemText}
                itemContainerStyle={styles.dropdownItemContainer}
                containerStyle={styles.dropdownListContainer}
                placeholder={!isFocus ? "Category" : "..."}
                value={transaction.category}
                onChange={item => {
                  if (!item.disabled) {
                    setTransaction({ ...transaction, category: item.value });
                  }
                }}
                activeColor="transparent"
                renderLeftIcon={() => (
                  <FontAwesome5
                    style={styles.icon}
                    color={isFocus ? 'blue' : 'white'}
                    name="hand-pointer"
                    size={20}
                  />
                )}
              />
            </View>

            {/* Date pill */}
            <View style={styles.pill}>
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={styles.datePillContent}
              >
                <FontAwesome5 name="calendar" size={16} color={colors.white} style={{marginRight: 8}} />
                <Typo size={14} color={colors.white}>
                  {format(new Date(transaction.date), 'MMM d, yyyy')}
                </Typo>
              </Pressable>
              {showDatePicker && (
                <View style={styles.datePickerPopover}>
                  <DateTimePicker
                    themeVariant='dark'
                    value={new Date(transaction.date)}
                    textColor={colors.white}
                    mode='date'
                    display='default'
                    onChange={(event, selectedDate) => {
                      if (event.type === 'set' && selectedDate) {
                        setTransaction({...transaction, date: selectedDate.toISOString()});
                      }
                    }}
                  />
                  <TouchableOpacity
                    style={styles.datePickerDoneButton}
                    onPress={() => setShowDatePicker(false)}
                    activeOpacity={0.8}
                  >
                    <Typo fontWeight={700} color={colors.white}>Done</Typo>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* scan pill */}
            <View style={[styles.pill, {flex: 0.2, justifyContent: 'center', alignItems: 'center'}]}>
              <Pressable
                onPress={() => onScan()}
              >
                <FontAwesome5 name="receipt" size={16} color={colors.white} style={{marginRight: 8}} />
              </Pressable>
            </View>
          </View>

          {/* Numpad */}
          {renderNumpad()}

          {/* Footer with buttons */}
          <View style={styles.footer}>
            {oldTransaction?.id && !loading && (
              <Button onPress={showDeleteAlert} style={styles.deleteButton}>
                <FontAwesome5 name="trash" size={verticalScale(20)} color={colors.white} />
              </Button>
            )}

            <Button onPress={onSubmit} style={styles.submitButton}>
              <Typo color={colors.text} fontWeight={700}>
                {oldTransaction?.id ? "Update" : "Add"}
              </Typo>
            </Button>
          </View>
        </View>
      </View>
    </ModalWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
  },
  
  // Top section with amount and description
  topSection: {
    paddingTop: spacingY._20,
  },
  
  amountDisplayContainer: {
    alignItems: 'center',
    marginBottom: spacingY._30,
  },
  
  amountDisplayText: {
    fontSize: verticalScale(80),
    color: colors.white,
    fontWeight: '300',
  },
  
  
  // Spacer to push content to bottom
  spacer: {
    flex: 1,
  },
  
  // Bottom section with pills, numpad, and buttons
  bottomSection: {
    paddingBottom: spacingY._30,
  },
  
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: scale(12),
  },
  
  pill: {
    position: 'relative',
    backgroundColor: colors.primaryLight,
    flex: 1,
    height: verticalScale(48),
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._15,
    justifyContent: 'center',
    overflow: 'visible',
  },
  
  datePillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  
  numpadContainer: {
    width: '100%',
    height: verticalScale(240),
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    // alignItems: 'stretch',
    marginBottom: spacingY._25,
    gap: verticalScale(10),
  },
  
  numpadButton: {
    width: '31%',
    aspectRatio: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    textAlignVertical: 'center',
  },
  
  numpadButtonText: {
    fontSize: verticalScale(28),
    color: colors.white,
    fontWeight: '400',
    textAlignVertical: 'center'
  },
  
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(12),
    marginTop: spacingY._15,
  },
  
  deleteButton: {
    backgroundColor: colors.rose,
    paddingHorizontal: spacingX._20,
    minWidth: verticalScale(50),
  },
  
  submitButton: {
    flex: 1,
    backgroundColor: colors.neutral100,
  },
  
  // Date picker styles
  datePickerPopover: {
    position: 'absolute',
    top: verticalScale(50),
    left: 0,
    right: 0,
    zIndex: 999,
    padding: spacingY._15,
    backgroundColor: colors.primaryLight,
    borderRadius: radius._15,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  
  datePickerDoneButton: {
    marginTop: spacingY._15,
    backgroundColor: colors.primary,
    borderRadius: radius._10,
    paddingVertical: spacingY._10,
    paddingHorizontal: spacingX._20,
    alignSelf: 'center',
  },
  
  // Dropdown styles
  dropdownContainer: {
    width: '100%',
  },
  
  dropdownItemText: {
    color: colors.white,
    fontSize: verticalScale(14),
  },
  
  dropdownSelectedText: {
    color: colors.white,
    fontSize: verticalScale(14),
  },
  
  dropdownListContainer: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius._20,
    paddingVertical: spacingY._12,
    top: 5,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 6,
    width: '50%'
  },
  
  dropdownPlaceholder: {
    color: colors.white,
    fontSize: verticalScale(14),
  },
  
  dropdownItemContainer: {
    borderRadius: radius._10,
    marginHorizontal: spacingX._12,
    marginVertical: spacingY._3,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    backgroundColor: 'transparent',
  },
  
  icon: {
    marginRight: spacingX._8,
    color: colors.white,
  }
});
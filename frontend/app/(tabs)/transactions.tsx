import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState, useMemo } from 'react';
import ScreenWrapper from '@/components/ScreenWrapper';
import Typo from '@/components/Typo';
import { SymbolView } from 'expo-symbols';
import { colors } from '@/constants/theme';
import { scale, verticalScale } from '@/utils/styling';
import { radius, spacingX, spacingY } from '@/constants/scaling';
import { MultiSelect } from 'react-native-element-dropdown';
import { useAuth } from '@/contexts/authContext';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionList } from '@/components/TransactionList';
import { useCategories } from '@/hooks/useCategories';
import { DateType, useDefaultStyles } from 'react-native-ui-datepicker';
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';

const merchantData = [
  { label: 'Amazon', value: 'amazon' },
  { label: 'Starbucks', value: 'starbucks' },
  { label: 'Walmart', value: 'walmart' },
  { label: 'Target', value: 'target' },
];

export default function Transactions() {
  const { user } = useAuth();
  const { transactions } = useTransactions(user?.uid);
  const { categories } = useCategories(user.uid);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);

  const [range, setRange] = useState<{
    startDate: DateType;
    endDate: DateType;
  }>({ startDate: undefined, endDate: undefined });
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const defaultStyles = useDefaultStyles();

  // Helper function to convert DateType to Date
  const convertToDate = (dateValue: DateType): Date | null => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'string') return new Date(dateValue);
    if (typeof dateValue === 'number') return new Date(dateValue);
    // Handle Dayjs objects
    if (dayjs.isDayjs(dateValue)) return dateValue.toDate();
    return null;
  };

  // Format date display
  const formatDateRange = () => {
    if (!range.startDate && !range.endDate) return 'Select Date Range';
    
    const startDate = convertToDate(range.startDate);
    const endDate = convertToDate(range.endDate);
    
    if (startDate && !endDate) return `From ${dayjs(startDate).format('MMM DD')}`;
    if (!startDate && endDate) return `To ${dayjs(endDate).format('MMM DD')}`;
    if (startDate && endDate) return `${dayjs(startDate).format('MMM DD')} - ${dayjs(endDate).format('MMM DD')}`;
    
    return 'Select Date Range';
  };

  // Filter transactions based on selected filters
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];
    
    return transactions.filter((tx) => {
      // Category filter
      const matchesCategory = 
        selectedCategories.length === 0 || selectedCategories.includes(tx.category);
      
      // Merchant filter
      const matchesMerchant = 
        selectedMerchants.length === 0 || selectedMerchants.includes(tx.merchant ?? '');
      
      // Date range filter
      let matchesDate = true;
      if (range.startDate || range.endDate) {
        const txDate = new Date(tx.date);
        const startDate = convertToDate(range.startDate);
        const endDate = convertToDate(range.endDate);
        
        if (startDate && endDate) {
          matchesDate = txDate >= startDate && txDate <= endDate;
        } else if (startDate) {
          matchesDate = txDate >= startDate;
        } else if (endDate) {
          matchesDate = txDate <= endDate;
        }
      }
      
      return matchesCategory && matchesMerchant && matchesDate;
    });
  }, [transactions, selectedCategories, selectedMerchants, range]);

  // Handle date picker confirmation
  const handleDateRangeConfirm = () => {
    setOpenDatePicker(false);
  };

  // Clear date range
  const clearDateRange = () => {
    setRange({ startDate: undefined, endDate: undefined });
    setOpenDatePicker(false);
  };

  // Get display text for selected filters
  const getFilterDisplayText = (item: string) => {
    return categories.find(d => d.value === item)?.label ||
           merchantData.find(d => d.value === item)?.label ||
           item;
  };

  // Remove filter
  const removeFilter = (item: string) => {
    if (selectedCategories.includes(item)) {
      setSelectedCategories(prev => prev.filter(val => val !== item));
    } else {
      setSelectedMerchants(prev => prev.filter(val => val !== item));
    }
  };

  return (
    <ScreenWrapper style={{ gap: verticalScale(16) }}>
      {/* Header */}
      <View style={styles.header}>
        <Typo size={22} fontWeight={'medium'}>Transactions</Typo>
        <SymbolView name="magnifyingglass" size={28} tintColor={colors.black} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          {/* Category Filter */}
          <MultiSelect
            style={[styles.dropdown, styles.flexGrow]}
            placeholderStyle={styles.placeholderStyle}
            containerStyle={styles.containerStyle}
            selectedTextStyle={styles.selectedTextStyle}
            itemTextStyle={styles.itemStyle}
            renderItem={(item) => {
              const isSelected = selectedCategories.includes(item.value);
              return (
                <View style={styles.itemContainer}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  {isSelected && (
                    <SymbolView 
                      name="checkmark.square.fill" 
                      size={18} 
                      tintColor={colors.primary} 
                    />
                  )}
                </View>
              );
            }}
            data={categories || []}
            labelField="label"
            valueField="value"
            placeholder="Category"
            value={selectedCategories}
            onChange={setSelectedCategories}
            visibleSelectedItem={false}
          />

          {/* Merchant Filter */}
          <MultiSelect
            style={[styles.dropdown, styles.flexGrow]}
            placeholderStyle={styles.placeholderStyle}
            containerStyle={styles.containerStyle}
            selectedTextStyle={styles.selectedTextStyle}
            itemTextStyle={styles.itemStyle}
            renderItem={(item) => {
              const isSelected = selectedMerchants.includes(item.value);
              return (
                <View style={styles.itemContainer}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  {isSelected && (
                    <SymbolView 
                      name="checkmark.square.fill" 
                      size={18} 
                      tintColor={colors.primary} 
                    />
                  )}
                </View>
              );
            }}
            data={merchantData}
            labelField="label"
            valueField="value"
            placeholder="Merchant"
            value={selectedMerchants}
            onChange={setSelectedMerchants}
            visibleSelectedItem={false}
          />

          {/* Date Range Button */}
          <TouchableOpacity
            style={[styles.dropdown, styles.dateButton]}
            onPress={() => setOpenDatePicker(!openDatePicker)}
          >
            <Typo size={14} color={colors.neutral500}>
               <SymbolView 
                name="calendar" 
                size={scale(18)} 
                tintColor={colors.neutral500} 
              />
            </Typo>
          </TouchableOpacity>
        </View>

        {/* Date Picker */}
        {openDatePicker && (
          <View style={styles.datePickerContainer}>
            <DateTimePicker
              mode="range"
              startDate={range.startDate}
              endDate={range.endDate}
              onChange={(params) => setRange(params)}
              styles={defaultStyles}
            />
            <View style={styles.datePickerActions}>
              <TouchableOpacity onPress={clearDateRange} style={styles.actionButton}>
                <Typo size={14} color={colors.neutral500}>Clear</Typo>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDateRangeConfirm} style={styles.actionButton}>
                <Typo size={14} color={colors.primary}>Confirm</Typo>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Selected Filter Tags */}
        {(selectedCategories.length > 0 || selectedMerchants.length > 0 || range.startDate || range.endDate) && (
          <View style={styles.selectedTagsContainer}>
            {/* Category and Merchant tags */}
            {[...selectedCategories, ...selectedMerchants].map((item) => (
              <TouchableOpacity
                key={item}
                onPress={() => removeFilter(item)}
                style={styles.selectedTag}
              >
                <Text style={styles.selectedTagText}>
                  {getFilterDisplayText(item)}
                </Text>
                <SymbolView tintColor={colors.black} name="xmark" size={scale(12)} />
              </TouchableOpacity>
            ))}

            {/* Date range tag */}
            {(range.startDate || range.endDate) && (
              <TouchableOpacity
                onPress={clearDateRange}
                style={styles.selectedTag}
              >
                <Text style={styles.selectedTagText}>
                  {formatDateRange()}
                </Text>
                <SymbolView tintColor={colors.black} name="xmark" size={scale(12)} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Transaction List */}
      <TransactionList data={filteredTransactions} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  dropdown: {
    paddingVertical: spacingY._5,
    paddingHorizontal: spacingX._12,
    backgroundColor: colors.neutral200,
    borderRadius: radius._20,
  },
  flexGrow: {
    flexGrow: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  containerStyle: {
    marginTop: verticalScale(6),
    borderRadius: radius._10,
    shadowOpacity: 0,
    padding: scale(12),
    width: '40%',
  },
  placeholderStyle: {
    fontSize: scale(15),
    color: colors.neutral500,
  },
  selectedTextStyle: {
    fontSize: scale(15),
    color: colors.black,
  },
  itemStyle: {
    fontSize: scale(14),
    color: colors.black,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(8),
  },
  itemLabel: {
    fontSize: scale(14),
    color: colors.black,
  },
  datePickerContainer: {
    backgroundColor: colors.white,
    borderRadius: radius._10,
    padding: scale(16),
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(5),
  },
  actionButton: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(16),
    borderRadius: radius._10,
    backgroundColor: colors.neutral100,
  },
  selectedTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedTag: {
    flexDirection: 'row',
    gap: scale(4),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius._10,
    padding: scale(8),
    backgroundColor: colors.neutral200,
    elevation: 2,
  },
  selectedTagText: {
    fontSize: scale(13),
    color: colors.black,
  },
});
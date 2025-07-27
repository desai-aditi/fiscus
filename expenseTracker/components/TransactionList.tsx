import { expenseCategories, incomeCategory } from '@/constants/data';
import { colors, radius, spacingX, spacingY } from '@/constants/theme';
import { TransactionItemProps, TransactionType } from '@/types';
import { verticalScale } from '@/utils/styling';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Loading from './Loading';
import Typo from './Typo';

type TransactionListProps = {
  groupedTransactions: Record<string, TransactionType[]>;
  title?: string;
  loading?: boolean;
  emptyListMessage?: string;
};

const TransactionList = ({
  groupedTransactions,
  title,
  loading,
  emptyListMessage
}: TransactionListProps) => {
  const router = useRouter();

  const handleClick = (item: TransactionType) => {
    router.push({
      pathname: "/(modals)/transactionModal",
      params: {
        id: item?.id,
        type: item?.type,
        amount: item?.amount?.toString(),
        category: item?.category,
        date: item?.date,
        description: item?.description,
        uid: item?.uid
      }
    });
  };

  // Sort date keys descending (latest first)
  const sortedDateKeys = Object.keys(groupedTransactions || {}).sort((a, b) => b.localeCompare(a));

  return (
    <View style={styles.container}>
      {title && (
        <Typo color={colors.text} fontWeight="600" size={18}>{title}</Typo>
      )}
      {sortedDateKeys.length > 0 ? (
        sortedDateKeys.map((groupLabel, sectionIndex) => {
          const dateObj = parseISO(groupLabel);
          let label = format(dateObj, "EEE, MMMM d");
          if (isToday(dateObj)) label = "Today";
          else if (isYesterday(dateObj)) label = "Yesterday";

          return (
            <View key={groupLabel} style={styles.section}>
              <Typo size={16} fontWeight="600" style={styles.dateHeading}>{label}</Typo>
              <View style={styles.transactionGroup}>
                {groupedTransactions[groupLabel].map((item, index) => (
                  <TransactionItem
                    key={item.id}
                    item={item}
                    index={sectionIndex * 100 + index}
                    handleClick={handleClick}
                  />
                ))}
              </View>
            </View>
          );
        })
      ) : (
        !loading && (
          <View style={styles.emptyState}>
            <Typo size={16} color={colors.textMuted} style={styles.emptyMessage}>
              {emptyListMessage}
            </Typo>
          </View>
        )
      )}
      {loading && (
        <View style={styles.loadingState}>
          <Loading />
        </View>
      )}
    </View>
  );
};

const TransactionItem = ({ item, index, handleClick }: TransactionItemProps) => {
  const category = item?.type === 'income' ? incomeCategory : expenseCategories[item.category!];
  const dateObj = new Date(item.date);
  const date = dateObj.toLocaleString('en-US', { month: 'long', day: 'numeric' });

  return (
    <TouchableOpacity style={styles.row} onPress={() => handleClick(item)}>
      <View style={[styles.icon, { backgroundColor: category.bgColor }]}>
        <FontAwesome6 name={category.icon} size={verticalScale(20)} color={colors.white} weight='fill' />
      </View>
      <View style={styles.categoryDes}>
        <Typo size={16} fontWeight="500" color={colors.text}>{category.label}</Typo>
        <Typo style={{display: item.description === '' ? 'none' : 'flex'}} size={13} color={colors.textSecondary} textProps={{ numberOfLines: 1 }}>
          {item.description}
        </Typo>
      </View>
      <View style={styles.amountDate}>
        <Typo fontWeight='600' size={15} color={item?.type === 'income' ? colors.success : colors.error}>
          {`${item?.type === 'income' ? "+" : "-"}$${item?.amount}`}
        </Typo>
        <Typo size={12} color={colors.textMuted}>{date}</Typo>
      </View>
    </TouchableOpacity>
  );
};

export default TransactionList;

const styles = StyleSheet.create({
  container: {
    gap: spacingY._10,
  },
  section: {
    marginBottom: spacingY._15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacingX._12,
    backgroundColor: colors.white,
    padding: spacingX._15,
  },
  transactionGroup: {
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._12,
    overflow: 'hidden',
    backgroundColor: colors.cardBg,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  icon: {
    height: verticalScale(42),
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: radius._10,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryDes: {
    flex: 1,
    gap: 3,
  },
  amountDate: {
    alignItems: "flex-end",
    gap: 4,
  },
  dateHeading: {
    marginVertical: spacingY._7,
    color: colors.textSecondary,
    fontSize: verticalScale(16),
    paddingHorizontal: spacingX._15
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacingY._40,
    backgroundColor: colors.surfaceBg,
    borderRadius: radius._15,
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderStyle: 'dashed',
  },
  emptyMessage: {
    textAlign: "center",
    fontStyle: 'italic',
  },
  loadingState: {
    paddingTop: verticalScale(60),
    alignItems: 'center',
  },
});
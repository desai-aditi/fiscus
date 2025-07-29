import { TotalsType, TransactionType } from "@/types";

///// NEW NEW NEW LOCAL FIRST /////
import { db } from '@/config/database';

export class TransactionService {
    
    // fetch transactions
    static async getAllTransactions(uid: string): Promise<TransactionType[]> {
        const result = await db.getAllAsync<TransactionType>(
            'SELECT * FROM transactions WHERE uid = ? ORDER BY date DESC', [uid]
        );
        return result;
    }

    static async getTotals(uid: string): Promise<TotalsType>{
        const transactions = await this.getAllTransactions(uid);

        return transactions.reduce((acc: TotalsType, item: TransactionType) => {
            const amount = Number(item.amount) || 0;
            
            if (item.type === 'income') {
            acc.income += amount;
            } else if (item.type === 'expense') {
            acc.expenses += amount;
            }
            
            acc.balance = acc.income - acc.expenses;
            return acc;
        }, { balance: 0, income: 0, expenses: 0 });
    }

    // add transaction
    static async addTransaction(transaction: Omit<TransactionType, 'id'>): Promise<string> {
        const id = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`  ;

        await db.runAsync(
            `INSERT INTO transactions (id, type, amount, category, date, description, uid) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, transaction.type, transaction.amount, transaction.category, transaction.date, transaction.description || '', transaction.uid]
        );
        return id;
    }

    // update transaction
    static async updateTransaction(id: string, updates: Partial<Omit<TransactionType, 'id' | 'uid'>>): Promise<void>{
        const fields: string[] = [];
        const values: any[] = [];
        
        Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
        });
        
        if (fields.length === 0) return;
        
        values.push(id);
        
        await db.runAsync(
        `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`,
        values
        );
    }

    // delete transaction
    static async deleteTransaction(id: string): Promise<void> {
        await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
    }

    // group transactions by date
    static groupTransactionsByDate(transactions: TransactionType[]): Record<string, TransactionType[]> {
        return transactions.reduce((groups, transaction) => {
        const dateKey = transaction.date.split('T')[0]; // Get just the date part
        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(transaction);
        return groups;
        }, {} as Record<string, TransactionType[]>);
    }
}

///////////////////////////////////////////////// NOT UPDATING RN ///////////////////////////////////////////////////
// export const createOrUpdateTransaction = async (
//     transactionData: Partial<TransactionType>
// ): Promise<ResponseType> => {
//     try {
//         let { id, type, amount, category } = transactionData;

//         // // Automatically set type to 'income' if category is 'income'
//         // if (category === 'income') {
//         //     transactionData.type = 'income';
//         // }

//         if (!amount || amount <= 0 || !type) {
//             return { success: false, msg: "invalid transaction data!" };
//         }

//         // create transaction 
//         const transactionRef = id
//             ? doc(firestore, "transactions", id)
//             : doc(collection(firestore, "transactions"));

//         await setDoc(transactionRef, transactionData, { merge: true });

//         return { success: true, data: { ...transactionData, id: transactionRef.id } };
//     } catch (err: any) {
//         // console.log('error', err)
//         return { success: false, msg: err.message }
//     }
// };

// export const deleteTransaction = async (
//     id: string,
// ) => {
//     try {
//         const transactionRef = doc(firestore, "transactions", id);

//         await deleteDoc(transactionRef);

//         return { success: true, data: {id: transactionRef.id}};
//     } catch (err: any) {
//         // console.log('error', err)
//         return { success: false, msg: err.message }
//     }
// }

// export const fetchWeeklyStats = async (
//     uid: string,
// ): Promise<ResponseType> => {
//     try {
//         const db = firestore;
//         const today = new Date();
//         const sevenDaysAgo = new Date(today);
//         sevenDaysAgo.setDate(today.getDate() - 7);

//         const transationsQuery = query(
//             collection(db, "transactions"),
//             where("date", ">=", Timestamp.fromDate(sevenDaysAgo)),
//             where("date", "<=", Timestamp.fromDate(today)),
//             orderBy("date", "desc"),
//             where("uid", "==", uid)
//         );

//         const querySnapshot = await getDocs(transationsQuery);
//         const weeklyData = getLast7Days();
//         const transactions: TransactionType[] = [];

//         querySnapshot.forEach((doc) => {
//             const transaction = doc.data() as TransactionType;
//             transaction.id = doc.id;
//             transactions.push(transaction);

//             const transactionDate =(transaction.date as Timestamp).toDate().toISOString().split('T')[0];
//             const dayData = weeklyData.find((day) => day.date === transactionDate);

//             if(dayData){
//                 if(transaction.type === "income"){
//                     dayData.income += transaction.amount || 0;
//                 } else if(transaction.type === "expense"){
//                     dayData.expense += transaction.amount || 0;
//                 }
//             }
//         });

//         const stats = weeklyData.flatMap((day) => [
//             {
//                 value: day.income,
//                 label: day.day,
//                 spacing: scale(4),
//                 labelWidth: scale(30),
//                 frontColor: colors.primary
//             },
//             {value: day.expense, frontColor: colors.rose},
//         ]);

//         return {
//             success: true,
//             data: {
//                 stats,
//                 transactions,
//             },
//         };
//     } catch (err: any) {
//         // console.log('error', err)
//         return { success: false, msg: err.message }
//     }
// }
// export const fetchMonthlyStats = async (
//     uid: string,
// ): Promise<ResponseType> => {
//     try {
//         const db = firestore;
//         const today = new Date();
//         const twelveMonthsAgo = new Date(today);
//         twelveMonthsAgo.setMonth(today.getMonth() - 12);

//         const transationsQuery = query(
//             collection(db, "transactions"),
//             where("date", ">=", Timestamp.fromDate(twelveMonthsAgo)),
//             where("date", "<=", Timestamp.fromDate(today)),
//             orderBy("date", "desc"),
//             where("uid", "==", uid)
//         );

//         const querySnapshot = await getDocs(transationsQuery);
//         const monthlyData = getLast12Months();
//         const transactions: TransactionType[] = [];

//         querySnapshot.forEach((doc) => {
//             const transaction = doc.data() as TransactionType;
//             transaction.id = doc.id;
//             transactions.push(transaction);

//             const transactionDate =(transaction.date as Timestamp).toDate();
//             const monthName = transactionDate.toLocaleString('default', { month: 'short' });
//             const shortYear = transactionDate.getFullYear().toString().slice(-2);
//             const monthData = monthlyData.find(
//                 (month) => month.month === `${monthName} ${shortYear}`
//             );

//             if(monthData){
//                 if(transaction.type === "income"){
//                     monthData.income += transaction.amount || 0;
//                 } else if(transaction.type === "expense"){
//                     monthData.expense += transaction.amount || 0;
//                 }
//             }
//         });

//         const stats = monthlyData.flatMap((month) => [
//             {
//                 value: month.income,
//                 label: month.month,
//                 spacing: scale(4),
//                 labelWidth: scale(30),
//                 frontColor: colors.primary
//             },
//             {value: month.expense, frontColor: colors.rose},
//         ]);

//         return {
//             success: true,
//             data: {
//                 stats,
//                 transactions,
//             },
//         };
//     } catch (err: any) {
//         // console.log('error', err)
//         return { success: false, msg: err.message }
//     }
// }
// export const fetchYearlyStats = async (
//     uid: string,
// ): Promise<ResponseType> => {
//     try {
//         const db = firestore;

//         const transationsQuery = query(
//             collection(db, "transactions"),
//             orderBy("date", "desc"),
//             where("uid", "==", uid)
//         );

//         const querySnapshot = await getDocs(transationsQuery);
//         const transactions: TransactionType[] = [];

//         const firstTransaction = querySnapshot.docs.reduce((earliest, doc) => {
//             const transactionDate = doc.data().date.toDate();
//             return transactionDate < earliest ? transactionDate: earliest;
//         }, new Date());

//         const firstYear = firstTransaction.getFullYear();
//         const currentYear = new Date().getFullYear();

//         const yearlyData = getYearsRange(firstYear, currentYear);

//         querySnapshot.forEach((doc) => {
//             const transaction = doc.data() as TransactionType;
//             transaction.id = doc.id;
//             transactions.push(transaction);

//             const transactionYear =(transaction.date as Timestamp).toDate().getFullYear();
            
//             const yearData = yearlyData.find(
//                 (item: any) => item.year === transactionYear.toString()
//             );

//             if(yearData){
//                 if(transaction.type === "income"){
//                     yearData.income += transaction.amount;
//                 } else if(transaction.type === "expense"){
//                     yearData.expense += transaction.amount;
//                 }
//             }
//         });

//         const stats = yearlyData.flatMap((year: any) => [
//             {
//                 value: year.income,
//                 label: year.year,
//                 spacing: scale(4),
//                 labelWidth: scale(35),
//                 frontColor: colors.primary
//             },
//             {value: year.expense, frontColor: colors.rose},
//         ]);

//         return {
//             success: true,
//             data: {
//                 stats,
//                 transactions,
//             },
//         };
//     } catch (err: any) {
//         // console.log('error', err)
//         return { success: false, msg: err.message }
//     }
// }

// export const fetchTotals = async (uid: string): Promise<ResponseType> => {
//     try {
//         const db = firestore;

//         const transactionsQuery = query(
//             collection(db, "transactions"),
//             where("uid", "==", uid)
//         );

//         const querySnapshot = await getDocs(transactionsQuery);
//         const transactions: TransactionType[] = [];

//         // Use a Set to track unique categories
//         const categorySet = new Set<string>();

//         querySnapshot.forEach((doc) => {
//             const transaction = doc.data() as TransactionType;
//             transaction.id = doc.id;
//             transactions.push(transaction);

//             // Only add category if it exists and is not income
//             if (transaction.type === 'expense' && transaction.category) {
//                 categorySet.add(transaction.category);
//             }
//         });

//         const totals = transactions.reduce((acc, item) => {
//             const amount = Number(item.amount) || 0;
//             if (item.type === 'income') {
//                 acc.income += amount;
//             } else if (item.type === 'expense') {
//                 acc.expenses += amount;
//             }
//             return acc;
//         }, { income: 0, expenses: 0 });

//         // Add totalTransactions and totalCategories to the result
//         return {
//             success: true,
//             data: {
//                 totals,
//                 transactions,
//                 totalTransactions: transactions.length,
//                 totalCategories: categorySet.size,
//             },
//         };
//     } catch (err: any) {
//         // console.log('error', err)
//         return { success: false, msg: err.message }
//     }
// }

// export const fetchTransactions = async (uid: string): Promise<ResponseType> => {
//     try {
//         const db = firestore;

//         const transactionsQuery = query(
//             collection(db, "transactions"),
//             where("uid", "==", uid)
//         );

//         const querySnapshot = await getDocs(transactionsQuery);
//         const transactions: TransactionType[] = [];

//         querySnapshot.forEach((doc) => {
//             const transaction = doc.data() as TransactionType;
//             transaction.id = doc.id;
//             transactions.push(transaction);
//         });

//         return {
//             success: true,
//             data: {
//                 transactions,
//             },
//         };
//     } catch (err: any) {
//         // console.log('error', err)
//         return { success: false, msg: err.message }
//     }
// }
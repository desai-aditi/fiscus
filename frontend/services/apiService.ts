import { Transaction } from "@/types/transaction";
import axios from "axios";

export class APIService{
    static async fetchTransactions(authToken: string): Promise<Transaction[]> {
        const response = await axios.get('http://192.168.68.63:8000/api/transactions/',{
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
            },
            maxRedirects: 10,
        })

        return response.data as Transaction[];
    }

    static async createTransaction(transaction: Transaction, authToken: string): Promise<void> {
 
        const response = await axios.post('http://192.168.68.63:8000/api/transactions/', transaction, {
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
            },
            maxRedirects: 10,
        });

        if (response.status !== 201) {
            throw new Error(`Failed to create transaction: ${response.statusText}`);
        }
    }

    static async updateTransaction(transaction: Transaction, authToken: string): Promise<void> {
        console.log("Updating transaction:", transaction);
        const response = await axios.put(`http://192.168.68.63:8000/api/transactions/${transaction.id}/`, transaction, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            maxRedirects: 10,
        });

        if (response.status !== 200) {
            throw new Error(`Failed to update transaction: ${response.statusText}`);
        }
    }

    static async deleteTransaction(transactionId: string, authToken: string): Promise<void> {
        const response = await axios.delete(`http://192.168.68.63:8000/api/transactions/${transactionId}/`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            maxRedirects: 10,
        });

        if (response.status !== 204) {
            throw new Error(`Failed to delete transaction: ${response.statusText}`);
        }
    }

}
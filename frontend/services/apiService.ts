import { Transaction } from "@/types/transaction";
import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";

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

    static async fetchUpdatedTransactions(authToken: string, uid: string, lastSyncTimestamp: number): Promise<Transaction[]> {
        const response = await fetch(`http://localhost:8000/api/transactions/updated/?last_sync=${lastSyncTimestamp}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch updated transactions');
        }
        
        return response.json();
    }

    static async createTransaction(transaction: Transaction, authToken: string): Promise<void> {
 
        const response = await axios.post('http://localhost:8000/api/transactions/', transaction, {
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
        const response = await axios.put(`http://localhost:8000/api/transactions/${transaction.id}/`, transaction, {
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
        const response = await axios.delete(`http://localhost:8000/api/transactions/${transactionId}/`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            maxRedirects: 10,
        });

        if (response.status !== 204) {
            throw new Error(`Failed to delete transaction: ${response.statusText}`);
        }
    }

    static async sendVerificationCode(authToken: string): Promise<{ success: boolean; message?: string }>{
        try {
            const response = await axios.get(`http://localhost:8000/api/verification/sendVerificationCode/`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                },
                maxRedirects: 10,
            });
            return response.data;
        } catch (error: any) {
            console.error("Error sending verification code:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Failed to send verification email.");
        }
    }

    static async verifyCode(authToken: string, code: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await axios.post(`http://localhost:8000/api/verification/verifyCode/`, { code }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                }
            });
            return response.data;
        } catch (error: any) {
            console.error("Error verifying code:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Failed to verify code.");
        }
    }

    static async setPin(authToken: string, pin: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await axios.post(`http://localhost:8000/api/verification/setPin/`, { pin }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                }
            });
            return response.data;
        } catch (error: any) {
            console.error("Error setting pin:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Failed to set code.");
        }
    }

    static async verifyPin(authToken: string, pin: string): Promise<{ success: boolean; message?: string }> {
        try {
            const response = await axios.post(`http://localhost:8000/api/verification/verifyPin/`, { pin }, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                }
            });
            return response.data;
        } catch (error: any) {
            console.error("Error setting pin:", error.response?.data || error.message);
            throw new Error(error.response?.data?.message || "Failed to set code.");
        }
    }
}
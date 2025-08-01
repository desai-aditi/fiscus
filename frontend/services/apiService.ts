import { Transaction } from "@/types/transaction";
import axios from "axios";

export class APIService{
    static async createTransaction(transaction: Transaction, authToken: string): Promise<void> {
 
        const response = await axios.post('http://localhost:8000/api/transactions/', transaction, {
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
            },
            maxRedirects: 10,
        });
    }

}
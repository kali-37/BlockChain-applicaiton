// frontend/src/services/transaction-service.ts
import { api } from "../utils/api";

export interface Transaction {
  id: number;
  transaction_type: "REGISTRATION" | "UPGRADE" | "REWARD";
  amount: number;
  display_amount: string; // New field with +/- prefix
  transaction_direction: "incoming" | "outgoing" | "unknown"; // New field for direction
  level?: number;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  transaction_hash?: string;
  created_at: string;
  recipient_username?: string;
  user_username?: string;
}

export interface TransactionFilter {
  type?: "REGISTRATION" | "UPGRADE" | "REWARD";
  status?: "PENDING" | "CONFIRMED" | "FAILED";
  fromDate?: string;
  toDate?: string;
}

export const useTransactionService = () => {
  const getTransactions = async (filters?: TransactionFilter): Promise<Transaction[]> => {
    try {
      // Build query params
      let queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.type) queryParams.append("transaction_type", filters.type);
        if (filters.status) queryParams.append("status", filters.status);
        if (filters.fromDate) queryParams.append("from_date", filters.fromDate);
        if (filters.toDate) queryParams.append("to_date", filters.toDate);
      }
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await api.get(`/api/transactions/${queryString}`);
      return response.data.results || [];
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  };

  const getTransactionById = async (userId: number, filters?: TransactionFilter): Promise<Transaction[]> => {
    try {
      // Build query params
      let queryParams = new URLSearchParams();
      
      if (filters) {
        if (filters.type) queryParams.append("transaction_type", filters.type);
        if (filters.status) queryParams.append("status", filters.status);
        if (filters.fromDate) queryParams.append("from_date", filters.fromDate);
        if (filters.toDate) queryParams.append("to_date", filters.toDate);
      }
      
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const response = await api.get(`/api/profiles/${userId}/transactions/${queryString}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching transactions for user ${userId}:`, error);
      return [];
    }
  };

  return {
    getTransactions,
    getTransactionById
  };
};
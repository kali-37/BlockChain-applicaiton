import { api } from "../utils/api";

export interface Transaction {
  id: number;
  transaction_type: "REGISTRATION" | "UPGRADE" | "REWARD";
  amount: number;
  level?: number;
  status: "PENDING" | "CONFIRMED" | "FAILED";
  transaction_hash?: string;
  created_at: string;
  recipient_username?: string;
  user_username?: string;
}

export const useTransactionService = () => {
  const getTransactions = async (): Promise<Transaction[]> => {
    try {
      const response = await api.get("/api/transactions/");
      return response.data.results || [];
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  };

  const getTransactionById = async (id: number): Promise<Transaction | null> => {
    try {
      const response = await api.get(`/api/profiles/${id}/transactions/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error);
      return null;
    }
  };

  return {
    getTransactions,
    getTransactionById
  };
};
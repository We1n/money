export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO format
  comment?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}


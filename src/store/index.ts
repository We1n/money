import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, Category } from '../types';

interface BudgetState {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  getBalance: () => number;
  getTransactionsByType: (type: Transaction['type']) => Transaction[];
  getTransactionsByDateRange: (start: string, end: string) => Transaction[];
  clearAllData: () => void;
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Еда', color: '#4CAF50' },
  { id: '2', name: 'Транспорт', color: '#2196F3' },
  { id: '3', name: 'Развлечения', color: '#FF9800' },
  { id: '4', name: 'Здоровье', color: '#F44336' },
  { id: '5', name: 'Покупки', color: '#9C27B0' },
  { id: '6', name: 'Другое', color: '#607D8B' },
  { id: '7', name: 'Зарплата', color: '#4CAF50' },
  { id: '8', name: 'Подарки', color: '#E91E63' },
];

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      transactions: [],
      categories: defaultCategories,

      addTransaction: (transaction) => {
        const newTransaction: Transaction = {
          ...transaction,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        };
        set((state) => ({
          transactions: [...state.transactions, newTransaction],
        }));
      },

      updateTransaction: (id, transaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...transaction, id } : t
          ),
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },

      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      getBalance: () => {
        const { transactions } = get();
        return transactions.reduce((sum, t) => {
          return t.type === 'income' ? sum + t.amount : sum - t.amount;
        }, 0);
      },

      getTransactionsByType: (type) => {
        return get().transactions.filter((t) => t.type === type);
      },

      getTransactionsByDateRange: (start, end) => {
        return get().transactions.filter(
          (t) => t.date >= start && t.date <= end
        );
      },

      clearAllData: () => {
        set({
          transactions: [],
          categories: defaultCategories,
        });
      },
    }),
    {
      name: 'budget-storage',
    }
  )
);


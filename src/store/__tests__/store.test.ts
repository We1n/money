import { describe, it, expect, beforeEach } from 'vitest';
import { useBudgetStore } from '../index';

describe('Budget Store', () => {
  beforeEach(() => {
    // Очищаем store перед каждым тестом
    const store = useBudgetStore.getState();
    store.clearAllData();
  });

  describe('getBalance', () => {
    it('должен возвращать 0 для пустого списка транзакций', () => {
      const balance = useBudgetStore.getState().getBalance();
      expect(balance).toBe(0);
    });

    it('должен правильно рассчитывать баланс с доходами', () => {
      const store = useBudgetStore.getState();
      store.addTransaction({
        type: 'income',
        amount: 1000,
        category: 'Зарплата',
        date: '2024-01-01',
      });
      expect(store.getBalance()).toBe(1000);
    });

    it('должен правильно рассчитывать баланс с расходами', () => {
      const store = useBudgetStore.getState();
      store.addTransaction({
        type: 'expense',
        amount: 500,
        category: 'Еда',
        date: '2024-01-01',
      });
      expect(store.getBalance()).toBe(-500);
    });

    it('должен правильно рассчитывать баланс с доходами и расходами', () => {
      const store = useBudgetStore.getState();
      store.addTransaction({
        type: 'income',
        amount: 1000,
        category: 'Зарплата',
        date: '2024-01-01',
      });
      store.addTransaction({
        type: 'expense',
        amount: 300,
        category: 'Еда',
        date: '2024-01-02',
      });
      store.addTransaction({
        type: 'expense',
        amount: 200,
        category: 'Транспорт',
        date: '2024-01-03',
      });
      expect(store.getBalance()).toBe(500);
    });

    it('должен правильно рассчитывать баланс с множественными транзакциями', () => {
      const store = useBudgetStore.getState();
      // Добавляем несколько доходов
      store.addTransaction({
        type: 'income',
        amount: 5000,
        category: 'Зарплата',
        date: '2024-01-01',
      });
      store.addTransaction({
        type: 'income',
        amount: 1000,
        category: 'Подарки',
        date: '2024-01-15',
      });
      // Добавляем несколько расходов
      store.addTransaction({
        type: 'expense',
        amount: 1500,
        category: 'Еда',
        date: '2024-01-05',
      });
      store.addTransaction({
        type: 'expense',
        amount: 800,
        category: 'Транспорт',
        date: '2024-01-10',
      });
      store.addTransaction({
        type: 'expense',
        amount: 200,
        category: 'Развлечения',
        date: '2024-01-20',
      });
      // Ожидаемый баланс: 5000 + 1000 - 1500 - 800 - 200 = 3500
      expect(store.getBalance()).toBe(3500);
    });
  });

  describe('getTransactionsByType', () => {
    it('должен возвращать только доходы', () => {
      const store = useBudgetStore.getState();
      store.addTransaction({
        type: 'income',
        amount: 1000,
        category: 'Зарплата',
        date: '2024-01-01',
      });
      store.addTransaction({
        type: 'expense',
        amount: 500,
        category: 'Еда',
        date: '2024-01-02',
      });
      store.addTransaction({
        type: 'income',
        amount: 200,
        category: 'Подарки',
        date: '2024-01-03',
      });

      const incomes = store.getTransactionsByType('income');
      expect(incomes).toHaveLength(2);
      expect(incomes.every((t) => t.type === 'income')).toBe(true);
    });

    it('должен возвращать только расходы', () => {
      const store = useBudgetStore.getState();
      store.addTransaction({
        type: 'income',
        amount: 1000,
        category: 'Зарплата',
        date: '2024-01-01',
      });
      store.addTransaction({
        type: 'expense',
        amount: 500,
        category: 'Еда',
        date: '2024-01-02',
      });
      store.addTransaction({
        type: 'expense',
        amount: 200,
        category: 'Транспорт',
        date: '2024-01-03',
      });

      const expenses = store.getTransactionsByType('expense');
      expect(expenses).toHaveLength(2);
      expect(expenses.every((t) => t.type === 'expense')).toBe(true);
    });
  });

  describe('getTransactionsByDateRange', () => {
    it('должен возвращать транзакции в указанном диапазоне дат', () => {
      const store = useBudgetStore.getState();
      store.addTransaction({
        type: 'income',
        amount: 1000,
        category: 'Зарплата',
        date: '2024-01-01',
      });
      store.addTransaction({
        type: 'expense',
        amount: 500,
        category: 'Еда',
        date: '2024-01-15',
      });
      store.addTransaction({
        type: 'expense',
        amount: 200,
        category: 'Транспорт',
        date: '2024-02-01',
      });

      const januaryTransactions = store.getTransactionsByDateRange('2024-01-01', '2024-01-31');
      expect(januaryTransactions).toHaveLength(2);
    });

    it('должен возвращать пустой массив для диапазона без транзакций', () => {
      const store = useBudgetStore.getState();
      store.addTransaction({
        type: 'income',
        amount: 1000,
        category: 'Зарплата',
        date: '2024-01-01',
      });

      const futureTransactions = store.getTransactionsByDateRange('2024-12-01', '2024-12-31');
      expect(futureTransactions).toHaveLength(0);
    });
  });

  describe('addTransaction', () => {
    it('должен добавлять транзакцию с уникальным ID', () => {
      const store = useBudgetStore.getState();
      store.addTransaction({
        type: 'income',
        amount: 1000,
        category: 'Зарплата',
        date: '2024-01-01',
      });

      const transactions = store.transactions;
      expect(transactions).toHaveLength(1);
      expect(transactions[0].id).toBeDefined();
      expect(transactions[0].type).toBe('income');
      expect(transactions[0].amount).toBe(1000);
    });
  });

  describe('updateTransaction', () => {
    it('должен обновлять существующую транзакцию', () => {
      const store = useBudgetStore.getState();
      store.addTransaction({
        type: 'income',
        amount: 1000,
        category: 'Зарплата',
        date: '2024-01-01',
      });

      const transactionId = store.transactions[0].id;
      store.updateTransaction(transactionId, {
        type: 'income',
        amount: 2000,
        category: 'Зарплата',
        date: '2024-01-01',
      });

      expect(store.transactions[0].amount).toBe(2000);
      expect(store.transactions[0].id).toBe(transactionId);
    });
  });

  describe('deleteTransaction', () => {
    it('должен удалять транзакцию по ID', () => {
      const store = useBudgetStore.getState();
      store.addTransaction({
        type: 'income',
        amount: 1000,
        category: 'Зарплата',
        date: '2024-01-01',
      });

      const transactionId = store.transactions[0].id;
      store.deleteTransaction(transactionId);

      expect(store.transactions).toHaveLength(0);
    });
  });

  describe('budget calculations', () => {
    it('должен правильно рассчитывать расходы по категории за месяц', () => {
      const store = useBudgetStore.getState();
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Добавляем расходы в текущем месяце
      store.addTransaction({
        type: 'expense',
        amount: 500,
        category: 'Еда',
        date: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0],
      });
      store.addTransaction({
        type: 'expense',
        amount: 300,
        category: 'Еда',
        date: new Date(currentYear, currentMonth, 15).toISOString().split('T')[0],
      });
      // Добавляем расход в другом месяце
      store.addTransaction({
        type: 'expense',
        amount: 200,
        category: 'Еда',
        date: new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0],
      });

      const expenses = store.transactions.filter((t) => {
        if (t.type !== 'expense' || t.category !== 'Еда') return false;
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
      expect(totalExpenses).toBe(800);
    });
  });
});



import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBudgetStore } from '../store';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import BudgetProgressBar from '../components/BudgetProgressBar';
import { Card } from '../components/ui';
import styles from './Analytics.module.css';

export default function Analytics() {
  const { transactions, categories } = useBudgetStore();

  const categoryData = useMemo(() => {
    const expenseTransactions = transactions.filter((t) => t.type === 'expense');
    const categoryMap = new Map<string, number>();

    expenseTransactions.forEach((t) => {
      const current = categoryMap.get(t.category) || 0;
      categoryMap.set(t.category, current + t.amount);
    });

    return Array.from(categoryMap.entries())
      .map(([name, amount]) => {
        const category = categories.find((c) => c.name === name);
        return {
          name,
          value: amount,
          color: category?.color || '#607D8B',
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories]);

  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, { income: number; expense: number }>();

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const current = monthMap.get(monthKey) || { income: 0, expense: 0 };

      if (t.type === 'income') {
        current.income += t.amount;
      } else {
        current.expense += t.amount;
      }

      monthMap.set(monthKey, current);
    });

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('ru-RU', {
          month: 'short',
          year: 'numeric',
        }),
        Доходы: data.income,
        Расходы: data.expense,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(-6); // Последние 6 месяцев
  }, [transactions]);

  const totalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const budgetProgressData = useMemo(() => {
    const expenseTransactions = transactions.filter((t) => t.type === 'expense');
    const categoryExpenses = new Map<string, number>();

    expenseTransactions.forEach((t) => {
      const current = categoryExpenses.get(t.category) || 0;
      categoryExpenses.set(t.category, current + t.amount);
    });

    return categories
      .filter((cat) => cat.limit && cat.limit > 0)
      .map((cat) => ({
        category: cat,
        currentAmount: categoryExpenses.get(cat.name) || 0,
        limit: cat.limit!,
      }))
      .sort((a, b) => {
        const aPercentage = (a.currentAmount / a.limit) * 100;
        const bPercentage = (b.currentAmount / b.limit) * 100;
        return bPercentage - aPercentage;
      });
  }, [transactions, categories]);

  return (
    <div className={styles.analytics}>
      <h1 className={styles.analyticsTitle}>Аналитика</h1>

      <div className={styles.statsCards}>
        <div className={`${styles.statCard} ${styles.income}`}>
          <div className={styles.statLabel}>Всего доходов</div>
          <div className={styles.statValue}>
            {totalIncome.toLocaleString('ru-RU', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
            {' ₽'}
          </div>
        </div>
        <div className={`${styles.statCard} ${styles.expense}`}>
          <div className={styles.statLabel}>Всего расходов</div>
          <div className={styles.statValue}>
            {totalExpense.toLocaleString('ru-RU', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
            {' ₽'}
          </div>
        </div>
      </div>

      {categoryData.length > 0 && (
        <div className={styles.chartContainer}>
          <h2 className={styles.chartTitle}>Расходы по категориям</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) =>
                  `${value.toLocaleString('ru-RU')} ₽`
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {monthlyData.length > 0 && (
        <div className={styles.chartContainer}>
          <h2 className={styles.chartTitle}>Доходы и расходы по месяцам</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) =>
                  `${value.toLocaleString('ru-RU')} ₽`
                }
              />
              <Legend />
              <Bar dataKey="Доходы" fill="#4CAF50" />
              <Bar dataKey="Расходы" fill="#F44336" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {budgetProgressData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card variant="elevated" padding="lg" className={styles.budgetSection}>
            <h2 className={styles.chartTitle}>Прогресс по бюджету</h2>
            <div className={styles.progressList}>
              {budgetProgressData.map((item) => (
                <BudgetProgressBar
                  key={item.category.id}
                  category={item.category}
                  currentAmount={item.currentAmount}
                  limit={item.limit}
                />
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {categoryData.length === 0 && monthlyData.length === 0 && budgetProgressData.length === 0 && (
        <div className={styles.emptyState}>
          <p>Нет данных для анализа</p>
        </div>
      )}
    </div>
  );
}


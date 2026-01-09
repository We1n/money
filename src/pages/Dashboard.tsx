import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBudgetStore } from '../store';
import TransactionFormNew from '../components/TransactionFormNew';
import { Card, Button } from '../components/ui';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { transactions, categories, getBalance } = useBudgetStore();
  const balance = getBalance();
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [initialCategory, setInitialCategory] = useState<string | undefined>();

  const quickAccessCategories = categories.filter((cat) => cat.isQuickAccess);

  // Pie Chart: расходы по категориям за текущий месяц
  const monthlyExpenseData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyExpenses = transactions.filter((t) => {
      if (t.type !== 'expense') return false;
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const categoryMap = new Map<string, number>();
    monthlyExpenses.forEach((t) => {
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

  // Bar Chart: сравнение доходов и расходов по месяцам
  const monthlyComparisonData = useMemo(() => {
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

  // Line Chart: динамика общего баланса со временем
  const balanceOverTimeData = useMemo(() => {
    // Сортируем транзакции по дате
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let runningBalance = 0;
    const balanceMap = new Map<string, number>();

    sortedTransactions.forEach((t) => {
      runningBalance += t.type === 'income' ? t.amount : -t.amount;
      const date = new Date(t.date);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Сохраняем баланс на конец каждого дня
      balanceMap.set(dateKey, runningBalance);
    });

    // Преобразуем в массив для графика
    return Array.from(balanceMap.entries())
      .map(([date, balance]) => ({
        date: new Date(date).toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
        }),
        Баланс: balance,
        fullDate: date,
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())
      .slice(-30); // Последние 30 дней
  }, [transactions]);

  const handleAddClick = (type: 'income' | 'expense') => {
    setFormType(type);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setInitialCategory(undefined);
  };

  const handleQuickPreset = (categoryName: string, type: 'income' | 'expense') => {
    setFormType(type);
    setInitialCategory(categoryName);
    setShowForm(true);
  };

  const formatBalance = (amount: number) => {
    return amount.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className={styles.dashboard}>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={styles.title}
      >
        Бюджет
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card variant="elevated" padding="lg" className={styles.balanceCard}>
          <div className={styles.balanceLabel}>Текущий баланс</div>
          <div
            className={`${styles.balanceAmount} ${
              balance >= 0 ? styles.positive : styles.negative
            }`}
          >
            {balance >= 0 ? '+' : ''}
            {formatBalance(balance)} ₽
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className={styles.quickActions}
      >
        <Button
          variant="income"
          size="lg"
          onClick={() => handleAddClick('income')}
          className={styles.actionButton}
          fullWidth
        >
          <span className={styles.actionIcon}>+</span>
          <span>Доход</span>
        </Button>
        <Button
          variant="expense"
          size="lg"
          onClick={() => handleAddClick('expense')}
          className={styles.actionButton}
          fullWidth
        >
          <span className={styles.actionIcon}>−</span>
          <span>Расход</span>
        </Button>
      </motion.div>

      {quickAccessCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className={styles.quickPresets}
        >
          <h2 className={styles.quickPresetsTitle}>Быстрый доступ</h2>
          <div className={styles.presetsGrid}>
            {quickAccessCategories.map((category) => {
              const isIncome = category.name === 'Зарплата' || category.name === 'Подарки';
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickPreset(category.name, isIncome ? 'income' : 'expense')}
                  className={styles.presetButton}
                  style={{ '--category-color': category.color } as React.CSSProperties}
                >
                  <span className={styles.presetIcon}>{category.icon}</span>
                  <span className={styles.presetLabel}>{category.name}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Pie Chart: Расходы по категориям за месяц */}
      {monthlyExpenseData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className={styles.chartSection}
        >
          <Card variant="elevated" padding="lg" className={styles.chartCard}>
            <h2 className={styles.chartTitle}>Расходы по категориям (этот месяц)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={monthlyExpenseData}
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
                  {monthlyExpenseData.map((entry, index) => (
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
          </Card>
        </motion.div>
      )}

      {/* Bar Chart: Доходы и расходы по месяцам */}
      {monthlyComparisonData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className={styles.chartSection}
        >
          <Card variant="elevated" padding="lg" className={styles.chartCard}>
            <h2 className={styles.chartTitle}>Доходы и расходы по месяцам</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyComparisonData}>
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
          </Card>
        </motion.div>
      )}

      {/* Line Chart: Динамика баланса */}
      {balanceOverTimeData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className={styles.chartSection}
        >
          <Card variant="elevated" padding="lg" className={styles.chartCard}>
            <h2 className={styles.chartTitle}>Динамика баланса</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={balanceOverTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    `${value.toLocaleString('ru-RU')} ₽`
                  }
                />
                <Line
                  type="monotone"
                  dataKey="Баланс"
                  stroke="#2196F3"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      )}

      <TransactionFormNew
        type={formType}
        onClose={handleFormClose}
        isOpen={showForm}
        initialCategory={initialCategory}
      />
    </div>
  );
}

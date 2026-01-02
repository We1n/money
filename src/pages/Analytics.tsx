import { useMemo } from 'react';
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
import './Analytics.css';

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

  return (
    <div className="analytics">
      <h1 className="analytics-title">Аналитика</h1>

      <div className="stats-cards">
        <div className="stat-card income">
          <div className="stat-label">Всего доходов</div>
          <div className="stat-value">
            {totalIncome.toLocaleString('ru-RU', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
            {' ₽'}
          </div>
        </div>
        <div className="stat-card expense">
          <div className="stat-label">Всего расходов</div>
          <div className="stat-value">
            {totalExpense.toLocaleString('ru-RU', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
            {' ₽'}
          </div>
        </div>
      </div>

      {categoryData.length > 0 && (
        <div className="chart-container">
          <h2 className="chart-title">Расходы по категориям</h2>
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
        <div className="chart-container">
          <h2 className="chart-title">Доходы и расходы по месяцам</h2>
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

      {categoryData.length === 0 && monthlyData.length === 0 && (
        <div className="empty-state">
          <p>Нет данных для анализа</p>
        </div>
      )}
    </div>
  );
}


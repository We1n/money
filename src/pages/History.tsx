import { useState, useMemo } from 'react';
import { useBudgetStore } from '../store';
import { Transaction } from '../types';
import TransactionForm from '../components/TransactionForm';
import './History.css';

export default function History() {
  const { transactions, deleteTransaction, categories } = useBudgetStore();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterDate, setFilterDate] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (filterType !== 'all') {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    if (filterDate) {
      filtered = filtered.filter((t) => t.date === filterDate);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, filterType, filterDate]);

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    return category?.color || '#607D8B';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="history">
      <h1 className="history-title">История операций</h1>

      <div className="filters">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as typeof filterType)}
          className="filter-select"
        >
          <option value="all">Все операции</option>
          <option value="income">Доходы</option>
          <option value="expense">Расходы</option>
        </select>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="filter-date"
          placeholder="Фильтр по дате"
        />
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <p>Нет операций</p>
        </div>
      ) : (
        <div className="transactions-list">
          {filteredTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              categoryColor={getCategoryColor(transaction.category)}
              onDelete={deleteTransaction}
              onEdit={setEditingTransaction}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {editingTransaction && (
        <TransactionForm
          type={editingTransaction.type}
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
  categoryColor: string;
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  formatDate: (date: string) => string;
}

function TransactionItem({
  transaction,
  categoryColor,
  onDelete,
  onEdit,
  formatDate,
}: TransactionItemProps) {
  return (
    <div className="transaction-item">
      <div className="transaction-main">
        <div className="transaction-info">
          <div className="transaction-category" style={{ color: categoryColor }}>
            {transaction.category}
          </div>
          <div className="transaction-date">{formatDate(transaction.date)}</div>
          {transaction.comment && (
            <div className="transaction-comment">{transaction.comment}</div>
          )}
        </div>
        <div
          className={`transaction-amount ${transaction.type === 'income' ? 'income' : 'expense'}`}
        >
          {transaction.type === 'income' ? '+' : '−'}
          {transaction.amount.toLocaleString('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
          {' ₽'}
        </div>
      </div>
      <div className="transaction-actions">
        <button
          className="edit-btn"
          onClick={() => onEdit(transaction)}
          aria-label="Редактировать"
        >
          ✎
        </button>
        <button
          className="delete-btn"
          onClick={() => onDelete(transaction.id)}
          aria-label="Удалить"
        >
          ×
        </button>
      </div>
    </div>
  );
}


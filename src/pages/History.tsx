import { useState, useMemo, useRef } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { useBudgetStore } from '../store';
import { Transaction } from '../types';
import TransactionForm from '../components/TransactionForm';
import styles from './History.module.css';

export default function History() {
  const { transactions, deleteTransaction, categories } = useBudgetStore();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterDate, setFilterDate] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);

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

  // Виртуализация списка
  const virtualizer = useVirtualizer({
    count: filteredTransactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Примерная высота элемента транзакции
    overscan: 5, // Рендерим 5 дополнительных элементов для плавности
  });

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
    <div className={styles.history}>
      <h1 className={styles.historyTitle}>История операций</h1>

      <div className={styles.filters}>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as typeof filterType)}
          className={styles.filterSelect}
        >
          <option value="all">Все операции</option>
          <option value="income">Доходы</option>
          <option value="expense">Расходы</option>
        </select>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className={styles.filterDate}
          placeholder="Фильтр по дате"
        />
      </div>

      {filteredTransactions.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Нет операций</p>
        </div>
      ) : (
        <div
          ref={parentRef}
          className={styles.transactionsList}
          style={{
            height: '600px',
            overflow: 'auto',
          }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualItem: VirtualItem) => {
              const transaction = filteredTransactions[virtualItem.index];
              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <TransactionItem
                    transaction={transaction}
                    categoryColor={getCategoryColor(transaction.category)}
                    onDelete={deleteTransaction}
                    onEdit={setEditingTransaction}
                    formatDate={formatDate}
                  />
                </div>
              );
            })}
          </div>
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
    <div className={styles.transactionItem}>
      <div className={styles.transactionMain}>
        <div className={styles.transactionInfo}>
          <div className={styles.transactionCategory} style={{ color: categoryColor }}>
            {transaction.category}
          </div>
          <div className={styles.transactionDate}>{formatDate(transaction.date)}</div>
          {transaction.comment && (
            <div className={styles.transactionComment}>{transaction.comment}</div>
          )}
        </div>
        <div
          className={`${styles.transactionAmount} ${transaction.type === 'income' ? styles.income : styles.expense}`}
        >
          {transaction.type === 'income' ? '+' : '−'}
          {transaction.amount.toLocaleString('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
          {' ₽'}
        </div>
      </div>
      <div className={styles.transactionActions}>
        <button
          className={styles.editBtn}
          onClick={() => onEdit(transaction)}
          aria-label="Редактировать"
        >
          ✎
        </button>
        <button
          className={styles.deleteBtn}
          onClick={() => onDelete(transaction.id)}
          aria-label="Удалить"
        >
          ×
        </button>
      </div>
    </div>
  );
}


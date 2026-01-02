import { useState, useEffect } from 'react';
import { useBudgetStore } from '../store';
import { TransactionType, Transaction } from '../types';
import './TransactionForm.css';

interface TransactionFormProps {
  type: TransactionType;
  onClose: () => void;
  transaction?: Transaction;
  isModal?: boolean;
}

export default function TransactionForm({ 
  type, 
  onClose, 
  transaction,
  isModal = true 
}: TransactionFormProps) {
  const { addTransaction, updateTransaction, categories } = useBudgetStore();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setDate(transaction.date);
      setComment(transaction.comment || '');
    }
  }, [transaction]);

  const availableCategories = categories.filter((cat: { name: string }) => {
    if (type === 'income') {
      return cat.name === 'Зарплата' || cat.name === 'Подарки';
    }
    return cat.name !== 'Зарплата' && cat.name !== 'Подарки';
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !date) {
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    if (transaction) {
      updateTransaction(transaction.id, {
        type,
        amount: numAmount,
        category,
        date,
        comment: comment || undefined,
      });
    } else {
      addTransaction({
        type,
        amount: numAmount,
        category,
        date,
        comment: comment || undefined,
      });
    }

    setAmount('');
    setCategory('');
    setComment('');
    onClose();
  };

  const formContent = (
    <>
      <div className="form-header">
        <h2>
          {transaction 
            ? (type === 'income' ? 'Редактировать доход' : 'Редактировать расход')
            : (type === 'income' ? 'Добавить доход' : 'Добавить расход')
          }
        </h2>
        {isModal && (
          <button className="close-btn" onClick={onClose}>×</button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="transaction-form">
          <div className="form-group">
            <label htmlFor="amount">Сумма</label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Категория</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Выберите категорию</option>
              {availableCategories.map((cat: { id: string; name: string }) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Дата</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="comment">Комментарий (необязательно)</label>
            <input
              id="comment"
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Описание операции"
            />
          </div>

          <button
            type="submit"
            className={`submit-btn ${type === 'income' ? 'income' : 'expense'}`}
          >
            {transaction ? 'Сохранить' : 'Добавить'}
          </button>
        </form>
    </>
  );

  if (isModal) {
    return (
      <div className="form-overlay" onClick={onClose}>
        <div className="form-container" onClick={(e) => e.stopPropagation()}>
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div className="form-container-inline">
      {formContent}
    </div>
  );
}


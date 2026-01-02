import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudgetStore } from '../store';
import TransactionForm from '../components/TransactionForm';
import './AddTransaction.css';

export default function AddTransaction() {
  const navigate = useNavigate();
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="add-transaction">
      <div className="add-transaction-header">
        <button className="back-btn" onClick={handleClose}>
          ← Назад
        </button>
        <h1 className="add-transaction-title">Добавить операцию</h1>
      </div>

      <div className="type-selector">
        <button
          className={`type-btn ${type === 'income' ? 'active income' : ''}`}
          onClick={() => setType('income')}
        >
          Доход
        </button>
        <button
          className={`type-btn ${type === 'expense' ? 'active expense' : ''}`}
          onClick={() => setType('expense')}
        >
          Расход
        </button>
      </div>

      <TransactionForm type={type} onClose={handleClose} isModal={false} />
    </div>
  );
}


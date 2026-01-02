import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBudgetStore } from '../store';
import TransactionForm from '../components/TransactionForm';
import './Dashboard.css';

export default function Dashboard() {
  const balance = useBudgetStore((state) => state.getBalance());
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');

  const handleAddClick = (type: 'income' | 'expense') => {
    setFormType(type);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Бюджет</h1>
      
      <div className="balance-card">
        <div className="balance-label">Текущий баланс</div>
        <div className={`balance-amount ${balance >= 0 ? 'positive' : 'negative'}`}>
          {balance >= 0 ? '+' : ''}
          {balance.toLocaleString('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
          {' ₽'}
        </div>
      </div>

      <div className="quick-actions">
        <button
          className="action-btn income-btn"
          onClick={() => handleAddClick('income')}
        >
          <span className="action-icon">+</span>
          <span className="action-label">Доход</span>
        </button>
        <button
          className="action-btn expense-btn"
          onClick={() => handleAddClick('expense')}
        >
          <span className="action-icon">−</span>
          <span className="action-label">Расход</span>
        </button>
        <Link to="/add" className="add-link">
          Или перейти на страницу добавления →
        </Link>
      </div>

      {showForm && (
        <TransactionForm
          type={formType}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}


import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBudgetStore } from '../store';
import TransactionFormNew from '../components/TransactionFormNew';
import { Card, Button } from '../components/ui';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const balance = useBudgetStore((state) => state.getBalance());
  const categories = useBudgetStore((state) => state.categories);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [initialCategory, setInitialCategory] = useState<string | undefined>();

  const quickAccessCategories = categories.filter((cat) => cat.isQuickAccess);

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

      <TransactionFormNew
        type={formType}
        onClose={handleFormClose}
        isOpen={showForm}
        initialCategory={initialCategory}
      />
    </div>
  );
}

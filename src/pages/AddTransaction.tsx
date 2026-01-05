import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import TransactionFormNew from '../components/TransactionFormNew';
import { Button } from '../components/ui';
import styles from './AddTransaction.module.css';

export default function AddTransaction() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type');
  const [type, setType] = useState<'income' | 'expense'>(
    (typeFromUrl === 'income' ? 'income' : 'expense') as 'income' | 'expense'
  );
  const [isFormOpen, setIsFormOpen] = useState(true);

  const handleClose = () => {
    setIsFormOpen(false);
    setTimeout(() => navigate(-1), 300); // Wait for animation
  };

  return (
    <div className={styles.addTransaction}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.header}
      >
        <Button variant="ghost" onClick={handleClose} className={styles.backButton}>
          ← Назад
        </Button>
        <h1 className={styles.title}>Добавить операцию</h1>
      </motion.div>

      <div className={styles.typeSelector}>
        <Button
          variant={type === 'income' ? 'income' : 'secondary'}
          onClick={() => setType('income')}
          className={styles.typeButton}
          fullWidth
        >
          Доход
        </Button>
        <Button
          variant={type === 'expense' ? 'expense' : 'secondary'}
          onClick={() => setType('expense')}
          className={styles.typeButton}
          fullWidth
        >
          Расход
        </Button>
      </div>

      <TransactionFormNew
        type={type}
        onClose={handleClose}
        isOpen={isFormOpen}
      />
    </div>
  );
}

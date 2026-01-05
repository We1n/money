import { useMemo } from 'react';
import { Category } from '../types';
import styles from './BudgetProgressBar.module.css';

interface BudgetProgressBarProps {
  category: Category;
  currentAmount: number;
  limit: number;
}

export default function BudgetProgressBar({
  category,
  currentAmount,
  limit,
}: BudgetProgressBarProps) {
  const percentage = useMemo(() => {
    return Math.min((currentAmount / limit) * 100, 100);
  }, [currentAmount, limit]);

  const isOverLimit = currentAmount > limit;
  const remaining = limit - currentAmount;

  return (
    <div className={styles.progressBar}>
      <div className={styles.progressHeader}>
        <div className={styles.categoryInfo}>
          <span className={styles.categoryIcon}>{category.icon}</span>
          <span className={styles.categoryName}>{category.name}</span>
        </div>
        <div className={styles.amountInfo}>
          <span className={styles.currentAmount}>
            {currentAmount.toLocaleString('ru-RU', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
            {' ₽'}
          </span>
          <span className={styles.separator}>/</span>
          <span className={styles.limitAmount}>
            {limit.toLocaleString('ru-RU', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
            {' ₽'}
          </span>
        </div>
      </div>
      <div className={styles.progressTrack}>
        <div
          className={`${styles.progressFill} ${isOverLimit ? styles.overLimit : ''}`}
          style={{
            width: `${percentage}%`,
            backgroundColor: isOverLimit ? 'var(--expense)' : category.color,
          }}
        />
      </div>
      <div className={styles.progressFooter}>
        <span className={styles.percentage}>
          {percentage.toFixed(0)}%
        </span>
        {!isOverLimit && remaining > 0 && (
          <span className={styles.remaining}>
            Осталось: {remaining.toLocaleString('ru-RU', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })} ₽
          </span>
        )}
        {isOverLimit && (
          <span className={styles.overLimitText}>
            Превышено на {Math.abs(remaining).toLocaleString('ru-RU', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })} ₽
          </span>
        )}
      </div>
    </div>
  );
}


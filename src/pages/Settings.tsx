import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useBudgetStore } from '../store';
import { Card, Button, Select, Input } from '../components/ui';
import { useToast } from '../hooks/useToast';
import { exportToJSON, exportToCSV, downloadFile, importFromJSON } from '../utils/dataExport';
import { getStoredTheme, setStoredTheme, type Theme } from '../utils/theme';
import styles from './Settings.module.css';

export default function Settings() {
  const { clearAllData, transactions, categories, addTransaction, addCategory, updateCategory } = useBudgetStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(getStoredTheme());
  const [editingLimits, setEditingLimits] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const handleClearData = () => {
    if (showConfirm) {
      clearAllData();
      setShowConfirm(false);
      toast.success('Все данные очищены');
    } else {
      setShowConfirm(true);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  const handleExportJSON = () => {
    const json = exportToJSON(transactions, categories);
    downloadFile(json, `budget-export-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    toast.success('Данные экспортированы в JSON');
  };

  const handleExportCSV = () => {
    const csv = exportToCSV(transactions);
    downloadFile(csv, `budget-export-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    toast.success('Данные экспортированы в CSV');
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = importFromJSON(content);

        if (!data) {
          toast.error('Ошибка импорта: неверный формат файла');
          return;
        }

        // Clear existing data
        clearAllData();

        // Import categories first (skip id when adding)
        data.categories.forEach((cat) => {
          const { id, ...categoryData } = cat;
          addCategory(categoryData);
        });

        // Import transactions (skip id when adding)
        data.transactions.forEach((t) => {
          const { id, ...transactionData } = t;
          addTransaction(transactionData);
        });

        toast.success(`Импортировано: ${data.transactions.length} транзакций, ${data.categories.length} категорий`);
      } catch (error) {
        toast.error('Ошибка при импорте данных');
        console.error('Import error:', error);
      }
    };

    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    setStoredTheme(theme);
    toast.info(`Тема изменена на ${theme === 'system' ? 'системную' : theme === 'dark' ? 'тёмную' : 'светлую'}`);
  };

  const themeOptions = [
    { value: 'light', label: 'Светлая' },
    { value: 'dark', label: 'Тёмная' },
    { value: 'system', label: 'Системная' },
  ];

  const handleLimitChange = (categoryId: string, value: string) => {
    setEditingLimits((prev) => ({
      ...prev,
      [categoryId]: value,
    }));
  };

  const handleLimitSave = (categoryId: string) => {
    const value = editingLimits[categoryId];
    if (value === undefined || value === '') {
      // Remove limit
      updateCategory(categoryId, { limit: undefined });
      setEditingLimits((prev) => {
        const newLimits = { ...prev };
        delete newLimits[categoryId];
        return newLimits;
      });
      toast.success('Лимит удалён');
    } else {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        toast.error('Введите корректное значение');
        return;
      }
      updateCategory(categoryId, { limit: numValue });
      toast.success('Лимит сохранён');
    }
  };

  const expenseCategories = categories.filter(
    (cat) => cat.name !== 'Зарплата' && cat.name !== 'Подарки'
  );

  return (
    <div className={styles.settings}>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={styles.title}
      >
        Настройки
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card variant="elevated" padding="lg" className={styles.section}>
          <h2 className={styles.sectionTitle}>Внешний вид</h2>
          <Select
            label="Тема"
            options={themeOptions}
            value={currentTheme}
            onChange={(e) => handleThemeChange(e.target.value as Theme)}
            fullWidth
          />
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card variant="elevated" padding="lg" className={styles.section}>
          <h2 className={styles.sectionTitle}>Бюджет</h2>
          <p className={styles.sectionDescription}>
            Установите лимиты расходов по категориям для отслеживания бюджета
          </p>
          <div className={styles.budgetList}>
            {expenseCategories.map((category) => {
              const currentLimit = editingLimits[category.id] ?? (category.limit?.toString() || '');
              return (
                <div key={category.id} className={styles.budgetItem}>
                  <div className={styles.budgetCategory}>
                    <span className={styles.budgetIcon}>{category.icon}</span>
                    <span className={styles.budgetName}>{category.name}</span>
                  </div>
                  <div className={styles.budgetInput}>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Без лимита"
                      value={currentLimit}
                      onChange={(e) => handleLimitChange(category.id, e.target.value)}
                      onBlur={() => handleLimitSave(category.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleLimitSave(category.id);
                        }
                      }}
                      style={{ width: '120px' }}
                    />
                    {currentLimit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingLimits((prev) => {
                            const newLimits = { ...prev };
                            delete newLimits[category.id];
                            return newLimits;
                          });
                          handleLimitSave(category.id);
                        }}
                        className={styles.removeLimitBtn}
                      >
                        ×
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card variant="elevated" padding="lg" className={styles.section}>
          <h2 className={styles.sectionTitle}>Данные</h2>
          
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Всего операций</span>
            <span className={styles.infoValue}>{transactions.length}</span>
          </div>

          <div className={styles.actions}>
            <Button variant="primary" onClick={handleExportJSON} fullWidth>
              Экспорт JSON
            </Button>
            <Button variant="primary" onClick={handleExportCSV} fullWidth>
              Экспорт CSV
            </Button>
            <Button variant="secondary" onClick={handleImport} fullWidth>
              Импорт данных
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card variant="elevated" padding="lg" className={styles.section}>
          <h2 className={styles.sectionTitle}>Опасная зона</h2>
          
          <div className={styles.dangerZone}>
            <div className={styles.dangerInfo}>
              <div className={styles.dangerLabel}>Очистить все данные</div>
              <div className={styles.dangerDescription}>
                Удалить все транзакции. Это действие нельзя отменить.
              </div>
            </div>
            {!showConfirm ? (
              <Button variant="danger" onClick={handleClearData}>
                Очистить
              </Button>
            ) : (
              <div className={styles.confirmButtons}>
                <Button variant="danger" onClick={handleClearData}>
                  Подтвердить
                </Button>
                <Button variant="secondary" onClick={handleCancel}>
                  Отмена
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card variant="outlined" padding="md" className={styles.section}>
          <div className={styles.aboutItem}>
            <span className={styles.aboutLabel}>Версия</span>
            <span className={styles.aboutValue}>1.0.0</span>
          </div>
          <div className={styles.aboutDescription}>
            Все данные хранятся локально в вашем браузере
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

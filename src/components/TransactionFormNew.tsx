import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBudgetStore } from '../store';
import { TransactionType, Transaction } from '../types';
import { Drawer } from './ui/Drawer';
import { Input, Select, Button } from './ui';
import { useToast } from '../hooks/useToast';
import styles from './TransactionFormNew.module.css';

const transactionSchema = z.object({
  amount: z
    .string()
    .min(1, 'Сумма обязательна')
    .refine((val: string) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Сумма должна быть больше 0',
    }),
  category: z.string().min(1, 'Выберите категорию'),
  date: z.string().min(1, 'Выберите дату'),
  comment: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionFormNewProps {
  type: TransactionType;
  onClose: () => void;
  transaction?: Transaction;
  isOpen: boolean;
  initialCategory?: string;
}

export default function TransactionFormNew({
  type,
  onClose,
  transaction,
  isOpen,
  initialCategory,
}: TransactionFormNewProps) {
  const { addTransaction, updateTransaction, categories, deleteTransaction } =
    useBudgetStore();
  const toast = useToast();

  const availableCategories = categories.filter((cat) => {
    if (type === 'income') {
      return cat.name === 'Зарплата' || cat.name === 'Подарки';
    }
    return cat.name !== 'Зарплата' && cat.name !== 'Подарки';
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: '',
      category: initialCategory || '',
      date: new Date().toISOString().split('T')[0],
      comment: '',
    },
  });

  useEffect(() => {
    if (transaction) {
      setValue('amount', transaction.amount.toString());
      setValue('category', transaction.category);
      setValue('date', transaction.date);
      setValue('comment', transaction.comment || '');
    } else {
      reset();
      setValue('date', new Date().toISOString().split('T')[0]);
      if (initialCategory) {
        setValue('category', initialCategory);
      }
    }
  }, [transaction, initialCategory, setValue, reset]);

  const onSubmit = async (data: TransactionFormData) => {
    const numAmount = parseFloat(data.amount);

    if (transaction) {
      updateTransaction(transaction.id, {
        type,
        amount: numAmount,
        category: data.category,
        date: data.date,
        comment: data.comment || undefined,
      });
      toast.success('Транзакция обновлена');
    } else {
      const newTransaction = {
        type,
        amount: numAmount,
        category: data.category,
        date: data.date,
        comment: data.comment || undefined,
      };

      // Get the transaction ID after adding
      const stateBefore = useBudgetStore.getState();
      addTransaction(newTransaction);
      const stateAfter = useBudgetStore.getState();
      
      // Find the newly added transaction
      const newTransactionId = stateAfter.transactions.find(
        (t) =>
          !stateBefore.transactions.some((prev) => prev.id === t.id) &&
          t.type === newTransaction.type &&
          t.amount === newTransaction.amount &&
          t.category === newTransaction.category &&
          t.date === newTransaction.date
      )?.id;

      // Show toast with undo functionality
      if (newTransactionId) {
        toast.success('Транзакция добавлена', {
          onUndo: () => {
            deleteTransaction(newTransactionId);
            toast.info('Транзакция отменена');
          },
          duration: 5000,
        });
      } else {
        toast.success('Транзакция добавлена');
      }
    }

    reset();
    onClose();
  };

  const selectOptions = [
    { value: '', label: 'Выберите категорию', disabled: true },
    ...availableCategories.map((cat) => ({
      value: cat.name,
      label: `${cat.icon} ${cat.name}`,
    })),
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        transaction
          ? type === 'income'
            ? 'Редактировать доход'
            : 'Редактировать расход'
          : type === 'income'
          ? 'Добавить доход'
          : 'Добавить расход'
      }
      position="bottom"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Input
          {...register('amount')}
          type="number"
          step="0.01"
          min="0"
          label="Сумма"
          placeholder="0"
          error={errors.amount?.message}
          fullWidth
          autoFocus
        />

        <Select
          {...register('category')}
          label="Категория"
          options={selectOptions}
          error={errors.category?.message}
          fullWidth
        />

        <Input
          {...register('date')}
          type="date"
          label="Дата"
          error={errors.date?.message}
          fullWidth
        />

        <Input
          {...register('comment')}
          type="text"
          label="Комментарий (необязательно)"
          placeholder="Описание операции"
          helperText="Можно оставить пустым"
          fullWidth
        />

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            fullWidth
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant={type === 'income' ? 'income' : 'expense'}
            fullWidth
            isLoading={isSubmitting}
          >
            {transaction ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}


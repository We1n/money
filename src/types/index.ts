export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO format
  comment?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string; // Emoji или ID иконки для быстрой визуальной идентификации
  isQuickAccess?: boolean; // Показывать ли на главном экране
  limit?: number; // Лимит бюджета для категории (опционально)
}

// Настройки пользователя
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  enableSound: boolean; // Звуковой фидбек (опционально)
}


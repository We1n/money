import { Transaction, Category } from '../types';

export interface ExportData {
  transactions: Transaction[];
  categories: Category[];
  exportDate: string;
  version: string;
}

export function exportToJSON(transactions: Transaction[], categories: Category[]): string {
  const data: ExportData = {
    transactions,
    categories,
    exportDate: new Date().toISOString(),
    version: '1.0.0',
  };

  return JSON.stringify(data, null, 2);
}

export function exportToCSV(transactions: Transaction[]): string {
  const headers = ['ID', 'Тип', 'Сумма', 'Категория', 'Дата', 'Комментарий'];
  const rows = transactions.map((t) => [
    t.id,
    t.type === 'income' ? 'Доход' : 'Расход',
    t.amount.toString(),
    t.category,
    t.date,
    t.comment || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importFromJSON(jsonString: string): ExportData | null {
  try {
    const data = JSON.parse(jsonString) as ExportData;
    
    // Validate structure
    if (!data.transactions || !data.categories) {
      throw new Error('Invalid data structure');
    }

    return data;
  } catch (error) {
    console.error('Import error:', error);
    return null;
  }
}








import { useState } from 'react';
import { useBudgetStore } from '../store';
import './Settings.css';

export default function Settings() {
  const { clearAllData, transactions } = useBudgetStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearData = () => {
    if (showConfirm) {
      clearAllData();
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="settings">
      <h1 className="settings-title">Настройки</h1>

      <div className="settings-section">
        <h2 className="section-title">Данные</h2>
        <div className="settings-item">
          <div className="settings-info">
            <div className="settings-label">Всего операций</div>
            <div className="settings-value">{transactions.length}</div>
          </div>
        </div>

        <div className="settings-item">
          <div className="settings-info">
            <div className="settings-label">Очистить все данные</div>
            <div className="settings-description">
              Удалить все транзакции. Это действие нельзя отменить.
            </div>
          </div>
          {!showConfirm ? (
            <button className="danger-btn" onClick={handleClearData}>
              Очистить
            </button>
          ) : (
            <div className="confirm-buttons">
              <button className="confirm-btn" onClick={handleClearData}>
                Подтвердить
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                Отмена
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="settings-section">
        <h2 className="section-title">О приложении</h2>
        <div className="settings-item">
          <div className="settings-info">
            <div className="settings-label">Версия</div>
            <div className="settings-value">1.0.0</div>
          </div>
        </div>
        <div className="settings-item">
          <div className="settings-info">
            <div className="settings-label">Хранение данных</div>
            <div className="settings-description">
              Все данные хранятся локально в вашем браузере
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './';
import styles from './Toast.module.css';
import clsx from 'clsx';

export interface Toast {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onUndo?: () => void;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export function ToastItem({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={clsx(styles.toast, styles[toast.type || 'success'])}
    >
      <div className={styles.content}>
        <span className={styles.message}>{toast.message}</span>
        {toast.onUndo && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              toast.onUndo?.();
              onClose(toast.id);
            }}
            className={styles.undoButton}
          >
            Отменить
          </Button>
        )}
      </div>
      <button
        className={styles.closeButton}
        onClick={() => onClose(toast.id)}
        aria-label="Закрыть"
      >
        ×
      </button>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className={styles.container}>
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}






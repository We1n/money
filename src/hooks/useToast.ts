import { useState, useCallback } from 'react';
import { Toast } from '../components/ui/Toast';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 3000,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, options?: Omit<Toast, 'id' | 'message' | 'type'>) => {
      return showToast({ ...options, message, type: 'success' });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, options?: Omit<Toast, 'id' | 'message' | 'type'>) => {
      return showToast({ ...options, message, type: 'error' });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, options?: Omit<Toast, 'id' | 'message' | 'type'>) => {
      return showToast({ ...options, message, type: 'info' });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, options?: Omit<Toast, 'id' | 'message' | 'type'>) => {
      return showToast({ ...options, message, type: 'warning' });
    },
    [showToast]
  );

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };
}








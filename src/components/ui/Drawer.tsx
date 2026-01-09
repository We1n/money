import { useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import styles from './Drawer.module.css';
import clsx from 'clsx';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  position?: 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export function Drawer({
  isOpen,
  onClose,
  children,
  title,
  position = 'bottom',
  size = 'md',
}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={styles.backdrop}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            initial={
              position === 'bottom'
                ? { y: '100%' }
                : position === 'left'
                ? { x: '-100%' }
                : { x: '100%' }
            }
            animate={
              position === 'bottom'
                ? { y: 0 }
                : position === 'left'
                ? { x: 0 }
                : { x: 0 }
            }
            exit={
              position === 'bottom'
                ? { y: '100%' }
                : position === 'left'
                ? { x: '-100%' }
                : { x: '100%' }
            }
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={clsx(
              styles.drawer,
              styles[position],
              styles[`size-${size}`]
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'drawer-title' : undefined}
          >
            {title && (
              <div className={styles.header}>
                <h2 id="drawer-title" className={styles.title}>
                  {title}
                </h2>
                <button
                  className={styles.closeButton}
                  onClick={onClose}
                  aria-label="Закрыть"
                >
                  ×
                </button>
              </div>
            )}
            <div className={styles.content}>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}






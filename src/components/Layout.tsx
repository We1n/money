import { Link, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Главная', icon: '📊' },
    { path: '/history', label: 'История', icon: '📝' },
    { path: '/analytics', label: 'Аналитика', icon: '📈' },
    { path: '/settings', label: 'Настройки', icon: '⚙️' },
  ];

  return (
    <div className={styles.layout}>
      <main className={styles.mainContent}>{children}</main>
      <nav className={styles.bottomNav}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}


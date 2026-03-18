import React from 'react';
import { BottomNav } from '../components/BottomNav';
import { UserRole } from '../components/RoleBadge';
import styles from './MobileLayout.module.css';

interface MobileLayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    role: UserRole;
    churchName: string;
  };
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, user }) => {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.churchInfo}>
          <span className={styles.churchName}>{user.churchName}</span>
          <span className={styles.userName}>{user.name}</span>
        </div>
        <div className={styles.avatar}>{user.name[0]}</div>
      </header>

      <main className={styles.content}>
        {children}
      </main>

      <BottomNav role={user.role} />
    </div>
  );
};

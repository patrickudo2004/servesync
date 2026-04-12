import React, { useState } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { BottomNav } from '../components/BottomNav';
import { NotificationTray } from '../components/NotificationTray';
import { Bell } from 'lucide-react';
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
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = useQuery(api.notifications.getUnreadCount) || 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.churchInfo}>
          <span className={styles.churchName}>{user.churchName}</span>
          <span className={styles.userName}>{user.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <div className={styles.avatar}>{user.name[0]}</div>
        </div>
      </header>

      {showNotifications && (
        <NotificationTray onClose={() => setShowNotifications(false)} />
      )}

      <main className={styles.content}>
        {children}
      </main>

      <BottomNav role={user.role} />
    </div>
  );
};

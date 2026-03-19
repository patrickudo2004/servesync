import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  UserCheck, 
  Clock, 
  Settings, 
  LogOut,
  ChevronRight,
  Users,
  Shield,
} from 'lucide-react';
import { RoleBadge, UserRole } from './RoleBadge';
import { ThemeToggle } from './ThemeToggle';
import styles from './Layout.module.css';

import { useAuthActions } from "@convex-dev/auth/react";

interface LayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    role: UserRole;
    churchName: string;
  };
}

export const Layout: React.FC<LayoutProps> = ({ children, user }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuthActions();

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/', roles: ['SuperAdmin', 'DepartmentHead', 'SubunitLead', 'Volunteer', 'Probation', 'OnNotice'] },
    { label: 'Admin', icon: <Shield size={20} />, path: '/admin', roles: ['SuperAdmin'] },
    { label: 'Services', icon: <Calendar size={20} />, path: '/services', roles: ['SuperAdmin', 'DepartmentHead', 'SubunitLead'] },
    { label: 'Attendance', icon: <UserCheck size={20} />, path: '/attendance', roles: ['SuperAdmin', 'DepartmentHead', 'SubunitLead', 'Volunteer', 'Probation', 'OnNotice'] },
    { label: 'Rota', icon: <Calendar size={20} />, path: '/rota', roles: ['SuperAdmin', 'DepartmentHead', 'SubunitLead', 'Volunteer'] },
    { label: 'Time Off', icon: <Clock size={20} />, path: '/time-off', roles: ['SuperAdmin', 'DepartmentHead', 'SubunitLead', 'Volunteer'] },
    { label: 'Invites', icon: <Users size={20} />, path: '/invites', roles: ['SuperAdmin', 'DepartmentHead'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>SS</div>
          <span className={styles.logoText}>ServeSync</span>
        </div>

        <div className={styles.churchInfo}>
          <p className={styles.churchName}>{user.churchName}</p>
          <div className="flex items-center justify-between">
            <RoleBadge role={user.role} />
            <ThemeToggle className={styles.themeToggle} />
          </div>
        </div>

        <nav className={styles.nav}>
          {filteredNav.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`${styles.navItem} ${location.pathname === item.path ? styles.active : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {location.pathname === item.path && <ChevronRight size={16} className={styles.activeIndicator} />}
            </Link>
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{user.name[0]}</div>
            <div className={styles.userMeta}>
              <p className={styles.userName}>{user.name}</p>
              <button className={styles.logoutBtn} onClick={() => signOut()}>
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>
            {navItems.find(i => i.path === location.pathname)?.label || 'Page'}
          </h1>
        </header>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
};

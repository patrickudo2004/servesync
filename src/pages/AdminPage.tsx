import React from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Organogram } from '../components/Organogram';
import { Users, Mail, Settings, Shield, Loader2 } from 'lucide-react';
import styles from './AdminPage.module.css';

export const AdminPage: React.FC = () => {
  const organogramData = useQuery(api.churches.getOrganogram);

  if (organogramData === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleInfo}>
          <Shield className={styles.headerIcon} />
          <div>
            <h1>Church Administration</h1>
            <p>Manage hierarchy, permissions, and settings.</p>
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        <section className={styles.mainContent}>
          <div className={styles.sectionHeader}>
            <Users size={20} />
            <h2>Organizational Hierarchy</h2>
          </div>
          <div className={styles.orgWrapper}>
            {organogramData ? (
              <Organogram data={organogramData as any} />
            ) : (
              <p>No data available.</p>
            )}
          </div>
        </section>

        <aside className={styles.sidebar}>
          <div className={styles.toolCard}>
            <Mail size={20} />
            <h3>Invite Management</h3>
            <p>Send invites to new leaders and volunteers.</p>
            <button 
              className={styles.actionBtn}
              onClick={() => window.location.href = '/invites'}
            >
              Manage Invites
            </button>
          </div>

          <div className={styles.toolCard}>
            <Settings size={20} />
            <h3>Church Settings</h3>
            <p>Configure geofencing, time windows, and PWA options.</p>
            <button className={styles.secondaryBtn}>Configure</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

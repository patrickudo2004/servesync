import React from 'react';
import { Users, CheckCircle2, Clock, QrCode, MessageSquare } from 'lucide-react';
import styles from './mobile.module.css';

export const SubunitLeadHome: React.FC = () => {
  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        <div className={styles.card + ' ' + styles.statCard}>
          <span className={styles.statValue}>12 / 15</span>
          <span className={styles.statLabel}>Checked In</span>
        </div>
        <div className={styles.card + ' ' + styles.statCard}>
          <span className={styles.statValue}>80%</span>
          <span className={styles.statLabel}>Attendance</span>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Live Service Mode</h2>
          <div className={styles.badge} style={{ background: '#fef2f2', color: '#ef4444' }}>Live</div>
        </div>
        <div className={styles.list}>
          {[
            { name: 'John Doe', status: 'Present', time: '08:45 AM', color: '#22c55e' },
            { name: 'Jane Smith', status: 'Present', time: '08:50 AM', color: '#22c55e' },
            { name: 'Mike Ross', status: 'Late', time: '09:05 AM', color: '#f59e0b' },
            { name: 'Sarah Connor', status: 'Absent', time: '-', color: '#ef4444' },
          ].map((member, i) => (
            <div key={i} className={styles.listItem}>
              <div className={styles.avatar} style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                {member.name[0]}
              </div>
              <div className={styles.itemInfo}>
                <p className={styles.itemTitle}>{member.name}</p>
                <p className={styles.itemSubtitle}>{member.status} {member.time !== '-' && `• ${member.time}`}</p>
              </div>
              <div className={styles.badge} style={{ color: member.color, border: `1px solid ${member.color}` }}>
                {member.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.itemTitle}>Team Chat</h3>
            <MessageSquare size={18} color="#8b5cf6" />
          </div>
          <p className={styles.itemSubtitle}>3 new messages in Media Team</p>
        </div>
      </section>

      <button className={styles.floatingBtn}>
        <QrCode size={24} />
      </button>
    </div>
  );
};

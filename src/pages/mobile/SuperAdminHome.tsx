import React from 'react';
import { BarChart, Bar, ResponsiveContainer, Cell, LineChart, Line } from 'recharts';
import { LayoutGrid, Users, TrendingUp, ShieldCheck, ChevronRight } from 'lucide-react';
import styles from './mobile.module.css';

const data = [
  { name: 'Sun', value: 400 },
  { name: 'Mon', value: 300 },
  { name: 'Tue', value: 200 },
  { name: 'Wed', value: 278 },
  { name: 'Thu', value: 189 },
  { name: 'Fri', value: 239 },
  { name: 'Sat', value: 349 },
];

export const SuperAdminHome: React.FC = () => {
  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.card}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Church Attendance</h2>
            <TrendingUp size={16} color="#22c55e" />
          </div>
          <div style={{ width: '100%', height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#8b5cf6' : '#e5e7eb'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className={styles.grid} style={{ marginTop: '0.5rem' }}>
            <div>
              <p className={styles.statValue}>1,240</p>
              <p className={styles.statLabel}>Total Members</p>
            </div>
            <div>
              <p className={styles.statValue}>+12%</p>
              <p className={styles.statLabel}>Growth</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Departments</h2>
          <button className={styles.linkBtn}>View All</button>
        </div>
        <div className={styles.list}>
          {[
            { name: 'Music', members: 45, color: '#8b5cf6' },
            { name: 'Media', members: 32, color: '#3b82f6' },
            { name: 'Kids', members: 28, color: '#ef4444' },
          ].map((dept, i) => (
            <div key={i} className={styles.listItem}>
              <div className={styles.itemIcon} style={{ background: dept.color + '15', color: dept.color }}>
                <Users size={20} />
              </div>
              <div className={styles.itemInfo}>
                <p className={styles.itemTitle}>{dept.name}</p>
                <p className={styles.itemSubtitle}>{dept.members} Active Volunteers</p>
              </div>
              <ChevronRight size={16} color="#9ca3af" />
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Critical Watchlist</h2>
        </div>
        <div className={styles.card}>
          <div className={styles.list}>
            <div className={styles.listItem} style={{ border: 'none', padding: 0 }}>
              <div className={styles.itemIcon} style={{ background: '#fef2f2', color: '#ef4444' }}>
                <ShieldCheck size={20} />
              </div>
              <div className={styles.itemInfo}>
                <p className={styles.itemTitle}>Probation Reviews Due</p>
                <p className={styles.itemSubtitle}>5 volunteers need final review</p>
              </div>
              <div className={styles.badge} style={{ background: '#ef4444', color: 'white' }}>5</div>
            </div>
          </div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .${styles.linkBtn} {
          background: none;
          border: none;
          color: #8b5cf6;
          font-size: 0.8125rem;
          font-weight: 600;
          cursor: pointer;
        }
      `}} />
    </div>
  );
};

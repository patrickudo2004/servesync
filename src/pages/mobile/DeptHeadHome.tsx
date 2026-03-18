import React, { useState } from 'react';
import { BarChart3, Users, AlertCircle, ArrowRightLeft, ChevronRight } from 'lucide-react';
import styles from './mobile.module.css';

export const DeptHeadHome: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Subunits');

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        <div className={styles.card + ' ' + styles.statCard}>
          <span className={styles.statValue}>92%</span>
          <span className={styles.statLabel}>Avg Attendance</span>
        </div>
        <div className={styles.card + ' ' + styles.statCard}>
          <span className={styles.statValue}>3</span>
          <span className={styles.statLabel}>Open Gaps</span>
        </div>
      </div>

      <div className={styles.tabs}>
        {['Subunits', 'Approvals', 'Reports'].map((tab) => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className={styles.section}>
        {activeTab === 'Subunits' && (
          <div className={styles.list}>
            {[
              { name: 'Camera Unit', lead: 'Peter Parker', health: 'Good' },
              { name: 'Sound Unit', lead: 'Tony Stark', health: 'Needs Help' },
              { name: 'Projection', lead: 'Bruce Banner', health: 'Good' },
            ].map((unit, i) => (
              <div key={i} className={styles.listItem}>
                <div className={styles.itemIcon}>
                  <Users size={20} />
                </div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemTitle}>{unit.name}</p>
                  <p className={styles.itemSubtitle}>Lead: {unit.lead}</p>
                </div>
                <ChevronRight size={16} color="#9ca3af" />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Approvals' && (
          <div className={styles.list}>
            <div className={styles.listItem}>
              <div className={styles.itemIcon} style={{ background: '#f5f3ff', color: '#8b5cf6' }}>
                <ArrowRightLeft size={20} />
              </div>
              <div className={styles.itemInfo}>
                <p className={styles.itemTitle}>Borrow Request</p>
                <p className={styles.itemSubtitle}>Music Dept needs 2 Media Volunteers</p>
              </div>
              <div className={styles.badge} style={{ background: '#fef9c3', color: '#854d0e' }}>
                Pending
              </div>
            </div>
            <div className={styles.listItem}>
              <div className={styles.itemIcon} style={{ background: '#fef2f2', color: '#ef4444' }}>
                <AlertCircle size={20} />
              </div>
              <div className={styles.itemInfo}>
                <p className={styles.itemTitle}>Probation Review</p>
                <p className={styles.itemSubtitle}>Mark Grayson (Week 4)</p>
              </div>
              <ChevronRight size={16} color="#9ca3af" />
            </div>
          </div>
        )}
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .${styles.tabs} {
          display: flex;
          background: #f3f4f6;
          padding: 4px;
          border-radius: 12px;
        }
        .${styles.tab} {
          flex: 1;
          padding: 8px;
          border: none;
          background: transparent;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          border-radius: 8px;
          cursor: pointer;
        }
        .${styles.activeTab} {
          background: white;
          color: #111827;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
      `}} />
    </div>
  );
};

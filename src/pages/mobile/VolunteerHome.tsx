import React from 'react';
import { Calendar, Clock, MapPin, QrCode } from 'lucide-react';
import styles from './mobile.module.css';

export const VolunteerHome: React.FC = () => {
  return (
    <div className={styles.page}>
      <section className={styles.section}>
        <div className={styles.card + ' ' + styles.countdownCard}>
          <span className={styles.countdownLabel}>Next Service In</span>
          <span className={styles.countdownValue}>02:14:35</span>
          <span className={styles.countdownLabel}>Sunday Morning Service</span>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Upcoming Shifts</h2>
          <button className={styles.linkBtn}>View All</button>
        </div>
        <div className={styles.list}>
          {[1, 2].map((i) => (
            <div key={i} className={styles.listItem}>
              <div className={styles.itemIcon}>
                <Calendar size={20} />
              </div>
              <div className={styles.itemInfo}>
                <p className={styles.itemTitle}>Media Team - Camera 1</p>
                <p className={styles.itemSubtitle}>Sun, 15 Mar • 09:00 AM</p>
              </div>
              <div className={styles.badge} style={{ background: '#dcfce7', color: '#15803d' }}>
                Confirmed
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Location</h2>
        </div>
        <div className={styles.card}>
          <div className={styles.listItem} style={{ border: 'none', padding: 0 }}>
            <div className={styles.itemIcon}>
              <MapPin size={20} />
            </div>
            <div className={styles.itemInfo}>
              <p className={styles.itemTitle}>Main Sanctuary</p>
              <p className={styles.itemSubtitle}>123 Church Street, City</p>
            </div>
          </div>
        </div>
      </section>

      <button className={styles.floatingBtn}>
        <QrCode size={24} />
      </button>
    </div>
  );
};

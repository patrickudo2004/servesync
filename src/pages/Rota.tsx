import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import styles from './Rota.module.css';
import { RoleBadge, UserRole } from '../components/RoleBadge';

interface RotaEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  position: string;
  date: Date;
  status: 'Confirmed' | 'Pending' | 'Declined';
}

const MOCK_ROTA: RotaEntry[] = [
  { id: '1', userId: 'u1', userName: 'John Doe', userRole: 'SubunitLead', position: 'Sound Lead', date: new Date(), status: 'Confirmed' },
  { id: '2', userId: 'u2', userName: 'Alice J.', userRole: 'Volunteer', position: 'Camera 1', date: new Date(), status: 'Pending' },
  { id: '3', userId: 'u3', userName: 'Bob W.', userRole: 'Volunteer', position: 'Visuals', date: addDays(new Date(), 1), status: 'Confirmed' },
];

export const Rota: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const startDate = startOfWeek(currentWeek);
  
  const weekDays = [...Array(7)].map((_, i) => addDays(startDate, i));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.nav}>
          <button onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))} className={styles.navBtn}>
            <ChevronLeft size={20} />
          </button>
          <h2 className={styles.weekRange}>
            {format(startDate, 'MMM d')} - {format(addDays(startDate, 6), 'MMM d, yyyy')}
          </h2>
          <button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} className={styles.navBtn}>
            <ChevronRight size={20} />
          </button>
        </div>
        
        <button className={styles.addBtn}>
          <Plus size={18} />
          <span>Add Shift</span>
        </button>
      </div>

      <div className={styles.grid}>
        {weekDays.map(day => (
          <div key={day.toString()} className={styles.dayColumn}>
            <div className={`${styles.dayHeader} ${isSameDay(day, new Date()) ? styles.today : ''}`}>
              <span className={styles.dayName}>{format(day, 'EEE')}</span>
              <span className={styles.dayNumber}>{format(day, 'd')}</span>
            </div>
            
            <div className={styles.slots}>
              {MOCK_ROTA.filter(r => isSameDay(r.date, day)).map(entry => (
                <div key={entry.id} className={`${styles.card} ${styles[entry.status.toLowerCase()]}`}>
                  <div className={styles.cardHeader}>
                    <span className={styles.position}>{entry.position}</span>
                    {entry.status === 'Pending' && <Clock size={14} className={styles.pendingIcon} />}
                  </div>
                  <div className={styles.cardUser}>
                    <div className={styles.avatar}>{entry.userName[0]}</div>
                    <div className={styles.userDetails}>
                      <p className={styles.userName}>{entry.userName}</p>
                      <RoleBadge role={entry.userRole} className={styles.miniBadge} />
                    </div>
                  </div>
                </div>
              ))}
              
              <button className={styles.emptySlot}>
                <Plus size={14} />
                <span>Assign</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Gap Detection Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <AlertCircle size={18} />
          <h3>Gap Detection</h3>
        </div>
        <div className={styles.gapList}>
          <div className={styles.gapItem}>
            <p className={styles.gapTitle}>Missing Sound Lead</p>
            <p className={styles.gapMeta}>Sunday Service (9:00 AM)</p>
            <button className={styles.fixBtn}>Fix Now</button>
          </div>
        </div>
      </div>
    </div>
  );
};

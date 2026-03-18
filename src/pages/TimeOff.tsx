import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  Calendar as CalendarIcon,
  MessageSquare
} from 'lucide-react';
import styles from './TimeOff.module.css';
import { RoleBadge, UserRole } from '../components/RoleBadge';

interface TimeOffRequest {
  id: string;
  userName: string;
  userRole: UserRole;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const MOCK_REQUESTS: TimeOffRequest[] = [
  { id: '1', userName: 'Alice Johnson', userRole: 'Volunteer', startDate: '2024-04-20', endDate: '2024-04-25', reason: 'Family vacation', status: 'Pending' },
  { id: '2', userName: 'Bob Wilson', userRole: 'Probation', startDate: '2024-04-22', endDate: '2024-04-22', reason: 'Medical appointment', status: 'Approved' },
];

export const TimeOff: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Pending Approval</span>
            <span className={styles.statValue}>3</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Approved (This Month)</span>
            <span className={styles.statValue}>12</span>
          </div>
        </div>
        
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>New Request</span>
        </button>
      </div>

      <div className={styles.list}>
        {MOCK_REQUESTS.map(req => (
          <div key={req.id} className={styles.card}>
            <div className={styles.cardMain}>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>{req.userName[0]}</div>
                <div>
                  <p className={styles.userName}>{req.userName}</p>
                  <RoleBadge role={req.userRole} className={styles.miniBadge} />
                </div>
              </div>

              <div className={styles.dateInfo}>
                <CalendarIcon size={16} className={styles.icon} />
                <span>{req.startDate} to {req.endDate}</span>
              </div>

              <div className={styles.reasonInfo}>
                <MessageSquare size={16} className={styles.icon} />
                <span>{req.reason}</span>
              </div>
            </div>

            <div className={styles.cardActions}>
              <div className={`${styles.status} ${styles[req.status.toLowerCase()]}`}>
                {req.status === 'Pending' && <Clock size={14} />}
                {req.status === 'Approved' && <CheckCircle size={14} />}
                {req.status === 'Rejected' && <XCircle size={14} />}
                <span>{req.status}</span>
              </div>

              {req.status === 'Pending' && (
                <div className={styles.buttons}>
                  <button className={styles.rejectBtn}>Reject</button>
                  <button className={styles.approveBtn}>Approve</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Simple Modal Placeholder */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>New Time Off Request</h3>
            <div className={styles.form}>
              <div className={styles.field}>
                <label>Start Date</label>
                <input type="date" />
              </div>
              <div className={styles.field}>
                <label>End Date</label>
                <input type="date" />
              </div>
              <div className={styles.field}>
                <label>Reason</label>
                <textarea placeholder="Why do you need time off?" />
              </div>
              <div className={styles.modalButtons}>
                <button onClick={() => setShowModal(false)} className={styles.cancelBtn}>Cancel</button>
                <button onClick={() => setShowModal(false)} className={styles.submitBtn}>Submit Request</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

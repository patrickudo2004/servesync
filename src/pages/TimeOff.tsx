import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  Calendar as CalendarIcon,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import styles from './TimeOff.module.css';
import { RoleBadge } from '../components/RoleBadge';

export const TimeOff: React.FC = () => {
  const requests = useQuery(api.timeOff.getRequests);
  const createRequest = useMutation(api.timeOff.createRequest);
  const updateStatus = useMutation(api.timeOff.updateRequestStatus);
  const me = useQuery(api.users.me);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createRequest({
        startDate: new Date(formData.startDate).getTime(),
        endDate: new Date(formData.endDate).getTime(),
        reason: formData.reason
      });
      setShowModal(false);
      setFormData({ startDate: '', endDate: '', reason: '' });
    } catch (err) {
      alert("Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id: any, status: 'Approved' | 'Rejected') => {
    try {
      await updateStatus({ id, status });
    } catch (err) {
      alert("Unauthorized to review requests");
    }
  };

  if (requests === undefined || me === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedThisMonth = requests.filter(r => {
    const isApproved = r.status === 'Approved';
    const isThisMonth = new Date(r.startDate).getMonth() === new Date().getMonth();
    return isApproved && isThisMonth;
  }).length;

  // Filter requests: users see only theirs, admins see all
  const isAdmin = ["SuperAdmin", "DepartmentHead", "SubunitLead", "PastoralOversight"].includes(me.role || "");
  const filteredRequests = isAdmin 
    ? requests 
    : requests.filter(r => r.userId === me._id);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Pending Approval</span>
            <span className={styles.statValue}>{pendingCount}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Approved (This Month)</span>
            <span className={styles.statValue}>{approvedThisMonth}</span>
          </div>
        </div>
        
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span>New Request</span>
        </button>
      </div>

      <div className={styles.list}>
        {filteredRequests.length === 0 ? (
          <div className={styles.emptyState}>
            <CalendarIcon size={48} />
            <p>No time off requests found.</p>
          </div>
        ) : (
          filteredRequests.map(req => (
            <div key={req._id} className={styles.card}>
              <div className={styles.cardMain}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>{req.userName[0]}</div>
                  <div>
                    <p className={styles.userName}>{req.userName}</p>
                    <RoleBadge role={req.userRole as any} className={styles.miniBadge} />
                  </div>
                </div>

                <div className={styles.dateInfo}>
                  <CalendarIcon size={16} className={styles.icon} />
                  <span>
                    {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                  </span>
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

                {req.status === 'Pending' && isAdmin && (
                  <div className={styles.buttons}>
                    <button 
                      className={styles.rejectBtn}
                      onClick={() => handleStatusUpdate(req._id, 'Rejected')}
                    >
                      Reject
                    </button>
                    <button 
                      className={styles.approveBtn}
                      onClick={() => handleStatusUpdate(req._id, 'Approved')}
                    >
                      Approve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>New Time Off Request</h3>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate} className={styles.form}>
              <div className={styles.field}>
                <label>Start Date</label>
                <input 
                  type="date" 
                  value={formData.startDate}
                  onChange={e => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>End Date</label>
                <input 
                  type="date" 
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Reason</label>
                <textarea 
                  placeholder="Why do you need time off?" 
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  required
                />
              </div>
              <div className={styles.modalButtons}>
                <button type="button" onClick={() => setShowModal(false)} className={styles.cancelBtn}>Cancel</button>
                <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

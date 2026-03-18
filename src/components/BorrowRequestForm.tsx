import React, { useState } from 'react';
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Send, 
  Users, 
  Calendar, 
  Search, 
  Loader2, 
  Check,
  Briefcase,
  Tag
} from 'lucide-react';
import styles from './BorrowRequestForm.module.css';

export const BorrowRequestForm: React.FC = () => {
  const createBorrowRequest = useMutation(api.borrow.createBorrowRequest);
  const me = useQuery(api.users.me);
  
  const [targetDept, setTargetDept] = useState('');
  const [targetSubunit, setTargetSubunit] = useState('');
  const [role, setRole] = useState('Volunteer');
  const [count, setCount] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const departments = ["Music", "Media", "Ushering", "Kids", "Hospitality", "Security"];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;
    
    setIsSubmitting(true);
    try {
      await createBorrowRequest({
        targetDept,
        targetSubunit,
        role,
        count,
        startDate: new Date(startDate).getTime(),
        endDate: new Date(endDate).getTime(),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      // Reset form
      setTargetDept('');
      setTargetSubunit('');
      setCount(1);
    } catch (error) {
      console.error(error);
      alert("Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconBox}>
          <Briefcase size={24} />
        </div>
        <div>
          <h3>Request Inter-Department Help</h3>
          <p>Borrow volunteers from another department for a specific period.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>Target Department</label>
            <select 
              value={targetDept} 
              onChange={(e) => setTargetDept(e.target.value)}
              required
            >
              <option value="">Select Department...</option>
              {departments.filter(d => d !== me?.department).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>Target Subunit</label>
            <input 
              type="text" 
              placeholder="e.g. Sunday Service" 
              value={targetSubunit}
              onChange={(e) => setTargetSubunit(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Role Needed</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Volunteer">Volunteer</option>
              <option value="SubunitLead">Subunit Lead</option>
              <option value="Camera Operator">Camera Operator</option>
              <option value="Sound Engineer">Sound Engineer</option>
              <option value="Usher">Usher</option>
            </select>
          </div>
          <div className={styles.field}>
            <label>Number of People</label>
            <input 
              type="number" 
              min={1} 
              max={10} 
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              required
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Start Date</label>
            <div className={styles.inputWithIcon}>
              <Calendar size={16} />
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className={styles.field}>
            <label>End Date</label>
            <div className={styles.inputWithIcon}>
              <Calendar size={16} />
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className={styles.skillsHint}>
          <Tag size={14} />
          <span>System will suggest volunteers with matching skills (e.g. {role}) to the target Department Head.</span>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className={styles.spinner} /> : (
            <>
              {success ? "Request Sent!" : "Send Help Request"}
              {success ? <Check size={18} /> : <Send size={18} />}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

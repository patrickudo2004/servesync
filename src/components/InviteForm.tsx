import React, { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Send, Users, Loader2, X, Plus } from 'lucide-react';
import styles from './InviteForm.module.css';

interface InviteFormProps {
  userRole: 'SuperAdmin' | 'DepartmentHead';
  department?: string;
}

export const InviteForm: React.FC<InviteFormProps> = ({ userRole, department }) => {
  const bulkInvite = useMutation(api.invites.bulkInvite);
  
  const [emailsText, setEmailsText] = useState('');
  const [role, setRole] = useState('Volunteer');
  const [selectedDept, setSelectedDept] = useState(department || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const emails = emailsText
      .split(/[\s,]+/)
      .map(e => e.trim())
      .filter(e => e.includes('@'));

    try {
      await bulkInvite({
        emails,
        role,
        department: selectedDept,
      });
      setSuccess(true);
      setEmailsText('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconBox}>
          <Users size={24} />
        </div>
        <div>
          <h3>Invite Team Members</h3>
          <p>Add people to your {selectedDept || 'church'} team.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Email Addresses</label>
          <textarea 
            placeholder="Paste emails separated by commas or spaces..."
            value={emailsText}
            onChange={(e) => setEmailsText(e.target.value)}
            required
            rows={4}
          />
          <span className={styles.hint}>Tip: You can paste a list from Excel or Google Sheets.</span>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>Assign Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="Volunteer">Volunteer</option>
              <option value="SubunitLead">Subunit Lead</option>
              {userRole === 'SuperAdmin' && <option value="DepartmentHead">Department Head</option>}
            </select>
          </div>

          {userRole === 'SuperAdmin' && (
            <div className={styles.field}>
              <label>Department</label>
              <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} required>
                <option value="">Select Department...</option>
                <option value="Music">Music</option>
                <option value="Media">Media</option>
                <option value="Ushering">Ushering</option>
                <option value="Kids">Kids</option>
              </select>
            </div>
          )}
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isSubmitting || !emailsText}>
          {isSubmitting ? <Loader2 className={styles.spinner} /> : (
            <>{success ? "Invites Sent!" : "Send Invites"} <Send size={18} /></>
          )}
        </button>
      </form>
    </div>
  );
};

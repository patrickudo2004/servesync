import React, { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Smile, 
  ThumbsUp, 
  AlertTriangle, 
  XCircle, 
  Loader2, 
  Send,
  MessageSquare
} from 'lucide-react';
import styles from './KPILogger.module.css';

interface KPILoggerProps {
  probationId: any;
  volunteerName: string;
  onSuccess?: () => void;
}

type Score = "Excellent" | "Good" | "Needs Improvement" | "Disapprove";

export const KPILogger: React.FC<KPILoggerProps> = ({ probationId, volunteerName, onSuccess }) => {
  const logKPI = useMutation(api.probation.logKPI);
  const [selectedScore, setSelectedScore] = useState<Score | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNote, setShowNote] = useState(false);

  const scores: { value: Score; label: string; icon: React.ReactNode; color: string }[] = [
    { value: "Excellent", label: "Excellent", icon: <Smile size={24} />, color: styles.excellent },
    { value: "Good", label: "Good", icon: <ThumbsUp size={24} />, color: styles.good },
    { value: "Needs Improvement", label: "Needs Improvement", icon: <AlertTriangle size={24} />, color: styles.needsImprovement },
    { value: "Disapprove", label: "Disapprove", icon: <XCircle size={24} />, color: styles.disapprove },
  ];

  const handleSubmit = async () => {
    if (!selectedScore) return;
    setIsSubmitting(true);
    try {
      await logKPI({
        probationId,
        score: selectedScore,
        note: note || undefined,
      });
      setSelectedScore(null);
      setNote('');
      setShowNote(false);
      onSuccess?.();
    } catch (error) {
      console.error(error);
      alert("Failed to log KPI");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4>Log Performance for {volunteerName}</h4>
        <p>Select a recommendation based on today's shift.</p>
      </div>

      <div className={styles.scoreGrid}>
        {scores.map((s) => (
          <button
            key={s.value}
            className={`${styles.scoreBtn} ${s.color} ${selectedScore === s.value ? styles.selected : ''}`}
            onClick={() => {
              setSelectedScore(s.value);
              if (s.value === "Needs Improvement" || s.value === "Disapprove") {
                setShowNote(true);
              }
            }}
            disabled={isSubmitting}
          >
            {s.icon}
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {(showNote || selectedScore) && (
        <div className={styles.noteSection}>
          <div className={styles.noteHeader} onClick={() => setShowNote(!showNote)}>
            <MessageSquare size={16} />
            <span>{showNote ? "Hide Note" : "Add a note (optional)"}</span>
          </div>
          
          {showNote && (
            <textarea
              className={styles.textarea}
              placeholder="Add specific feedback or reasons for this score..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          )}

          <button 
            className={styles.submitBtn} 
            onClick={handleSubmit}
            disabled={!selectedScore || isSubmitting}
          >
            {isSubmitting ? <Loader2 className={styles.spinner} /> : (
              <>Submit Review <Send size={18} /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

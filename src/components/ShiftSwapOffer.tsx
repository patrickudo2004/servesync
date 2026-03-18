import React from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { RefreshCw, AlertCircle } from 'lucide-react';
import styles from './ShiftSwap.module.css';

interface ShiftSwapOfferProps {
  rotaId: any;
  onSuccess?: () => void;
}

export const ShiftSwapOffer: React.FC<ShiftSwapOfferProps> = ({ rotaId, onSuccess }) => {
  const [note, setNote] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const offerSwap = useMutation(api.shiftSwap.offerSwap);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await offerSwap({ rotaId, note });
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to offer swap');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.offerContainer}>
      <div className={styles.offerHeader}>
        <RefreshCw size={20} className={styles.swapIcon} />
        <h3>Offer Shift for Swap</h3>
      </div>
      
      <p className={styles.offerDescription}>
        Can't make it? Mark this shift as available so someone else can claim it.
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          placeholder="Optional note (e.g. 'Family emergency', 'Traveling')"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className={styles.textarea}
          rows={3}
        />

        {error && (
          <div className={styles.error}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? 'Offering...' : 'Confirm Offer'}
        </button>
      </form>
    </div>
  );
};

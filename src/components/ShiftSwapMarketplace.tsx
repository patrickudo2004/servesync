import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { RefreshCw, User, Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import styles from './ShiftSwap.module.css';

interface ShiftSwapMarketplaceProps {
  churchId: any;
  userSubunit?: string;
}

export const ShiftSwapMarketplace: React.FC<ShiftSwapMarketplaceProps> = ({ churchId, userSubunit }) => {
  const availableSwaps = useQuery(api.shiftSwap.getAvailableSwaps, { churchId, subunit: userSubunit });
  const claimSwap = useMutation(api.shiftSwap.claimSwap);
  const [claimingId, setClaimingId] = React.useState<string | null>(null);

  const handleClaim = async (swapId: any) => {
    setClaimingId(swapId);
    try {
      await claimSwap({ swapRequestId: swapId });
      alert('Shift claimed successfully! Waiting for owner approval.');
    } catch (err: any) {
      alert(err.message || 'Failed to claim shift');
    } finally {
      setClaimingId(null);
    }
  };

  if (!availableSwaps) return <div className={styles.loading}>Loading marketplace...</div>;

  return (
    <div className={styles.marketplaceContainer}>
      <header className={styles.marketHeader}>
        <RefreshCw size={24} className={styles.marketIcon} />
        <h2>Shift Swap Marketplace</h2>
      </header>

      {availableSwaps.length === 0 ? (
        <div className={styles.emptyState}>
          <CheckCircle2 size={48} color="#10b981" />
          <p>No shifts available for swap right now. Check back later!</p>
        </div>
      ) : (
        <div className={styles.swapList}>
          {availableSwaps.map((swap: any) => (
            <div key={swap._id} className={styles.swapCard}>
              <div className={styles.swapMain}>
                <div className={styles.serviceInfo}>
                  <h4 className={styles.serviceName}>{swap.service?.name}</h4>
                  <div className={styles.metaItem}>
                    <Calendar size={14} />
                    <span>{new Date(swap.service?.startTime).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <Clock size={14} />
                    <span>
                      {new Date(swap.service?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(swap.service?.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className={styles.requesterInfo}>
                  <User size={16} />
                  <span>{swap.requester?.name}</span>
                  <span className={styles.roleTag}>{swap.rota?.role}</span>
                </div>
              </div>

              {swap.note && (
                <div className={styles.noteBox}>
                  <strong>Note:</strong> {swap.note}
                </div>
              )}

              <button 
                onClick={() => handleClaim(swap._id)}
                disabled={claimingId === swap._id}
                className={styles.claimButton}
              >
                {claimingId === swap._id ? 'Claiming...' : 'Claim Shift'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

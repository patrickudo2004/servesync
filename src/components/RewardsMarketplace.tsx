import React from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ShoppingBag, Coffee, Gift, Star, Loader2, Coins } from 'lucide-react';
import styles from './RewardsMarketplace.module.css';

interface RewardsMarketplaceProps {
  churchId: any;
  userPoints: number;
}

export const RewardsMarketplace: React.FC<RewardsMarketplaceProps> = ({ churchId, userPoints }) => {
  const rewards = useQuery(api.rewards.getAvailableRewards, { churchId });
  const redeem = useMutation(api.rewards.redeemReward);
  const [isRedeeming, setIsRedeeming] = React.useState<string | null>(null);

  const handleRedeem = async (reward: any) => {
    if (userPoints < reward.cost) return;
    if (!confirm(`Redeem ${reward.name} for ${reward.cost} points?`)) return;

    setIsRedeeming(reward._id);
    try {
      await redeem({ rewardId: reward._id });
      alert('Reward redeemed! Check your notifications for fulfillment details.');
    } catch (err: any) {
      alert(err.message || 'Redemption failed');
    } finally {
      setIsRedeeming(null);
    }
  };

  if (!rewards) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <ShoppingBag size={24} className={styles.icon} />
        <h2>Redeem Rewards</h2>
      </header>

      <div className={styles.rewardGrid}>
        {rewards.map(reward => (
          <div key={reward._id} className={styles.rewardCard}>
            <div className={styles.rewardIcon}>
              {reward.category === 'Food' ? <Coffee size={32} /> :
               reward.category === 'Merch' ? <Gift size={32} /> : <Star size={32} />}
            </div>
            <div className={styles.rewardInfo}>
              <h3 className={styles.rewardName}>{reward.name}</h3>
              <p className={styles.rewardDesc}>{reward.description}</p>
              <div className={styles.rewardFooter}>
                <div className={styles.cost}>
                  <Coins size={14} />
                  <span>{reward.cost} pts</span>
                </div>
                <button 
                  className={styles.redeemBtn}
                  disabled={userPoints < reward.cost || isRedeeming === reward._id}
                  onClick={() => handleRedeem(reward)}
                >
                  {isRedeeming === reward._id ? '...' : 'Redeem'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

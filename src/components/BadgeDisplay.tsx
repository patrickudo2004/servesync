import React from 'react';
import * as LucideIcons from 'lucide-react';
import styles from './BadgeDisplay.module.css';

interface BadgeDisplayProps {
  badge: {
    name: string;
    description: string;
    icon: string;
    type: 'milestone' | 'custom';
  };
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badge, size = 'md', showLabel = true }) => {
  // @ts-ignore - dynamic icon lookup
  const Icon = LucideIcons[badge.icon] || LucideIcons.Award;

  const sizeClasses = {
    sm: styles.sm,
    md: styles.md,
    lg: styles.lg,
  };

  const typeClasses = {
    milestone: styles.milestone,
    custom: styles.custom,
  };

  return (
    <div className={`${styles.badgeContainer} ${sizeClasses[size]} ${typeClasses[badge.type]}`} title={badge.description}>
      <div className={styles.iconWrapper}>
        <Icon size={size === 'sm' ? 16 : size === 'md' ? 24 : 40} />
      </div>
      {showLabel && <span className={styles.badgeName}>{badge.name}</span>}
    </div>
  );
};

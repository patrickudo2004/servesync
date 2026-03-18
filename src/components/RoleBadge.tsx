import React from 'react';
import { Crown, ShieldCheck, User, Clock, AlertTriangle, Shield, ArrowRightLeft, Cross } from 'lucide-react';

export type UserRole = 'Volunteer' | 'SubunitLead' | 'DepartmentHead' | 'PastoralOversight' | 'Probation' | 'OnNotice' | 'SuperAdmin';

interface RoleBadgeProps {
  role: UserRole;
  isExtendedProbation?: boolean;
  isBorrowed?: boolean;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, isExtendedProbation, isBorrowed, className = "" }) => {
  const config: Record<UserRole, { color: string; bg: string; icon: React.ReactNode; border?: string }> = {
    Volunteer: {
      color: '#ef4444',
      bg: '#fef2f2',
      icon: <User size={12} />,
    },
    SubunitLead: {
      color: '#6b7280',
      bg: '#f9fafb',
      icon: <Shield size={12} />,
    },
    DepartmentHead: {
      color: '#111827',
      bg: '#ffffff',
      icon: <ShieldCheck size={12} />,
      border: '1px solid #d4af37', // Gold border
    },
    PastoralOversight: {
      color: '#15803d',
      bg: '#f0fdf4',
      icon: <Cross size={12} />,
      border: '1px solid #15803d',
    },
    Probation: {
      color: isExtendedProbation ? '#1e40af' : '#3b82f6', // Darker blue for extended
      bg: isExtendedProbation ? '#eff6ff' : 'transparent',
      icon: <Clock size={12} />,
      border: isExtendedProbation ? '1px solid #1e40af' : '1px dashed #3b82f6',
    },
    OnNotice: {
      color: '#f59e0b',
      bg: '#fffbeb',
      icon: <AlertTriangle size={12} />,
    },
    SuperAdmin: {
      color: '#8b5cf6',
      bg: '#f5f3ff',
      icon: <Crown size={12} />,
    },
  };

  const { color, bg, icon, border } = config[role];

  return (
    <div className="flex items-center gap-1">
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: 700,
          color,
          backgroundColor: bg,
          border: isBorrowed ? '2px solid #a855f7' : (border || 'none'),
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          boxShadow: isBorrowed ? '0 0 0 2px rgba(168, 85, 247, 0.2)' : 'none',
        }}
        className={className}
      >
        {isBorrowed ? <ArrowRightLeft size={12} /> : icon}
        {isExtendedProbation && role === 'Probation' ? 'Extended Probation' : (isBorrowed ? 'Borrowed' : role)}
      </span>
    </div>
  );
};

import React from 'react';
import { 
  Users, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  Settings as SettingsIcon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";
import { Organogram, OrgNode } from '../components/Organogram';
import { UserRole } from '../components/RoleBadge';
import { OversightDashboardTab } from '../components/OversightDashboardTab';
import styles from './Dashboard.module.css';

// Statistics and Organization data will be fetched from Convex

interface DashboardProps {
  userRole: UserRole;
}

export const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const navigate = useNavigate();
  const me = useQuery(api.users.me);
  const stats = useQuery(api.churches.getChurchStats);
  const activities = useQuery(api.churches.getRecentActivities);
  
  const ensureChannels = useMutation(api.chat.ensureChannels);
  const seedBadges = useMutation(api.recognition.seedBadges);

  React.useEffect(() => {
    if (me?.churchId) {
      ensureChannels({ churchId: me.churchId });
      seedBadges({ churchId: me.churchId });
    }
  }, [me?.churchId, ensureChannels, seedBadges]);

  return (
    <div className={styles.container}>
      {/* Stats Grid */}
      {/* Oversight View - Only for Pastoral Oversight and Super Admins */}
      {(userRole === 'PastoralOversight' || userRole === 'SuperAdmin') && me?.department && (
        <OversightDashboardTab department={me.department} />
      )}

      {userRole === 'SuperAdmin' && (
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => navigate('/admin/settings')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-purple-600 hover:border-purple-200 transition-all text-sm font-medium shadow-sm"
          >
            <SettingsIcon size={16} />
            Church Settings
          </button>
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <Users className={styles.statIcon} style={{ color: '#8b5cf6' }} />
            <span className={styles.statLabel}>Total Volunteers</span>
          </div>
          <div className={styles.statValue}>{stats?.totalVolunteers ?? 0}</div>
          <div className={styles.statTrend}>{stats?.totalVolunteers ? "Active workforce" : "Invite your first volunteer"}</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <CheckCircle className={styles.statIcon} style={{ color: '#10b981' }} />
            <span className={styles.statLabel}>Avg. Attendance</span>
          </div>
          <div className={styles.statValue}>{stats?.avgAttendance ?? 0}%</div>
          <div className={styles.statTrend}>Last 5 services</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <CalendarIcon className={styles.statIcon} style={{ color: '#3b82f6' }} />
            <span className={styles.statLabel}>Upcoming Services</span>
          </div>
          <div className={styles.statValue}>{stats?.upcomingServices ?? 0}</div>
          <div className={styles.statTrend}>
            {stats?.nextService ? `Next: ${new Date(stats.nextService.startTime).toLocaleDateString()}` : "No upcoming services"}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <Clock className={styles.statIcon} style={{ color: '#f59e0b' }} />
            <span className={styles.statLabel}>Pending Tasks</span>
          </div>
          <div className={styles.statValue}>{stats?.pendingRequests ?? 0}</div>
          <div className={styles.statTrend}>Swaps & Invites</div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Charts Section */}
        <div className={styles.chartSection}>
          <div className={styles.sectionHeader}>
            <TrendingUp size={20} />
            <h2>Attendance Trends</h2>
          </div>
          <div className={styles.chartContainer}>
            <div className="flex items-center justify-center h-[300px] text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              No attendance records found for this church.
            </div>
          </div>
        </div>

        {/* Organogram Section - Only for Admins/Heads/Oversight */}
        {(userRole === 'SuperAdmin' || userRole === 'DepartmentHead' || userRole === 'PastoralOversight') && (
          <div className={styles.orgSection}>
            <div className={styles.sectionHeader}>
              <Users size={20} />
              <h2>Organization Structure</h2>
            </div>
            <div className="flex items-center justify-center p-12 text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              Set up your departments and subunits to view the organogram.
            </div>
          </div>
        )}

        {/* Recent Activity / Tasks */}
        <div className={styles.activitySection}>
          <div className={styles.sectionHeader}>
            <AlertTriangle size={20} />
            <h2>Recent Alerts</h2>
          </div>
          <div className={styles.activityList}>
            {activities?.length ? activities.map(activity => (
              <div key={activity._id} className={styles.activityItem}>
                <div className={styles.activityIndicator} />
                <div className={styles.activityContent}>
                  <p className={styles.activityTitle}>{activity.title}</p>
                  <p className={styles.activityMeta}>{activity.message}</p>
                </div>
                <ChevronRight size={16} className={styles.activityAction} />
              </div>
            )) : (
              <div className="p-4 text-center text-gray-400">
                No recent alerts.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

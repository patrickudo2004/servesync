import React from 'react';
import { 
  Users, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronRight
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
import { Organogram, OrgNode } from '../components/Organogram';
import { UserRole } from '../components/RoleBadge';
import { OversightDashboardTab } from '../components/OversightDashboardTab';
import styles from './Dashboard.module.css';

// Mock data for demonstration
const ATTENDANCE_DATA = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

const ORG_DATA: OrgNode = {
  id: '1',
  name: 'Senior Pastor',
  role: 'SuperAdmin',
  children: [
    {
      id: 'oversight-1',
      name: 'Pastor Mike',
      role: 'PastoralOversight',
      children: [
        {
          id: '2',
          name: 'John Doe',
          role: 'DepartmentHead',
          children: [
            { id: '3', name: 'Jane Smith', role: 'SubunitLead', children: [
              { id: '4', name: 'Alice Johnson', role: 'Volunteer' },
              { id: '5', name: 'Bob Wilson', role: 'Probation' },
            ]},
          ]
        },
        {
          id: '6',
          name: 'Sarah Parker',
          role: 'DepartmentHead',
          children: [
            { id: '7', name: 'Mike Ross', role: 'SubunitLead' },
          ]
        }
      ]
    }
  ]
};

interface DashboardProps {
  userRole: UserRole;
}

export const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const me = useQuery(api.users.me);
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

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <Users className={styles.statIcon} style={{ color: '#8b5cf6' }} />
            <span className={styles.statLabel}>Total Volunteers</span>
          </div>
          <div className={styles.statValue}>124</div>
          <div className={styles.statTrend}>+12% from last month</div>
        </div>
        
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <CheckCircle className={styles.statIcon} style={{ color: '#10b981' }} />
            <span className={styles.statLabel}>Avg. Attendance</span>
          </div>
          <div className={styles.statValue}>88%</div>
          <div className={styles.statTrend}>Stable</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <CalendarIcon className={styles.statIcon} style={{ color: '#3b82f6' }} />
            <span className={styles.statLabel}>Upcoming Services</span>
          </div>
          <div className={styles.statValue}>4</div>
          <div className={styles.statTrend}>Next: Sunday 9AM</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <Clock className={styles.statIcon} style={{ color: '#f59e0b' }} />
            <span className={styles.statLabel}>Pending Requests</span>
          </div>
          <div className={styles.statValue}>7</div>
          <div className={styles.statTrend}>Requires approval</div>
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
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ATTENDANCE_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Organogram Section - Only for Admins/Heads/Oversight */}
        {(userRole === 'SuperAdmin' || userRole === 'DepartmentHead' || userRole === 'PastoralOversight') && (
          <div className={styles.orgSection}>
            <div className={styles.sectionHeader}>
              <Users size={20} />
              <h2>Organization Structure</h2>
            </div>
            <Organogram data={ORG_DATA} />
          </div>
        )}

        {/* Recent Activity / Tasks */}
        <div className={styles.activitySection}>
          <div className={styles.sectionHeader}>
            <AlertTriangle size={20} />
            <h2>Recent Alerts</h2>
          </div>
          <div className={styles.activityList}>
            {[1, 2, 3].map(i => (
              <div key={i} className={styles.activityItem}>
                <div className={styles.activityIndicator} />
                <div className={styles.activityContent}>
                  <p className={styles.activityTitle}>Rota Gap Detected</p>
                  <p className={styles.activityMeta}>Audio-Visual department has a missing Sound Lead for Sunday.</p>
                </div>
                <ChevronRight size={16} className={styles.activityAction} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

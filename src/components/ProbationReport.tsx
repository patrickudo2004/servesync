import React from 'react';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  User
} from 'lucide-react';
import styles from './ProbationReport.module.css';

interface ProbationReportProps {
  userId: any;
}

export const ProbationReport: React.FC<ProbationReportProps> = ({ userId }) => {
  const report = useQuery(api.probation.getProbationReport, { userId });

  if (!report) {
    return (
      <div className={styles.loading}>
        <BarChart3 className={styles.spinner} />
        <p>Generating report...</p>
      </div>
    );
  }

  const { probation, logs, stats } = report;

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'Excellent': return styles.excellent;
      case 'Good': return styles.good;
      case 'Needs Improvement': return styles.needsImprovement;
      case 'Disapprove': return styles.disapprove;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <TrendingUp className={styles.headerIcon} />
          <div>
            <h3>Probation Progress Report</h3>
            <p>Period: {new Date(probation.startDate).toLocaleDateString()} — {new Date(probation.endDate).toLocaleDateString()}</p>
          </div>
        </div>
        <div className={styles.statusBadge}>
          {probation.status.toUpperCase()}
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><CheckCircle size={20} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Attendance</span>
            <span className={styles.statValue}>{(stats.attendanceRate * 100).toFixed(0)}%</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><BarChart3 size={20} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Avg KPI Score</span>
            <span className={styles.statValue}>{stats.avgScore.toFixed(1)} / 4.0</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><MessageSquare size={20} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Reviews</span>
            <span className={styles.statValue}>{stats.totalLogs}</span>
          </div>
        </div>
      </div>

      <div className={styles.logsSection}>
        <h4>Recent Recommendations</h4>
        <div className={styles.logsList}>
          {logs.length === 0 ? (
            <div className={styles.empty}>No reviews logged yet.</div>
          ) : (
            logs.map((log) => (
              <div key={log._id} className={styles.logCard}>
                <div className={styles.logHeader}>
                  <div className={`${styles.scoreBadge} ${getScoreColor(log.score)}`}>
                    {log.score}
                  </div>
                  <span className={styles.logDate}>
                    <Calendar size={12} />
                    {new Date(log.date).toLocaleDateString()}
                  </span>
                </div>
                {log.note && (
                  <p className={styles.logNote}>
                    <MessageSquare size={14} className={styles.noteIcon} />
                    {log.note}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {probation.status === 'extended' && (
        <div className={styles.alert}>
          <AlertCircle size={18} />
          <span>This probation period has been extended due to performance concerns.</span>
        </div>
      )}
    </div>
  );
};

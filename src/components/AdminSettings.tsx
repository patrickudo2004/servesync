import React, { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Settings, Save, MapPin, Shield, QrCode } from 'lucide-react';
import styles from '../pages/AdminPage.module.css';

interface AdminSettingsProps {
  church: {
    id: string;
    name: string;
    settings?: {
      attendanceWindowMinutes?: number;
      geofenceRadius?: number;
      requireLeadApprovalForSwaps?: boolean;
      defaultQrType?: "Unique" | "Generic";
    };
  };
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ church }) => {
  const updateSettings = useMutation(api.churches.updateSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    attendanceWindowMinutes: church.settings?.attendanceWindowMinutes || 30,
    geofenceRadius: church.settings?.geofenceRadius || 100,
    requireLeadApprovalForSwaps: church.settings?.requireLeadApprovalForSwaps ?? true,
    defaultQrType: church.settings?.defaultQrType || "Unique",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings(formData);
      alert("Settings updated successfully!");
    } catch (err) {
      alert("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.settingsGrid}>
      <form onSubmit={handleSubmit} className={styles.settingsForm}>
        <div className={styles.sectionHeader}>
          <Settings size={20} />
          <h2>Global Configurations</h2>
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <label>
              <div className={styles.labelWithIcon}>
                <Shield size={16} />
                Attendance Window (Minutes)
              </div>
            </label>
            <input 
              type="number" 
              value={formData.attendanceWindowMinutes}
              onChange={e => setFormData({...formData, attendanceWindowMinutes: parseInt(e.target.value)})}
            />
            <p className={styles.hint}>How many minutes before/after a service starts that a volunteer can check in.</p>
          </div>

          <div className={styles.field}>
            <label>
              <div className={styles.labelWithIcon}>
                <MapPin size={16} />
                Geofence Radius (Meters)
              </div>
            </label>
            <input 
              type="number" 
              value={formData.geofenceRadius}
              onChange={e => setFormData({...formData, geofenceRadius: parseInt(e.target.value)})}
            />
            <p className={styles.hint}>The maximum distance from the church location allowed for check-in.</p>
          </div>

          <div className={styles.field}>
            <label>
              <div className={styles.labelWithIcon}>
                <QrCode size={16} />
                Default QR Code Type
              </div>
            </label>
            <select 
              value={formData.defaultQrType}
              onChange={e => setFormData({...formData, defaultQrType: e.target.value as any})}
            >
              <option value="Unique">Unique (New code per service - High Security)</option>
              <option value="Generic">Generic (Fixed code per church - Convenient)</option>
            </select>
            <p className={styles.hint}>Choose whether attendance QR codes should be regenerated for every service by default.</p>
          </div>

          <div className={styles.checkboxField}>
            <input 
              type="checkbox" 
              id="requireApproval"
              checked={formData.requireLeadApprovalForSwaps}
              onChange={e => setFormData({...formData, requireLeadApprovalForSwaps: e.target.checked})}
            />
            <label htmlFor="requireApproval">Require Lead Approval for Rota Swaps</label>
          </div>
        </div>

        <button type="submit" className={styles.saveBtn} disabled={isSaving}>
          {isSaving ? "Saving..." : <><Save size={18} /> Save Settings</>}
        </button>
      </form>

      <div className={styles.settingsSidebar}>
        <div className={styles.infoCard}>
          <h3>Security Tip</h3>
          <p>Using <strong>Unique QR Codes</strong> prevents volunteers from scanning codes from previous weeks or photos shared online, as each service generates its own temporary secret.</p>
        </div>
      </div>
    </div>
  );
};

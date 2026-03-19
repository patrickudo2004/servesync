import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { 
  Settings, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Save, 
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminSettings.module.css';

export const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const church = useQuery(api.churches.getMyChurch);
  const updateSettings = useMutation(api.churches.updateSettings);
  
  const [formData, setFormData] = useState({
    attendanceWindowMinutes: 30,
    geofenceRadius: 100,
    requireLeadApprovalForSwaps: false,
    lat: 0,
    lng: 0
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (church) {
      setFormData({
        attendanceWindowMinutes: church.settings?.attendanceWindowMinutes ?? 30,
        geofenceRadius: church.settings?.geofenceRadius ?? 100,
        requireLeadApprovalForSwaps: church.settings?.requireLeadApprovalForSwaps ?? false,
        lat: church.location?.lat ?? 0,
        lng: church.location?.lng ?? 0
      });
    }
  }, [church]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({
        attendanceWindowMinutes: formData.attendanceWindowMinutes,
        geofenceRadius: formData.geofenceRadius,
        requireLeadApprovalForSwaps: formData.requireLeadApprovalForSwaps,
        location: {
          lat: formData.lat,
          lng: formData.lng
        }
      });
      alert('Settings updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      setFormData(prev => ({
        ...prev,
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }));
    });
  };

  if (!church) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          <ChevronLeft size={20} />
        </button>
        <div className={styles.titleGroup}>
          <Settings className={styles.icon} size={24} />
          <h1>Church Settings</h1>
        </div>
      </header>

      <form onSubmit={handleSave} className={styles.form}>
        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <Clock size={20} />
            <h3>Attendance Window</h3>
          </div>
          <p className={styles.sectionDesc}>
            Minutes before and after a service that volunteers can check in.
          </p>
          <div className={styles.inputGroup}>
            <input 
              type="number" 
              value={formData.attendanceWindowMinutes}
              onChange={(e) => setFormData({...formData, attendanceWindowMinutes: parseInt(e.target.value)})}
              className={styles.input}
            />
            <span className={styles.unit}>minutes</span>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <MapPin size={20} />
            <h3>Geofencing</h3>
          </div>
          <p className={styles.sectionDesc}>
            Maximum distance (radius) from church location to allow check-in.
          </p>
          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label>Radius (meters)</label>
              <input 
                type="number" 
                value={formData.geofenceRadius}
                onChange={(e) => setFormData({...formData, geofenceRadius: parseInt(e.target.value)})}
                className={styles.input}
              />
            </div>
            <div className={styles.locationControls}>
              <div className={styles.inputGroup}>
                <label>Latitude</label>
                <input 
                  type="number" step="any"
                  value={formData.lat}
                  onChange={(e) => setFormData({...formData, lat: parseFloat(e.target.value)})}
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Longitude</label>
                <input 
                  type="number" step="any"
                  value={formData.lng}
                  onChange={(e) => setFormData({...formData, lng: parseFloat(e.target.value)})}
                  className={styles.input}
                />
              </div>
              <button 
                type="button" 
                onClick={useCurrentLocation}
                className={styles.locationBtn}
              >
                Use My Current Location
              </button>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <ShieldCheck size={20} />
            <h3>Governance</h3>
          </div>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input 
                type="checkbox"
                checked={formData.requireLeadApprovalForSwaps}
                onChange={(e) => setFormData({...formData, requireLeadApprovalForSwaps: e.target.checked})}
              />
              <span>Require Subunit Lead approval for shift swaps</span>
            </label>
          </div>
        </section>

        <button type="submit" disabled={isSaving} className={styles.saveBtn}>
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save Settings
        </button>
      </form>
    </div>
  );
};

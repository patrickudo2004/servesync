import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Calendar, Plus, QrCode, Clock, MapPin, Loader2, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import styles from './ServiceManagement.module.css';

export const ServiceManagement: React.FC = () => {
  const services = useQuery(api.services.getChurchServices);
  const createService = useMutation(api.services.createService);
  
  const [isAdding, setIsAdding] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    startTime: '09:00',
    endTime: '11:00'
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const start = new Date(`${formData.date}T${formData.startTime}`).getTime();
    const end = new Date(`${formData.date}T${formData.endTime}`).getTime();
    
    try {
      await createService({
        name: formData.name,
        startTime: start,
        endTime: end
      });
      setIsAdding(false);
      setFormData({ name: '', date: '', startTime: '09:00', endTime: '11:00' });
    } catch (err) {
      alert("Failed to create service");
    }
  };

  if (services === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleInfo}>
          <Calendar className={styles.headerIcon} />
          <div>
            <h1>Service Management</h1>
            <p>Schedule services and generate attendance QR codes.</p>
          </div>
        </div>
        <button className={styles.addBtn} onClick={() => setIsAdding(true)}>
          <Plus size={20} /> Create Service
        </button>
      </header>

      <div className={styles.grid}>
        {services.length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar size={48} />
            <h3>No services scheduled</h3>
            <p>Get started by creating your first church service.</p>
          </div>
        ) : (
          services.map(service => (
            <div key={service._id} className={styles.serviceCard}>
              <div className={styles.serviceInfo}>
                <div className={styles.dateBadge}>
                  <span className={styles.day}>{new Date(service.startTime).getDate()}</span>
                  <span className={styles.month}>
                    {new Date(service.startTime).toLocaleString('default', { month: 'short' })}
                  </span>
                </div>
                <div className={styles.details}>
                  <h3>{service.name}</h3>
                  <div className={styles.meta}>
                    <Clock size={14} />
                    <span>
                      {new Date(service.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                      {new Date(service.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                className={styles.qrBtn}
                onClick={() => setSelectedService(service)}
              >
                <QrCode size={18} /> View QR
              </button>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {isAdding && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Schedule New Service</h2>
              <button onClick={() => setIsAdding(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className={styles.form}>
              <div className={styles.field}>
                <label>Service Name</label>
                <input 
                  placeholder="e.g. Sunday Celebration" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Date</label>
                <input 
                  type="date" 
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Start Time</label>
                  <input 
                    type="time" 
                    value={formData.startTime}
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>End Time</label>
                  <input 
                    type="time" 
                    value={formData.endTime}
                    onChange={e => setFormData({...formData, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>
              <button type="submit" className={styles.submitBtn}>Create Service</button>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {selectedService && (
        <div className={styles.modalOverlay}>
          <div className={styles.qrModal}>
            <div className={styles.modalHeader}>
              <h2>Attendance QR Code</h2>
              <button onClick={() => setSelectedService(null)}><X size={20} /></button>
            </div>
            <div className={styles.qrContent}>
              <div className={styles.qrWrapper}>
                <QRCodeCanvas 
                  value={JSON.stringify({
                    serviceId: selectedService._id,
                    secret: selectedService.qrCodeSecret
                  })}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <h3>{selectedService.name}</h3>
              <p>Display this code at the church entrance for volunteers to scan.</p>
            </div>
            <button className={styles.printBtn} onClick={() => window.print()}>Print Code</button>
          </div>
        </div>
      )}
    </div>
  );
};

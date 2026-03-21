import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  User,
  AlertCircle,
  X,
  Trash2,
  Loader2
} from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, endOfWeek } from 'date-fns';
import styles from './Rota.module.css';
import { RoleBadge, UserRole } from '../components/RoleBadge';

export const Rota: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const startDate = startOfWeek(currentWeek).getTime();
  const endDate = endOfWeek(currentWeek).getTime();
  
  const rotaEntries = useQuery(api.rotas.getRotaForWeek, { startDate, endDate });
  const allUsers = useQuery(api.users.getAllChurchUsers);
  const services = useQuery(api.services.getChurchServices);
  const subunits = useQuery(api.subunits.getSubunits);

  const createShift = useMutation(api.rotas.createRotaEntry);
  const removeShift = useMutation(api.rotas.removeRotaEntry);
  const createService = useMutation(api.services.createService);

  const [isAssigning, setIsAssigning] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const [newShift, setNewShift] = useState({
    userId: '',
    serviceId: '',
    subunitId: '',
    role: ''
  });

  const [newService, setNewService] = useState({
    name: '',
    time: '09:00',
    qrType: 'Unique' as 'Unique' | 'Generic'
  });

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;
    
    try {
      const [hours, minutes] = newService.time.split(':').map(Number);
      const startTime = new Date(selectedDay);
      startTime.setHours(hours, minutes, 0, 0);
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2h default

      await createService({
        name: newService.name,
        startTime: startTime.getTime(),
        endTime: endTime.getTime(),
        qrType: newService.qrType
      });
      setIsAddingService(false);
      setNewService({ name: '', time: '09:00', qrType: 'Unique' });
    } catch (err) {
      alert("Failed to create service");
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createShift({
        serviceId: newShift.serviceId as any,
        userId: newShift.userId as any,
        subunitId: newShift.subunitId as any,
        role: newShift.role
      });
      setIsAssigning(false);
      setNewShift({ userId: '', serviceId: '', subunitId: '', role: '' });
    } catch (err) {
      alert("Failed to assign shift");
    }
  };

  const handleDelete = async (id: any) => {
    if (confirm("Remove this shift assignment?")) {
      await removeShift({ rotaId: id });
    }
  };

  if (rotaEntries === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  const weekDays = [...Array(7)].map((_, i) => addDays(startOfWeek(currentWeek), i));

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.nav}>
          <button onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))} className={styles.navBtn}>
            <ChevronLeft size={20} />
          </button>
          <h2 className={styles.weekRange}>
            {format(startDate, 'MMM d')} - {format(addDays(startDate, 6), 'MMM d, yyyy')}
          </h2>
          <button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} className={styles.navBtn}>
            <ChevronRight size={20} />
          </button>
        </div>
        
        <button className={styles.addBtn} onClick={() => setIsAssigning(true)}>
          <Plus size={18} />
          <span>Add Shift</span>
        </button>
      </div>

      <div className={styles.grid}>
        {weekDays.map(day => {
          const hasService = services?.some(s => isSameDay(new Date(s.startTime), day));
          return (
          <div key={day.toString()} className={styles.dayColumn}>
            <div className={`
              ${styles.dayHeader} 
              ${isSameDay(day, new Date()) ? styles.today : ''}
              ${hasService ? styles.hasService : ''}
            `}>
              <div className={styles.dayInfo}>
                <span className={styles.dayName}>{format(day, 'EEE')}</span>
                <span className={styles.dayNumber}>{format(day, 'd')}</span>
              </div>
              <button 
                className={styles.dayAddBtn} 
                onClick={() => { setSelectedDay(day); setIsAddingService(true); }}
                title="Add Service"
              >
                <Plus size={14} />
              </button>
            </div>
            
            <div className={styles.slots}>
              {rotaEntries
                .filter(r => isSameDay(new Date(r.date), day))
                .map(entry => (
                  <div key={entry._id} className={`${styles.card} ${styles[entry.status.toLowerCase()]}`}>
                    <div className={styles.cardHeader}>
                      <span className={styles.position}>{entry.position}</span>
                      <div className={styles.cardActions}>
                        {entry.status === 'Pending' && <Clock size={12} className={styles.pendingIcon} />}
                        <button onClick={() => handleDelete(entry._id)} className={styles.deleteBtn}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.serviceTag}>{entry.serviceName}</div>
                    <div className={styles.cardUser}>
                      <div className={styles.avatar}>{entry.userName[0]}</div>
                      <div className={styles.userDetails}>
                        <p className={styles.userName}>{entry.userName}</p>
                        <RoleBadge role={entry.userRole as any} className={styles.miniBadge} />
                      </div>
                    </div>
                  </div>
                ))}
              
              <button 
                className={styles.emptySlot}
                onClick={() => setIsAssigning(true)}
              >
                <Plus size={14} />
                <span>Assign Volunteer</span>
              </button>
            </div>
          </div>
          );
        })}
      </div>

      {/* Gap Detection Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <AlertCircle size={18} />
          <h3>Coverage Audit</h3>
        </div>
        <div className={styles.gapList}>
          {rotaEntries.length === 0 ? (
            <div className={styles.auditStatus}>
              <p className={styles.emptyText}>No shifts assigned this week.</p>
            </div>
          ) : (
            <>
              <div className={styles.auditItem}>
                <p className={styles.auditLabel}>Weekly Capacity</p>
                <div className={styles.auditValue}>
                  <strong>{rotaEntries.length}</strong> positions filled
                </div>
              </div>
              
              {/* Proactive warnings */}
              {services?.filter(s => s.startTime >= startDate && s.startTime <= endDate).map(s => {
                const filled = rotaEntries.filter(r => r.serviceId === s._id).length;
                const isUnderstaffed = filled < 3; // Mock logic for "understaffed"
                return isUnderstaffed ? (
                  <div key={s._id} className={styles.auditWarning}>
                    <p><strong>{s.name}</strong> is understaffed</p>
                    <span>Only {filled} volunteers assigned</span>
                  </div>
                ) : null;
              })}
            </>
          )}
        </div>
      </div>

      {/* Service Creation Modal */}
      {isAddingService && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Create Service for {selectedDay && format(selectedDay, 'MMM d')}</h2>
              <button onClick={() => setIsAddingService(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateService} className={styles.form}>
              <div className={styles.field}>
                <label>Service Name</label>
                <input 
                  placeholder="e.g. Sunday Morning Service" 
                  value={newService.name}
                  onChange={e => setNewService({...newService, name: e.target.value})}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Start Time</label>
                <input 
                  type="time"
                  value={newService.time}
                  onChange={e => setNewService({...newService, time: e.target.value})}
                  required
                />
              </div>
              <div className={styles.field}>
                <label>QR Code Type</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input 
                      type="radio" 
                      value="Unique" 
                      checked={newService.qrType === 'Unique'} 
                      onChange={() => setNewService({...newService, qrType: 'Unique'})}
                    />
                    <span>Unique (Per Service)</span>
                  </label>
                  <label className={styles.radioLabel}>
                    <input 
                      type="radio" 
                      value="Generic" 
                      checked={newService.qrType === 'Generic'} 
                      onChange={() => setNewService({...newService, qrType: 'Generic'})}
                    />
                    <span>Generic (Static)</span>
                  </label>
                </div>
              </div>
              <button type="submit" className={styles.submitBtn}>Create Service</button>
            </form>
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {isAssigning && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Assign Shift</h2>
              <button onClick={() => setIsAssigning(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAssign} className={styles.form}>
              <div className={styles.field}>
                <label>Service</label>
                <select 
                  value={newShift.serviceId}
                  onChange={e => setNewShift({...newShift, serviceId: e.target.value})}
                  required
                >
                  <option value="">Select Service</option>
                  {services?.map(s => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({format(s.startTime, 'EEE, MMM d')})
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Volunteer</label>
                <select 
                  value={newShift.userId}
                  onChange={e => setNewShift({...newShift, userId: e.target.value})}
                  required
                >
                  <option value="">Select User</option>
                  {allUsers?.map(u => (
                    <option key={u._id} value={u._id}>{u.name || u.email}</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Unit</label>
                <select 
                  value={newShift.subunitId}
                  onChange={e => setNewShift({...newShift, subunitId: e.target.value})}
                  required
                >
                  <option value="">Select Unit</option>
                  {subunits?.map(sub => (
                    <option key={sub._id} value={sub._id}>{sub.name} ({sub.departmentName})</option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label>Role in Service</label>
                <input 
                  placeholder="e.g. Lead Vocals, Slide Operator" 
                  value={newShift.role}
                  onChange={e => setNewShift({...newShift, role: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn}>Assign Positions</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

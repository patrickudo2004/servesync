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

  const [isAssigning, setIsAssigning] = useState(false);
  const [newShift, setNewShift] = useState({
    userId: '',
    serviceId: '',
    subunitId: '',
    role: ''
  });

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
        
        <button className={styles.addBtn}>
          <Plus size={18} />
          <span>Add Shift</span>
        </button>
      </div>

      <div className={styles.grid}>
        {weekDays.map(day => (
          <div key={day.toString()} className={styles.dayColumn}>
            <div className={`${styles.dayHeader} ${isSameDay(day, new Date()) ? styles.today : ''}`}>
              <span className={styles.dayName}>{format(day, 'EEE')}</span>
              <span className={styles.dayNumber}>{format(day, 'd')}</span>
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
                <span>Assign</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Gap Detection Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <AlertCircle size={18} />
          <h3>Health Audit</h3>
        </div>
        <div className={styles.gapList}>
          {rotaEntries.length === 0 ? (
            <p className={styles.emptyText}>No shifts assigned this week.</p>
          ) : (
            <div className={styles.gapItem}>
              <p className={styles.gapTitle}>Weekly Capacity</p>
              <p className={styles.gapMeta}>{rotaEntries.length} positions filled</p>
            </div>
          )}
        </div>
      </div>

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
                    <option key={sub._id} value={sub._id}>{sub.name} ({sub.department})</option>
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

import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Organogram } from '../components/Organogram';
import { Users, Mail, Settings, Shield, Loader2, Plus, Trash2, UserCog, ChevronRight, Building2 } from 'lucide-react';
import styles from './AdminPage.module.css';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'users' | 'settings'>('hierarchy');
  const organogramData = useQuery(api.churches.getOrganogram);
  const subunits = useQuery(api.subunits.getSubunits);
  const users = useQuery(api.users.getAllChurchUsers);
  
  const createSubunit = useMutation(api.subunits.createSubunit);
  const deleteSubunit = useMutation(api.subunits.deleteSubunit);
  const updateUserRole = useMutation(api.users.updateUserRole);

  const [isAddingSubunit, setIsAddingSubunit] = useState(false);
  const [newSubunit, setNewSubunit] = useState({ name: '', department: '' });

  const handleCreateSubunit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSubunit({ name: newSubunit.name, department: newSubunit.department });
      setNewSubunit({ name: '', department: '' });
      setIsAddingSubunit(false);
    } catch (err) {
      alert("Failed to create subunit");
    }
  };

  const handleDeleteSubunit = async (id: any) => {
    if (confirm("Are you sure you want to delete this subunit?")) {
      await deleteSubunit({ id });
    }
  };

  const handleRoleChange = async (userId: any, newRole: any) => {
    try {
      await updateUserRole({ userId, role: newRole });
      alert("Role updated successfully");
    } catch (err) {
      alert("Failed to update role");
    }
  };

  if (organogramData === undefined || subunits === undefined || users === undefined) {
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
          <Shield className={styles.headerIcon} />
          <div>
            <h1>Church Administration</h1>
            <p>Manage hierarchy, permissions, and settings.</p>
          </div>
        </div>
        <div className={styles.tabSwitcher}>
          <button 
            className={activeTab === 'hierarchy' ? styles.activeTab : ''} 
            onClick={() => setActiveTab('hierarchy')}
          >
            Hierarchy
          </button>
          <button 
            className={activeTab === 'users' ? styles.activeTab : ''} 
            onClick={() => setActiveTab('users')}
          >
            User Directory
          </button>
          <button 
            className={activeTab === 'settings' ? styles.activeTab : ''} 
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
      </header>

      <div className={styles.mainContent}>
        {activeTab === 'hierarchy' && (
          <div className={styles.tabPane}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <Users size={20} />
                <h2>Organizational Structure</h2>
              </div>
              <div className={styles.orgWrapper}>
                <Organogram data={organogramData as any} />
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <Building2 size={20} />
                <h2>Manage Units</h2>
                <button 
                  className={styles.addBtn}
                  onClick={() => setIsAddingSubunit(true)}
                >
                  <Plus size={16} /> Add Subunit
                </button>
              </div>

              {isAddingSubunit && (
                <form onSubmit={handleCreateSubunit} className={styles.inlineForm}>
                  <input 
                    placeholder="Subunit Name" 
                    value={newSubunit.name}
                    onChange={e => setNewSubunit({...newSubunit, name: e.target.value})}
                    required
                  />
                  <select 
                    value={newSubunit.department}
                    onChange={e => setNewSubunit({...newSubunit, department: e.target.value})}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Media">Media</option>
                    <option value="Protocols">Protocols</option>
                    <option value="Welfare">Welfare</option>
                    <option value="Ushers">Ushers</option>
                    <option value="Creative">Creative</option>
                  </select>
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setIsAddingSubunit(false)}>Cancel</button>
                </form>
              )}

              <div className={styles.subunitList}>
                {subunits.map(sub => (
                  <div key={sub._id} className={styles.subunitItem}>
                    <div>
                      <strong>{sub.name}</strong>
                      <span>({sub.department})</span>
                    </div>
                    <button onClick={() => handleDeleteSubunit(sub._id)} className={styles.deleteBtn}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'users' && (
          <div className={styles.tabPane}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <UserCog size={20} />
                <h2>Member Directory</h2>
              </div>
              <div className={styles.userTableWrapper}>
                <table className={styles.userTable}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Dept/Subunit</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td>{user.name || user.email}</td>
                        <td>
                          <select 
                            value={user.role || 'Volunteer'}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            className={styles.roleSelect}
                          >
                            <option value="Volunteer">Volunteer</option>
                            <option value="SubunitLead">Subunit Lead</option>
                            <option value="DepartmentHead">Department Head</option>
                            <option value="PastoralOversight">Pastoral Oversight</option>
                            <option value="SuperAdmin">Super Admin</option>
                          </select>
                        </td>
                        <td>{user.department} / {user.subunit}</td>
                        <td>
                          <button className={styles.iconBtn}><ChevronRight size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={styles.tabPane}>
             <div className={styles.toolCard}>
              <Settings size={20} />
              <h3>Church Settings</h3>
              <p>Configure geofencing, time windows, and PWA options.</p>
              <button className={styles.secondaryBtn}>Configure</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

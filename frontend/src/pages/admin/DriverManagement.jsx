import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Search,
  Plus,
  Edit2,
  Trash2,
  Bus,
  Phone,
  MapPin,
  X,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import driverService from '../../services/driverService';
import busService from '../../services/busService';
import authService from '../../services/authService';
import { useToast } from '../../context/ToastContext';

const DriverManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDriverId, setCurrentDriverId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [driverUsers, setDriverUsers] = useState([]);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickUser, setQuickUser] = useState({ name: '', email: '', password: '' });
  const [quickLoading, setQuickLoading] = useState(false);

  const initialForm = {
    userId: '',
    licenseNumber: '',
    phone: '',
    address: '',
    busId: '',
    status: 'Available',
  };
  const [formData, setFormData] = useState(initialForm);

  const { addToast } = useToast();

  const loadData = async () => {
    try {
      const [driversRes, busesRes] = await Promise.all([
        driverService.getAllDrivers(),
        busService.getAllBuses(),
      ]);
      setDrivers(driversRes.drivers || []);
      setBuses(busesRes.buses || []);

      try {
        const usersRes = await driverService.getDriverUsers();
        if (usersRes?.users) {
          setDriverUsers(usersRes.users);
        }
      } catch {
        const fallbackUsers = [];
        const seen = new Set();
        (driversRes.drivers || []).forEach((d) => {
          if (d.userId && d.userId._id && !seen.has(d.userId._id)) {
            seen.add(d.userId._id);
            fallbackUsers.push(d.userId);
          }
        });
        setDriverUsers(fallbackUsers);
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
      addToast('Failed to load driver roster', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentDriverId(null);
    setShowQuickCreate(false);
    setQuickUser({ name: '', email: '', password: '' });
    const firstAvailable = driverUsers.find((u) => !u.isAssigned);
    setFormData({
      ...initialForm,
      userId: firstAvailable ? firstAvailable._id : (driverUsers[0]?._id || ''),
    });
    setIsAddEditOpen(true);
  };

  const handleQuickCreateUser = async (e) => {
    e.preventDefault();
    if (!quickUser.name.trim() || !quickUser.email.trim() || !quickUser.password.trim()) {
      addToast('Please fill in name, email, and password for the driver account', 'error');
      return;
    }
    if (quickUser.password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    setQuickLoading(true);
    try {
      const res = await authService.register({
        name: quickUser.name.trim(),
        email: quickUser.email.trim().toLowerCase(),
        password: quickUser.password,
        role: 'driver',
      });
      const newUser = res.user;
      const createdUser = {
        _id: newUser.id || newUser._id,
        name: newUser.name,
        email: newUser.email,
        isAssigned: false,
      };
      setDriverUsers((prev) => [createdUser, ...prev]);
      setFormData((prev) => ({ ...prev, userId: createdUser._id }));
      setShowQuickCreate(false);
      setQuickUser({ name: '', email: '', password: '' });
      addToast(`Driver account created for ${createdUser.name}! Selected automatically.`, 'success');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create driver account';
      addToast(msg, 'error');
    } finally {
      setQuickLoading(false);
    }
  };

  const handleOpenEdit = (driver) => {
    setIsEditing(true);
    setCurrentDriverId(driver._id);
    setFormData({
      userId: driver.userId?._id || driver.userId || '',
      licenseNumber: driver.licenseNumber || '',
      phone: driver.phone || '',
      address: driver.address || '',
      busId: driver.busId?._id || driver.busId || '',
      status: driver.status || 'Available',
    });
    setIsAddEditOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        licenseNumber: formData.licenseNumber.trim().toUpperCase(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        busId: formData.busId || null,
        status: formData.status,
      };

      if (!isEditing) {
        payload.userId = formData.userId.trim();
        await driverService.createDriver(payload);
        addToast('Driver profile registered successfully', 'success');
      } else {
        await driverService.updateDriver(currentDriverId, payload);
        addToast('Driver profile updated', 'success');
      }

      setIsAddEditOpen(false);
      loadData();
    } catch (err) {
      console.error('Save driver error:', err);
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      addToast(msg, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!driverToDelete) return;
    setFormLoading(true);
    try {
      await driverService.deleteDriver(driverToDelete._id);
      addToast('Driver profile removed', 'success');
      setIsDeleteOpen(false);
      setDriverToDelete(null);
      loadData();
    } catch (err) {
      console.error('Delete driver error:', err);
      addToast('Failed to delete driver', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredDrivers = drivers.filter((d) => {
    const nameMatch = d.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const licenseMatch = d.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = d.phone?.includes(searchTerm);
    const busMatch = d.busId?.busNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSearch = nameMatch || licenseMatch || phoneMatch || busMatch;
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <DashboardHeader
        title="Driver Fleet Personnel"
        subtitle="Manage licensed drivers, phone contacts, and assigned school buses"
      />

      <div className="dashboard-content">
        {/* Controls */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
            <div className="input-with-icon" style={{ minWidth: '240px', flex: 1 }}>
              <Search size={18} className="input-icon-left" />
              <input
                type="text"
                className="form-control"
                placeholder="Search driver name, license, bus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="form-control"
              style={{ width: 'auto', minWidth: '150px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Available">Available</option>
              <option value="On Trip">On Trip</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <button onClick={handleOpenAdd} className="btn btn-primary" style={{ gap: '0.4rem' }}>
            <Plus size={18} /> Add Driver Profile
          </button>
        </div>

        {/* Drivers Table */}
        {loading ? (
          <LoadingSpinner text="Loading driver roster..." />
        ) : filteredDrivers.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No drivers found"
            description="No drivers match your current filter criteria."
            action={
              <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
                <Plus size={16} /> Add First Driver
              </button>
            }
          />
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Driver Name</th>
                  <th>Commercial License</th>
                  <th>Phone Contact</th>
                  <th>Assigned Bus</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver) => (
                  <tr key={driver._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {driver.userId?.name || 'Driver Account'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {driver.userId?.email || 'N/A'} • {driver.address}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary-navy)' }}>
                        {driver.licenseNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                        <Phone size={14} color="var(--secondary-blue)" />
                        <span>{driver.phone}</span>
                      </div>
                    </td>
                    <td>
                      {driver.busId ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Bus size={15} color="var(--secondary-blue)" />
                          <span style={{ fontWeight: 600 }}>{driver.busId.busNumber}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ({driver.busId.registrationNumber})
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          driver.status === 'Available'
                            ? 'badge-success'
                            : driver.status === 'On Trip'
                            ? 'badge-info'
                            : 'badge-error'
                        }`}
                      >
                        {driver.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleOpenEdit(driver)}
                          className="btn btn-outline btn-sm"
                          title="Edit Driver"
                          style={{ padding: '0.4rem' }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setDriverToDelete(driver);
                            setIsDeleteOpen(true);
                          }}
                          className="btn btn-outline btn-sm"
                          title="Delete Driver"
                          style={{ padding: '0.4rem', color: 'var(--error)' }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Driver Modal */}
      {isAddEditOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>{isEditing ? 'Update Driver Profile' : 'Register Driver Profile'}</h3>
              <button
                onClick={() => setIsAddEditOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                {!isEditing && (
                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label className="form-label" style={{ margin: 0 }}>
                        Driver Account <span className="req">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowQuickCreate(!showQuickCreate)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary-navy)',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          padding: 0,
                        }}
                      >
                        {showQuickCreate ? 'Cancel New Account' : '+ Create New Driver Account'}
                      </button>
                    </div>

                    {showQuickCreate ? (
                      <div
                        style={{
                          padding: '0.85rem',
                          background: 'var(--bg-main, #F8FAFC)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md, 8px)',
                          marginBottom: '0.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.6rem',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          Quick Register New Driver User Account
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Driver Full Name (e.g. Ramesh Kumar)"
                          value={quickUser.name}
                          onChange={(e) => setQuickUser({ ...quickUser, name: e.target.value })}
                        />
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Driver Email (e.g. ramesh@example.com)"
                          value={quickUser.email}
                          onChange={(e) => setQuickUser({ ...quickUser, email: e.target.value })}
                        />
                        <input
                          type="password"
                          className="form-control"
                          placeholder="Password (min 6 characters)"
                          value={quickUser.password}
                          onChange={(e) => setQuickUser({ ...quickUser, password: e.target.value })}
                        />
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ padding: '0.45rem 0.85rem', fontSize: '0.825rem', alignSelf: 'flex-start' }}
                          onClick={handleQuickCreateUser}
                          disabled={quickLoading}
                        >
                          {quickLoading ? 'Creating Account...' : 'Save & Select Driver Account'}
                        </button>
                      </div>
                    ) : driverUsers.length > 0 ? (
                      <select
                        className="form-control"
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        required
                      >
                        <option value="">Select linked driver</option>
                        {driverUsers.map((u) => (
                          <option key={u._id} value={u._id} disabled={u.isAssigned}>
                            {u.name} ({u.email}){u.isAssigned ? ' — [Already Profiled]' : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <select
                          className="form-control"
                          value={formData.userId}
                          onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                          required
                        >
                          <option value="">Select linked driver</option>
                        </select>
                        <span style={{ fontSize: '0.75rem', color: 'var(--amber-700, #B45309)' }}>
                          No driver user accounts found. Click "+ Create New Driver Account" above to add one instantly!
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">
                    License Number <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. MH1234567890"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Phone Number <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Residential Address <span className="req">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="e.g. Kolhapur, Maharashtra"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned School Bus</label>
                  <select
                    className="form-control"
                    value={formData.busId}
                    onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                  >
                    <option value="">No bus assigned</option>
                    {buses.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.busNumber} ({b.registrationNumber}) - Status: {b.status}
                      </option>
                    ))}
                  </select>
                </div>

                {isEditing && (
                  <div className="form-group">
                    <label className="form-label">Operating Status</label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Available">Available</option>
                      <option value="On Trip">On Trip</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsAddEditOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : isEditing ? 'Update Driver' : 'Save Driver Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Driver Profile"
        message={`Are you sure you want to remove driver record with license "${driverToDelete?.licenseNumber}"?`}
        confirmText="Delete Driver"
        loading={formLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDriverToDelete(null);
        }}
      />
    </>
  );
};

export default DriverManagement;

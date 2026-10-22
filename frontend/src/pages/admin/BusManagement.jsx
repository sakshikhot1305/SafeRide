import React, { useState, useEffect } from 'react';
import { Bus, Plus, Edit2, Trash2, Search, Users, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import busService from '../../services/busService';
import { useToast } from '../../context/ToastContext';

const BusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBusId, setCurrentBusId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [busToDelete, setBusToDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const initialForm = {
    busNumber: '',
    registrationNumber: '',
    capacity: 40,
    status: 'Active',
  };
  const [formData, setFormData] = useState(initialForm);

  const { addToast } = useToast();

  const loadBuses = async () => {
    try {
      const data = await busService.getAllBuses();
      setBuses(data.buses || []);
    } catch (err) {
      console.error('Error fetching buses:', err);
      addToast('Failed to load fleet buses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuses();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentBusId(null);
    setFormData(initialForm);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (bus) => {
    setIsEditing(true);
    setCurrentBusId(bus._id);
    setFormData({
      busNumber: bus.busNumber,
      registrationNumber: bus.registrationNumber,
      capacity: bus.capacity,
      status: bus.status,
    });
    setIsAddEditOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        busNumber: formData.busNumber.trim().toUpperCase(),
        registrationNumber: formData.registrationNumber.trim().toUpperCase(),
        capacity: Number(formData.capacity),
        status: formData.status,
      };

      if (!isEditing) {
        await busService.createBus(payload);
        addToast('Bus registered successfully', 'success');
      } else {
        await busService.updateBus(currentBusId, payload);
        addToast('Bus specifications updated', 'success');
      }

      setIsAddEditOpen(false);
      loadBuses();
    } catch (err) {
      console.error('Save bus error:', err);
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      addToast(msg, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!busToDelete) return;
    setFormLoading(true);
    try {
      await busService.deleteBus(busToDelete._id);
      addToast('Bus vehicle removed from fleet', 'success');
      setIsDeleteOpen(false);
      setBusToDelete(null);
      loadBuses();
    } catch (err) {
      console.error('Delete bus error:', err);
      addToast('Failed to delete bus', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredBuses = buses.filter((b) => {
    const numMatch = b.busNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const regMatch = b.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return numMatch || regMatch;
  });

  return (
    <>
      <DashboardHeader
        title="Bus Fleet Management"
        subtitle="Manage school buses, passenger seating capacities, and active deployment status"
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
          <div className="input-with-icon" style={{ maxWidth: '320px', flex: 1 }}>
            <Search size={18} className="input-icon-left" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by bus # or license plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button onClick={handleOpenAdd} className="btn btn-primary" style={{ gap: '0.4rem' }}>
            <Plus size={18} /> Register New Bus
          </button>
        </div>

        {/* Bus List Table */}
        {loading ? (
          <LoadingSpinner text="Fetching fleet buses..." />
        ) : filteredBuses.length === 0 ? (
          <EmptyState
            icon={Bus}
            title="No school buses registered"
            description="Start building your transport fleet by registering your first vehicle."
            action={
              <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
                <Plus size={16} /> Register First Bus
              </button>
            }
          />
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Bus Code</th>
                  <th>License Plate</th>
                  <th>Seating Capacity</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuses.map((bus) => (
                  <tr key={bus._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--sky-blue-light)',
                            color: 'var(--secondary-blue)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Bus size={18} />
                        </div>
                        <span style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{bus.busNumber}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {bus.registrationNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Users size={15} color="var(--text-secondary)" />
                        <span style={{ fontWeight: 600 }}>{bus.capacity} seats</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${bus.status === 'Active' ? 'badge-success' : 'badge-error'}`}>
                        {bus.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => handleOpenEdit(bus)}
                          className="btn btn-outline btn-sm"
                          title="Edit Bus"
                          style={{ padding: '0.4rem' }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            setBusToDelete(bus);
                            setIsDeleteOpen(true);
                          }}
                          className="btn btn-outline btn-sm"
                          title="Delete Bus"
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

      {/* Add / Edit Bus Modal */}
      {isAddEditOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3>{isEditing ? `Edit Bus: ${formData.busNumber}` : 'Register School Bus'}</h3>
              <button
                onClick={() => setIsAddEditOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    Bus Number / Fleet Code <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. BUS002"
                    value={formData.busNumber}
                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Vehicle Registration Number <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. MH09CD5678"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Passenger Seating Capacity <span className="req">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                  />
                </div>

                {isEditing && (
                  <div className="form-group">
                    <label className="form-label">Fleet Status</label>
                    <select
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
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
                  {formLoading ? 'Saving...' : isEditing ? 'Update Bus' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Bus Vehicle"
        message={`Are you sure you want to remove bus "${busToDelete?.busNumber}" (${busToDelete?.registrationNumber})?`}
        confirmText="Delete Bus"
        loading={formLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setBusToDelete(null);
        }}
      />
    </>
  );
};

export default BusManagement;

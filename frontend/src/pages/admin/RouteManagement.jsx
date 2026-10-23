import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Search,
  Navigation,
  X,
  Map,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import ErrorBoundary from '../../components/common/ErrorBoundary';
import LeafletMap from '../../components/maps/LeafletMap';
import routeService from '../../services/routeService';
import { useToast } from '../../context/ToastContext';

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Selected route for map preview
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRouteId, setCurrentRouteId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const initialForm = {
    routeName: '',
    startPoint: '',
    endPoint: '',
    status: 'Active',
    stops: [
      { name: 'School Main Gate', latitude: 16.705, longitude: 74.243 },
      { name: 'City Center Stop', latitude: 16.71, longitude: 74.248 },
    ],
  };
  const [formData, setFormData] = useState(initialForm);

  const { addToast } = useToast();

  const loadRoutes = async () => {
    try {
      const data = await routeService.getAllRoutes();
      const loaded = data.routes || [];
      setRoutes(loaded);
      if (loaded.length > 0 && !selectedRoute) {
        setSelectedRoute(loaded[0]);
      }
    } catch (err) {
      console.error('Error fetching routes:', err);
      addToast('Failed to load transport routes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentRouteId(null);
    setFormData(initialForm);
    setIsAddEditOpen(true);
  };

  const handleOpenEdit = (route) => {
    setIsEditing(true);
    setCurrentRouteId(route._id);
    setFormData({
      routeName: route.routeName,
      startPoint: route.startPoint,
      endPoint: route.endPoint,
      status: route.status || 'Active',
      stops:
        route.stops && route.stops.length > 0
          ? route.stops.map((s) => ({
              name: s.name,
              latitude: Number(s.latitude),
              longitude: Number(s.longitude),
            }))
          : [],
    });
    setIsAddEditOpen(true);
  };

  const handleAddStop = () => {
    setFormData({
      ...formData,
      stops: [...formData.stops, { name: '', latitude: 16.705, longitude: 74.243 }],
    });
  };

  const handleRemoveStop = (index) => {
    setFormData({
      ...formData,
      stops: formData.stops.filter((_, i) => i !== index),
    });
  };

  const handleStopChange = (index, field, value) => {
    const updated = [...formData.stops];
    updated[index][field] = field === 'latitude' || field === 'longitude' ? Number(value) : value;
    setFormData({ ...formData, stops: updated });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        routeName: formData.routeName.trim(),
        startPoint: formData.startPoint.trim(),
        endPoint: formData.endPoint.trim(),
        status: formData.status,
        stops: formData.stops.map((s) => ({
          name: s.name.trim(),
          latitude: Number(s.latitude),
          longitude: Number(s.longitude),
        })),
      };

      if (!isEditing) {
        const created = await routeService.createRoute(payload);
        addToast('Route created successfully', 'success');
        if (created.route) setSelectedRoute(created.route);
      } else {
        const updated = await routeService.updateRoute(currentRouteId, payload);
        addToast('Route waypoints updated', 'success');
        if (updated.route) setSelectedRoute(updated.route);
      }

      setIsAddEditOpen(false);
      loadRoutes();
    } catch (err) {
      console.error('Save route error:', err);
      const msg = err.response?.data?.message || err.message || 'Operation failed';
      addToast(msg, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!routeToDelete) return;
    setFormLoading(true);
    try {
      await routeService.deleteRoute(routeToDelete._id);
      addToast('Route deleted successfully', 'success');
      setIsDeleteOpen(false);
      setRouteToDelete(null);
      if (selectedRoute?._id === routeToDelete._id) setSelectedRoute(null);
      loadRoutes();
    } catch (err) {
      console.error('Delete route error:', err);
      addToast('Failed to delete route', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const filteredRoutes = routes.filter((r) => {
    return (
      r.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.startPoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.endPoint.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <>
      <DashboardHeader
        title="Route Logistics & Geo-Waypoints"
        subtitle="Configure school transit routes, pickup stations, and stop coordinates"
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
              placeholder="Search route name, start, end..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button onClick={handleOpenAdd} className="btn btn-primary" style={{ gap: '0.4rem' }}>
            <Plus size={18} /> Add New Route
          </button>
        </div>

        {/* Layout Grid: Routes List + Interactive Map Preview */}
        {loading ? (
          <LoadingSpinner text="Loading route paths..." />
        ) : filteredRoutes.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No routes configured"
            description="Create your first school bus route with stops and geo-coordinates."
            action={
              <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
                <Plus size={16} /> Add First Route
              </button>
            }
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '1.5rem' }}>
            {/* Routes List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredRoutes.map((route) => {
                const isSelected = selectedRoute?._id === route._id;
                return (
                  <div
                    key={route._id}
                    className="card"
                    style={{
                      borderLeft: isSelected ? '4px solid var(--secondary-blue)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? '#FBFDFF' : '#FFFFFF',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                          {route.routeName}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                          <Navigation size={14} color="var(--secondary-blue)" />
                          <span>{route.startPoint} → {route.endPoint}</span>
                        </div>
                      </div>
                      <span className={`badge ${route.status === 'Active' ? 'badge-success' : 'badge-error'}`}>
                        {route.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {route.stops?.length || 0} Designated Stops
                      </span>

                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(route);
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.35rem 0.6rem' }}
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRouteToDelete(route);
                            setIsDeleteOpen(true);
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.35rem 0.6rem', color: 'var(--error)' }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Route Map Preview */}
            <div className="card" style={{ padding: '1.25rem', height: 'fit-content' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                    Map Waypoints: {selectedRoute?.routeName || 'Select a Route'}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Interactive Leaflet view showing pickup points and route path
                  </p>
                </div>
                <span className="badge badge-info">{selectedRoute?.stops?.length || 0} stops</span>
              </div>

              {selectedRoute && (
                <>
                  <ErrorBoundary title="Route Map Waypoints" message="Reloading route coordinates...">
                    <LeafletMap
                      height="340px"
                      busNumber={selectedRoute.routeName}
                      routeStops={selectedRoute.stops || []}
                      latitude={selectedRoute.stops?.[0]?.latitude}
                      longitude={selectedRoute.stops?.[0]?.longitude}
                    />
                  </ErrorBoundary>

                  {/* Stops Timeline List */}
                  <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Stops Sequence:
                    </h5>
                    {(selectedRoute.stops || []).map((stop, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.5rem 0.75rem',
                          backgroundColor: 'var(--bg-main)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                        }}
                      >
                        <span
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'var(--primary-navy)',
                            color: 'white',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {i + 1}
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
                          {stop.name}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {stop.latitude}, {stop.longitude}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Route Modal */}
      {isAddEditOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-header">
              <h3>{isEditing ? `Edit Route: ${formData.routeName}` : 'Create New Transit Route'}</h3>
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
                    Route Name <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Route 2 - North Suburbs"
                    value={formData.routeName}
                    onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      Start Origin Location <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Main School Gate"
                      value={formData.startPoint}
                      onChange={(e) => setFormData({ ...formData, startPoint: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Destination Endpoint <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Shivaji Chowk"
                      value={formData.endPoint}
                      onChange={(e) => setFormData({ ...formData, endPoint: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Stops Configuration */}
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Stops & GPS Coordinates
                    </label>
                    <button
                      type="button"
                      onClick={handleAddStop}
                      className="btn btn-outline btn-sm"
                      style={{ gap: '0.3rem' }}
                    >
                      <PlusCircle size={15} /> Add Stop
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {formData.stops.map((stop, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1.5fr 1.5fr auto',
                          gap: '0.5rem',
                          alignItems: 'center',
                          background: 'var(--bg-main)',
                          padding: '0.65rem',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Stop name"
                          value={stop.name}
                          onChange={(e) => handleStopChange(index, 'name', e.target.value)}
                          required
                        />
                        <input
                          type="number"
                          step="0.0001"
                          className="form-control"
                          placeholder="Latitude"
                          value={stop.latitude}
                          onChange={(e) => handleStopChange(index, 'latitude', e.target.value)}
                          required
                        />
                        <input
                          type="number"
                          step="0.0001"
                          className="form-control"
                          placeholder="Longitude"
                          value={stop.longitude}
                          onChange={(e) => handleStopChange(index, 'longitude', e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--error)',
                          }}
                        >
                          <MinusCircle size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsAddEditOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={formLoading}>
                  {formLoading ? 'Saving...' : isEditing ? 'Update Route' : 'Save Route'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Transit Route"
        message={`Are you sure you want to remove route "${routeToDelete?.routeName}"?`}
        confirmText="Delete Route"
        loading={formLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setRouteToDelete(null);
        }}
      />
    </>
  );
};

export default RouteManagement;

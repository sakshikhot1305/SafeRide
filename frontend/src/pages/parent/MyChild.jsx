import React, { useState, useEffect } from 'react';
import {
  Users,
  Bus,
  Navigation,
  QrCode,
  Calendar,
  CheckCircle2,
  Shield,
  Download,
  MapPin,
  Clock,
} from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import QRCodeDisplay from '../../components/qr/QRCodeDisplay';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import studentService from '../../services/studentService';
import { useToast } from '../../context/ToastContext';

const MyChild = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);

  const { addToast } = useToast();

  useEffect(() => {
    const fetchKids = async () => {
      try {
        const res = await studentService.getMyChildren();
        const kids = res.students || [];
        setChildren(kids);
        if (kids.length > 0) {
          setSelectedChild(kids[0]);
        }
      } catch (err) {
        console.error('Error fetching children:', err);
        addToast('Failed to load child profiles', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchKids();
  }, []);

  if (loading) {
    return (
      <>
        <DashboardHeader title="My Child Profile" subtitle="Loading verified identity details..." />
        <div className="dashboard-content">
          <LoadingSpinner text="Fetching child safety profile..." />
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader
        title="Student Safety Pass & Route Details"
        subtitle="Digital boarding pass and transportation assignment specifications"
      />

      <div className="dashboard-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {children.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Children Linked to Account"
            description="No student profiles are registered under this parent login. Please contact school transport administration."
          />
        ) : (
          <div>
            {/* Child Selector Tabs (if multiple children) */}
            {children.length > 1 && (
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
                {children.map((child) => (
                  <button
                    key={child._id}
                    onClick={() => setSelectedChild(child)}
                    className={`btn ${selectedChild?._id === child._id ? 'btn-primary' : 'btn-outline'}`}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {child.name} ({child.studentId})
                  </button>
                ))}
              </div>
            )}

            {selectedChild && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                {/* Profile Information Card */}
                <div className="card" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--sky-blue-light)',
                        color: 'var(--secondary-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1.4rem',
                      }}
                    >
                      {selectedChild.name.charAt(0)}
                    </div>
                    <div>
                      <span className="badge badge-success" style={{ marginBottom: '0.2rem' }}>
                        Active Student
                      </span>
                      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                        {selectedChild.name}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Student ID: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{selectedChild.studentId}</span>
                      </p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1.25rem',
                      padding: '1.25rem',
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '1.5rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Class & Division</p>
                      <p style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                        Grade {selectedChild.className} - {selectedChild.division}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Gender</p>
                      <p style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>{selectedChild.gender}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Date of Birth</p>
                      <p style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>
                        {selectedChild.dateOfBirth
                          ? new Date(selectedChild.dateOfBirth).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Safety Status</p>
                      <p style={{ fontWeight: 700, color: 'var(--success)' }}>Enrolled & Monitored</p>
                    </div>
                  </div>

                  {/* Assigned Bus & Route Details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--sky-blue-light)',
                          color: 'var(--secondary-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Bus size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                          Assigned School Bus
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {selectedChild.busId ? (
                            <>
                              Bus <strong>{selectedChild.busId.busNumber}</strong> (License: {selectedChild.busId.registrationNumber}) • Capacity: {selectedChild.busId.capacity} seats
                            </>
                          ) : (
                            'No bus currently assigned by school administration.'
                          )}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: '#DCFCE7',
                          color: 'var(--success)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <MapPin size={18} />
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                          Assigned Transit Route
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {selectedChild.routeId ? (
                            <>
                              <strong>{selectedChild.routeId.routeName}</strong> ({selectedChild.routeId.startPoint} → {selectedChild.routeId.endPoint})
                            </>
                          ) : (
                            'Direct transit / no designated route waypoints.'
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Printable Digital QR Pass Card */}
                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                      Digital QR Attendance Pass
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Present this pass to the driver or print a physical card.
                    </p>
                  </div>

                  <QRCodeDisplay
                    value={selectedChild._id}
                    studentName={selectedChild.name}
                    studentId={selectedChild.studentId}
                    size={200}
                  />

                  <div
                    style={{
                      marginTop: '1.5rem',
                      padding: '0.85rem',
                      backgroundColor: 'var(--warm-cream)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--warm-cream-border)',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      textAlign: 'left',
                    }}
                  >
                    <strong>Parent Note:</strong> When the driver scans this QR pass using their mobile terminal, you will receive an instantaneous notification confirming boarding or safe arrival.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default MyChild;

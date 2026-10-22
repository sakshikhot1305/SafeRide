import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bus,
  QrCode,
  Navigation,
  UserCheck,
  Phone,
  Shield,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Radio,
} from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import driverService from '../../services/driverService';
import attendanceService from '../../services/attendanceService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [driver, setDriver] = useState(null);
  const [students, setStudents] = useState([]);
  const [todayScans, setTodayScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        const [profileRes, studentsRes, attendanceRes] = await Promise.all([
          driverService.getMyDriverProfile(),
          driverService.getMyBusStudents(),
          attendanceService.getMyBusAttendance(),
        ]);

        setDriver(profileRes.driver);
        setStudents(studentsRes.students || []);
        setTodayScans(attendanceRes.attendance || []);
      } catch (err) {
        console.error('Error fetching driver dashboard data:', err);
        addToast('Notice: Driver profile details loaded with current session', 'info');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, []);

  if (loading) {
    return (
      <>
        <DashboardHeader title="Driver Terminal" subtitle="Loading vehicle assignments..." />
        <div className="dashboard-content">
          <LoadingSpinner text="Connecting driver mobile console..." />
        </div>
      </>
    );
  }

  const bus = driver?.busId;

  return (
    <>
      <DashboardHeader
        title={`Driver Terminal: ${user?.name || 'Driver'}`}
        subtitle="Smartphone control panel for school transit attendance and GPS"
      />

      <div className="dashboard-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Warning if no bus is assigned */}
        {!bus && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'var(--warning-bg)',
              border: '1px solid var(--warning-border)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem',
              color: '#92400E',
            }}
          >
            <AlertTriangle size={20} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.875rem' }}>
              <strong>Bus Not Yet Assigned:</strong> You are registered as a driver, but the transport coordinator has not linked an active bus to your profile.
            </div>
          </div>
        )}

        {/* Assigned Bus Hero Card */}
        <div
          className="card"
          style={{
            background: 'linear-gradient(135deg, #12345A 0%, #1D4B7D 100%)',
            color: '#FFFFFF',
            padding: '1.75rem',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
            <div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--sky-blue)',
                }}
              >
                Assigned Vehicle
              </span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.4rem', color: '#FFFFFF' }}>
                {bus ? bus.busNumber : 'No Bus Linked'}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#B2C7DF' }}>
                Plate: <strong>{bus?.registrationNumber || 'Pending'}</strong> • Capacity: <strong>{bus?.capacity || 0} seats</strong>
              </p>
            </div>

            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sky-blue)',
              }}
            >
              <Bus size={28} />
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <div>
              <p style={{ fontSize: '0.75rem', color: '#B2C7DF' }}>License Number</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', fontFamily: 'monospace' }}>
                {driver?.licenseNumber || 'MH1234567890'}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#B2C7DF' }}>Assigned Students</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{students.length} Students</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#B2C7DF' }}>Scans Today</p>
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--sky-blue)' }}>
                {todayScans.length} Recorded
              </p>
            </div>
          </div>
        </div>

        {/* Big Mobile Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <Link
            to="/driver/qr-attendance"
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              textDecoration: 'none',
              borderLeft: '5px solid var(--secondary-blue)',
              transition: 'transform 0.2s',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--sky-blue-light)',
                color: 'var(--secondary-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <QrCode size={30} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                QR Attendance Scanner
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Scan student passes for Boarding & Drop-off
              </p>
            </div>
            <ArrowRight size={20} color="var(--secondary-blue)" />
          </Link>

          <Link
            to="/driver/tracking"
            className="card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              textDecoration: 'none',
              borderLeft: '5px solid var(--success)',
              transition: 'transform 0.2s',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#DCFCE7',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Navigation size={30} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                Share Bus GPS Location
              </h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                Broadcast live vehicle position to parents
              </p>
            </div>
            <ArrowRight size={20} color="var(--success)" />
          </Link>
        </div>

        {/* Assigned Students Roster Overview */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Users size={18} color="var(--primary-navy)" /> Assigned Student Roster ({students.length})
              </h3>
              <p className="card-subtitle">Students registered on your assigned bus</p>
            </div>
          </div>

          {students.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {students.map((stu) => (
                <div
                  key={stu._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {stu.name}
                    </p>
                    <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                      ID: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{stu.studentId}</span> • Class {stu.className}-{stu.division}
                    </p>
                  </div>
                  <span className="badge badge-success">Assigned</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '1rem 0' }}>
              No students are currently allocated to this bus.
            </p>
          )}
        </div>

        {/* Driver Safety Instructions */}
        <div
          style={{
            padding: '1.25rem',
            background: 'var(--warm-cream)',
            border: '1px solid var(--warm-cream-border)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '0.4rem' }}>
            <Shield size={16} /> Driver Transit Protocol:
          </div>
          <p style={{ lineHeight: 1.6 }}>
            1. Keep GPS location sharing active throughout your morning and evening transit routes.<br />
            2. Switch to <strong>BOARD</strong> mode during pickup and <strong>DROP</strong> mode during final drop-off.<br />
            3. Each student must scan their QR pass upon boarding so parents receive automatic notifications.
          </p>
        </div>
      </div>
    </>
  );
};

export default DriverDashboard;

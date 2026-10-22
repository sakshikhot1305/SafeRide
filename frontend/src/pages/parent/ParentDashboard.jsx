import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Bus,
  Navigation,
  Bell,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import studentService from '../../services/studentService';
import notificationService from '../../services/notificationService';
import attendanceService from '../../services/attendanceService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { addToast } = useToast();

  const loadParentData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [kidsRes, notifsRes, attendRes] = await Promise.all([
        studentService.getMyChildren(),
        notificationService.getParentNotifications(),
        attendanceService.getMyChildrenAttendance(),
      ]);

      setChildren(kidsRes.students || []);
      setNotifications(notifsRes.notifications || []);
      setRecentAttendance(attendRes.attendance || []);
      if (isManual) addToast('Child transit status updated', 'success');
    } catch (err) {
      console.error('Parent dashboard data error:', err);
      addToast('Notice: Loading parent dashboard details', 'info');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadParentData();
    // Poll notifications every 30 seconds
    const interval = setInterval(() => {
      loadParentData(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      addToast('Notification marked as read', 'success');
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  if (loading) {
    return (
      <>
        <DashboardHeader title="Parent Guardian Portal" subtitle="Connecting with school transport..." />
        <div className="dashboard-content">
          <LoadingSpinner text="Retrieving student safety feed..." />
        </div>
      </>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <DashboardHeader
        title={`Welcome, ${user?.name || 'Parent'}`}
        subtitle="Live safety telemetry and boarding notifications for your children"
        unreadCount={unreadCount}
      />

      <div className="dashboard-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Top Refresh Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <ShieldCheck size={18} color="var(--success)" />
            <span>Active Transport Monitoring Session</span>
          </div>

          <button
            onClick={() => loadParentData(true)}
            disabled={refreshing}
            className="btn btn-outline btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <RefreshCw size={14} className={refreshing ? 'spin-animation' : ''} />
            {refreshing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>

        {/* Children Status Cards */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '1rem' }}>
            Registered Children ({children.length})
          </h3>

          {children.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Users size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <h4 style={{ fontWeight: 700, color: 'var(--primary-navy)' }}>No Children Linked Yet</h4>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Please ask the school administration to assign your child to your email address ({user?.email}).
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {children.map((child) => {
                const childAttendance = recentAttendance.find(
                  (a) => a.studentId?._id === child._id || a.studentId === child._id
                );

                return (
                  <div key={child._id} className="card" style={{ padding: '1.5rem', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <span className="badge badge-neutral" style={{ marginBottom: '0.4rem' }}>
                          Grade {child.className}-{child.division}
                        </span>
                        <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                          {child.name}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          Student ID: {child.studentId}
                        </p>
                      </div>

                      <span
                        className={`badge ${
                          childAttendance?.status === 'Boarded'
                            ? 'badge-info'
                            : childAttendance?.status === 'Dropped Off'
                            ? 'badge-success'
                            : 'badge-neutral'
                        }`}
                      >
                        {childAttendance ? childAttendance.status : 'Awaiting Trip'}
                      </span>
                    </div>

                    {/* Assigned Bus & Route */}
                    <div
                      style={{
                        padding: '0.85rem',
                        backgroundColor: 'var(--bg-main)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.4rem',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Bus size={15} color="var(--secondary-blue)" />
                        <span>
                          Bus: <strong>{child.busId?.busNumber || 'Unassigned'}</strong>{' '}
                          {child.busId?.registrationNumber && `(${child.busId.registrationNumber})`}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Navigation size={15} color="var(--secondary-blue)" />
                        <span>Route: <strong>{child.routeId?.routeName || 'Standard Route'}</strong></span>
                      </div>
                    </div>

                    {/* Action Links */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {child.busId && (
                        <Link
                          to={`/parent/tracking?busId=${child.busId._id}`}
                          className="btn btn-primary btn-sm"
                          style={{ gap: '0.35rem', flex: 1 }}
                        >
                          <Navigation size={14} /> Live Bus Map
                        </Link>
                      )}
                      <Link
                        to="/parent/child"
                        className="btn btn-outline btn-sm"
                        style={{ gap: '0.35rem', flex: 1 }}
                      >
                        View QR Pass
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Notifications & Alerts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Notifications Card */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} color="var(--warning)" />
                <h3 className="card-title">Recent Safety Alerts</h3>
              </div>
              <Link to="/parent/notifications" style={{ fontSize: '0.825rem', color: 'var(--secondary-blue)', fontWeight: 600 }}>
                View All ({notifications.length}) →
              </Link>
            </div>

            {notifications.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '1rem 0' }}>
                No notifications logged yet. Alerts will appear here when your child scans their pass.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notifications.slice(0, 4).map((notif) => (
                  <div
                    key={notif._id}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: notif.isRead ? 'var(--bg-main)' : 'var(--warm-cream)',
                      borderLeft: `4px solid ${
                        notif.type === 'BOARDING'
                          ? 'var(--secondary-blue)'
                          : notif.type === 'DROPOFF'
                          ? 'var(--success)'
                          : 'var(--warning)'
                      }`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: notif.isRead ? 500 : 700, color: 'var(--text-primary)' }}>
                        {notif.message}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(notif.createdAt).toLocaleTimeString()} • {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkRead(notif._id)}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.7rem', padding: '0.2rem 0.4rem' }}
                      >
                        Read
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Commute History */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarCheck size={18} color="var(--primary-navy)" />
                <h3 className="card-title">Recent Attendance Records</h3>
              </div>
              <Link to="/parent/attendance" style={{ fontSize: '0.825rem', color: 'var(--secondary-blue)', fontWeight: 600 }}>
                Full History →
              </Link>
            </div>

            {recentAttendance.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '1rem 0' }}>
                No transit scans recorded yet today.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentAttendance.slice(0, 4).map((att) => (
                  <div
                    key={att._id}
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {att.studentId?.name || 'Student'}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {att.attendanceDate} • Bus: {att.busId?.busNumber || 'N/A'}
                      </p>
                    </div>
                    <span className={`badge ${att.status === 'Dropped Off' ? 'badge-success' : 'badge-info'}`}>
                      {att.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ParentDashboard;

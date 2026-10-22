import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCheck,
  Filter,
} from 'lucide-react';
import DashboardHeader from '../../components/layout/DashboardHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import notificationService from '../../services/notificationService';
import { useToast } from '../../context/ToastContext';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'UNREAD', 'BOARDING', 'DROPOFF'

  const { addToast } = useToast();

  const loadNotifications = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const data = await notificationService.getParentNotifications();
      setNotifications(data.notifications || []);
      if (isManual) addToast('Notifications synced', 'success');
    } catch (err) {
      console.error('Error fetching notifications:', err);
      addToast('Failed to fetch notifications', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(() => {
      loadNotifications(false);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      addToast('Marked as read', 'success');
    } catch (err) {
      console.error('Failed to mark notification read:', err);
      addToast('Error marking read', 'error');
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    if (unread.length === 0) return;

    try {
      await Promise.all(unread.map((n) => notificationService.markNotificationRead(n._id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      addToast('All notifications marked as read', 'success');
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = notifications.filter((n) => {
    if (filterType === 'UNREAD') return !n.isRead;
    if (filterType === 'BOARDING') return n.type === 'BOARDING';
    if (filterType === 'DROPOFF') return n.type === 'DROPOFF';
    return true;
  });

  return (
    <>
      <DashboardHeader
        title="Student Safety Alerts"
        subtitle="Automated transit notifications generated directly by school bus attendance scans"
        unreadCount={unreadCount}
      />

      <div className="dashboard-content" style={{ maxWidth: '850px', margin: '0 auto' }}>
        {/* Top Control Bar */}
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
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterType('ALL')}
              className={`btn btn-sm ${filterType === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
            >
              All Alerts ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType('UNREAD')}
              className={`btn btn-sm ${filterType === 'UNREAD' ? 'btn-primary' : 'btn-outline'}`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilterType('BOARDING')}
              className={`btn btn-sm ${filterType === 'BOARDING' ? 'btn-primary' : 'btn-outline'}`}
            >
              Boarding
            </button>
            <button
              onClick={() => setFilterType('DROPOFF')}
              className={`btn btn-sm ${filterType === 'DROPOFF' ? 'btn-primary' : 'btn-outline'}`}
            >
              Drop-offs
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="btn btn-outline btn-sm"
                style={{ gap: '0.35rem' }}
              >
                <CheckCheck size={15} /> Mark All Read
              </button>
            )}
            <button
              onClick={() => loadNotifications(true)}
              disabled={refreshing}
              className="btn btn-outline btn-sm"
              style={{ gap: '0.35rem' }}
            >
              <RefreshCw size={14} className={refreshing ? 'spin-animation' : ''} />
              {refreshing ? 'Syncing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Notifications Feed */}
        {loading ? (
          <LoadingSpinner text="Retrieving parent notifications..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No Notifications Found"
            description="You are completely caught up! New alerts will arrive automatically when attendance events occur."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filtered.map((notif) => {
              const isBoarding = notif.type === 'BOARDING';
              const isDropoff = notif.type === 'DROPOFF';

              return (
                <div
                  key={notif._id}
                  className="card"
                  style={{
                    padding: '1.25rem 1.5rem',
                    backgroundColor: notif.isRead ? '#FFFFFF' : 'var(--warm-cream)',
                    borderLeft: `5px solid ${
                      isBoarding ? 'var(--secondary-blue)' : isDropoff ? 'var(--success)' : 'var(--warning)'
                    }`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1 }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isBoarding ? 'var(--sky-blue-light)' : isDropoff ? '#DCFCE7' : '#FEF3C7',
                        color: isBoarding ? 'var(--secondary-blue)' : isDropoff ? 'var(--success)' : 'var(--warning)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isBoarding ? <Bus size={20} /> : isDropoff ? <CheckCircle2 size={20} /> : <Bell size={20} />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span
                          className={`badge ${
                            isBoarding ? 'badge-info' : isDropoff ? 'badge-success' : 'badge-warning'
                          }`}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {notif.type}
                        </span>
                        {!notif.isRead && (
                          <span
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--error)',
                            }}
                          />
                        )}
                      </div>

                      <h4
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: notif.isRead ? 600 : 700,
                          color: 'var(--primary-navy)',
                          lineHeight: 1.4,
                        }}
                      >
                        {notif.message}
                      </h4>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          marginTop: '0.5rem',
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Clock size={12} />
                          {new Date(notif.createdAt).toLocaleTimeString()}
                        </span>
                        <span>•</span>
                        <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                        {notif.studentId && (
                          <>
                            <span>•</span>
                            <span>Student: {notif.studentId?.name || notif.studentId?.studentId}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif._id)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', flexShrink: 0 }}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Notifications;

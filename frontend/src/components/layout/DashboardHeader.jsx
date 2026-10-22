import React from 'react';
import { Bell, LogOut, ShieldCheck, Bus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardHeader = ({ title, subtitle, unreadCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="dashboard-header">
      <div className="header-title-group">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      <div className="header-user-menu">
        {user?.role === 'parent' && (
          <button
            onClick={() => navigate('/parent/notifications')}
            style={{
              background: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  backgroundColor: 'var(--error)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid white',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}

        <div className="user-profile-badge">
          <div className="user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-details" style={{ display: 'none' }} id="user-details-text">
            <span className="user-name">{user?.name || 'SafeRide User'}</span>
            <span className="user-role-tag">{user?.role}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-outline btn-sm"
          style={{ gap: '0.35rem' }}
          title="Sign out of current account"
        >
          <LogOut size={14} />
          <span style={{ display: 'none' }} id="logout-text">Logout</span>
        </button>
      </div>

      <style>{`
        @media (min-width: 640px) {
          #user-details-text { display: flex !important; }
          #logout-text { display: inline !important; }
        }
      `}</style>
    </header>
  );
};

export default DashboardHeader;

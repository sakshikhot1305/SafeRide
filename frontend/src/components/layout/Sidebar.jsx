import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Bus,
  LayoutDashboard,
  Users,
  UserCheck,
  MapPin,
  CalendarCheck,
  BarChart3,
  QrCode,
  Navigation,
  Bell,
  LogOut,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ role = 'admin' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard },
    { label: 'Students', to: '/admin/students', icon: Users },
    { label: 'Drivers', to: '/admin/drivers', icon: UserCheck },
    { label: 'Buses', to: '/admin/buses', icon: Bus },
    { label: 'Routes & Stops', to: '/admin/routes', icon: MapPin },
    { label: 'Attendance Records', to: '/admin/attendance', icon: CalendarCheck },
    { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  ];

  const driverLinks = [
    { label: 'Driver Dashboard', to: '/driver', icon: LayoutDashboard },
    { label: 'QR Attendance Scan', to: '/driver/qr-attendance', icon: QrCode },
    { label: 'Share Bus GPS', to: '/driver/tracking', icon: Navigation },
  ];

  const parentLinks = [
    { label: 'Parent Overview', to: '/parent', icon: LayoutDashboard },
    { label: 'My Child Details', to: '/parent/child', icon: Users },
    { label: 'Attendance History', to: '/parent/attendance', icon: CalendarCheck },
    { label: 'Live Bus Tracking', to: '/parent/tracking', icon: Navigation },
    { label: 'Safety Notifications', to: '/parent/notifications', icon: Bell },
  ];

  let links = adminLinks;
  let roleTitle = 'Admin Console';
  if (role === 'driver') {
    links = driverLinks;
    roleTitle = 'Driver Portal';
  } else if (role === 'parent') {
    links = parentLinks;
    roleTitle = 'Parent Portal';
  }

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--secondary-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bus size={20} color="white" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF' }}>SafeRide</span>
            <span className="sidebar-brand-badge">{role}</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{roleTitle}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin' || link.to === '/driver' || link.to === '/parent'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} />
              <span style={{ flex: 1 }}>{link.label}</span>
              <ChevronRight size={14} style={{ opacity: 0.5 }} />
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.85rem',
              flexShrink: 0,
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span
              style={{
                fontSize: '0.825rem',
                fontWeight: 600,
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name || 'User'}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{user?.email || ''}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign out"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#B2C7DF',
            cursor: 'pointer',
            padding: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--error)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#B2C7DF')}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bus, Shield, Phone, Mail, MapPin, Heart, ArrowUp } from 'lucide-react';

const Footer = () => {
  const location = useLocation();

  const handleAnchorClick = (anchorId) => {
    if (location.pathname === '/') {
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      window.location.href = `/#${anchorId}`;
    }
  };

  return (
    <footer style={{ background: '#0A1E35', color: '#FFFFFF', paddingTop: '4.5rem', paddingBottom: '2.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '3rem', marginBottom: '3.5rem' }}>
          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--secondary-blue) 0%, var(--primary-navy) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(38, 120, 200, 0.3)',
                }}
              >
                <Bus size={22} color="white" />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                SafeRide
              </span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
              Smart School Bus Management & Student Safety System. Empowering administrators, drivers, and parents with automated QR attendance, live GPS bus tracking, and real-time security alerts.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--sky-blue)', fontSize: '0.85rem', fontWeight: 600 }}>
              <Shield size={16} /> Certified Student Transit Safety Architecture
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
              Platform Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorClick('home')}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, fontSize: 'inherit', transition: 'color 0.2s' }}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorClick('about')}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, fontSize: 'inherit', transition: 'color 0.2s' }}
                >
                  About the System
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorClick('features')}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, fontSize: 'inherit', transition: 'color 0.2s' }}
                >
                  Features & Modules
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorClick('how-it-works')}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, fontSize: 'inherit', transition: 'color 0.2s' }}
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorClick('tracking')}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, fontSize: 'inherit', transition: 'color 0.2s' }}
                >
                  Live GPS Tracking
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleAnchorClick('contact')}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, fontSize: 'inherit', transition: 'color 0.2s' }}
                >
                  Contact Help Desk
                </button>
              </li>
            </ul>
          </div>

          {/* User Portals */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
              Role Portals
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.9rem' }}>
              <li>
                <Link to="/login" style={{ color: '#94A3B8', display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ color: '#FFFFFF' }}>Admin Command Hub</strong>
                  <span style={{ fontSize: '0.785rem', color: '#64748B' }}>Fleet, student, driver & analytics</span>
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ color: '#94A3B8', display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ color: '#FFFFFF' }}>Driver Mobile Terminal</strong>
                  <span style={{ fontSize: '0.785rem', color: '#64748B' }}>QR attendance & GPS broadcasting</span>
                </Link>
              </li>
              <li>
                <Link to="/login" style={{ color: '#94A3B8', display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ color: '#FFFFFF' }}>Parent Guardian Portal</strong>
                  <span style={{ fontSize: '0.785rem', color: '#64748B' }}>Live bus map & safety notifications</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
              Help Desk
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.95rem', fontSize: '0.875rem', color: '#94A3B8' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <MapPin size={18} color="var(--sky-blue)" /> Kolhapur, Maharashtra, India
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Phone size={18} color="var(--sky-blue)" /> +91 98765 43210
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Mail size={18} color="var(--sky-blue)" /> support@saferide.school.edu
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '0.825rem',
            color: '#64748B',
          }}
        >
          <p>© {new Date().getFullYear()} SafeRide Smart School Bus Management & Student Safety System. MCA Major Project.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Built with MERN Stack • Safe & Reliable School Commute
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

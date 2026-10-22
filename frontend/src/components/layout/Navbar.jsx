import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bus, Menu, X, Shield, LogIn, LayoutDashboard, Sparkles, Navigation } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Section spy when on home page
      if (location.pathname === '/') {
        const sections = ['home', 'about', 'features', 'how-it-works', 'tracking', 'contact'];
        const scrollPosition = window.scrollY + 100;
        for (const sec of sections) {
          const el = document.getElementById(sec);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
              setActiveSection(sec);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleNavClick = (anchorId) => {
    setIsOpen(false);
    if (location.pathname === '/') {
      const target = document.getElementById(anchorId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      navigate(`/#${anchorId}`);
      setTimeout(() => {
        const target = document.getElementById(anchorId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'driver') return '/driver';
    if (user.role === 'parent') return '/parent';
    return '/login';
  };

  const navItems = [
    { label: 'Home', anchor: 'home' },
    { label: 'About', anchor: 'about' },
    { label: 'Features', anchor: 'features' },
    { label: 'How It Works', anchor: 'how-it-works' },
    { label: 'Live Tracking', anchor: 'tracking' },
    { label: 'Contact', anchor: 'contact' },
  ];

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 500,
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.94)' : 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid',
        borderColor: scrolled ? 'var(--border-color)' : 'rgba(226, 232, 240, 0.8)',
        boxShadow: scrolled ? '0 4px 20px -2px rgba(18, 52, 90, 0.08)' : 'var(--shadow-xs)',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1.75rem',
          height: '74px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo with Clean Transport/Safety Icon */}
        <div
          onClick={() => handleNavClick('home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', cursor: 'pointer', userSelect: 'none' }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--secondary-blue) 0%, var(--primary-navy) 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(38, 120, 200, 0.35)',
            }}
          >
            <Bus size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.03em' }}>
                SafeRide
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  background: 'var(--secondary-blue-light)',
                  color: 'var(--secondary-blue)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--sky-blue-border)',
                }}
              >
                PRO
              </span>
            </div>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', marginTop: '-2px', fontWeight: 600 }}>
              Smart Student Transit Safety
            </p>
          </div>
        </div>

        {/* Desktop Anchor Navigation */}
        <nav style={{ display: 'none', gap: '1.75rem', alignItems: 'center' }} className="desktop-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === '/' && activeSection === item.anchor;
            return (
              <button
                key={item.anchor}
                type="button"
                onClick={() => handleNavClick(item.anchor)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isActive ? 'var(--secondary-blue)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '0.925rem',
                  transition: 'all 0.2s',
                  position: 'relative',
                  padding: '0.4rem 0',
                }}
              >
                {item.label}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2.5px',
                      background: 'var(--secondary-blue)',
                      borderRadius: 'var(--radius-full)',
                      boxShadow: '0 2px 6px rgba(38, 120, 200, 0.4)',
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div style={{ display: 'none', alignItems: 'center', gap: '0.85rem' }} className="desktop-actions">
          {isAuthenticated ? (
            <Link to={getDashboardPath()} className="btn btn-primary" style={{ gap: '0.5rem' }}>
              <LayoutDashboard size={18} />
              <span>Go to Dashboard</span>
            </Link>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-outline" style={{ gap: '0.4rem', border: '1px solid var(--border-color)' }}>
                <LogIn size={16} /> Sign In
              </Link>
              <button
                type="button"
                onClick={() => handleNavClick('features')}
                className="btn btn-primary"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="mobile-toggle"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.5rem',
            color: 'var(--primary-navy)',
          }}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div
          style={{
            background: '#FFFFFF',
            borderTop: '1px solid var(--border-color)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {navItems.map((item) => (
            <button
              key={item.anchor}
              type="button"
              onClick={() => handleNavClick(item.anchor)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                color: activeSection === item.anchor ? 'var(--secondary-blue)' : 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '1rem',
                padding: '0.5rem 0',
              }}
            >
              {item.label}
            </button>
          ))}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {isAuthenticated ? (
              <Link to={getDashboardPath()} onClick={() => setIsOpen(false)} className="btn btn-primary">
                <LayoutDashboard size={18} /> Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="btn btn-outline">
                  <LogIn size={16} /> Sign In
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="btn btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 860px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default Navbar;

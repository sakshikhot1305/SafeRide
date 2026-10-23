import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bus,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide both email address and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await login(email.trim(), password);
      addToast(`Welcome to SafeRide, ${data.user?.name || 'User'}!`, 'success');

      const userRole = data.user?.role;
      if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else if (userRole === 'driver') {
        navigate('/driver', { replace: true });
      } else if (userRole === 'parent') {
        navigate('/parent', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || err.message || 'Invalid credentials. Please verify and retry.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #071524 0%, #0E243A 60%, #15385C 100%)',
        padding: '2.5rem 1.25rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient Glow Orbs */}
      <div
        className="ambient-glow"
        style={{
          top: '10%',
          left: '15%',
          width: '450px',
          height: '450px',
          background: 'rgba(56, 189, 248, 0.15)',
        }}
      />
      <div
        className="ambient-glow"
        style={{
          bottom: '10%',
          right: '15%',
          width: '500px',
          height: '500px',
          background: 'rgba(29, 111, 216, 0.2)',
        }}
      />

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.85rem', textDecoration: 'none' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--secondary-blue) 0%, #1558B0 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(29, 111, 216, 0.4)',
              }}
            >
              <Bus size={28} />
            </div>
            <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em' }}>
              SafeRide
            </span>
          </Link>
          <p style={{ color: '#94A3B8', fontSize: '0.925rem', marginTop: '0.5rem', fontWeight: 500 }}>
            Unified School Transit & Student Safety Portal
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
          }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.02em' }}>
              Sign In to Your Portal
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Enter your registered email and password to access your dashboard.
            </p>
          </div>

          

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--error-bg)',
                color: 'var(--error)',
                fontSize: '0.875rem',
                marginBottom: '1.25rem',
                border: '1px solid var(--error-border)',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon-left" />
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon-left" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
              style={{ width: '100%', gap: '0.5rem', fontWeight: 700 }}
            >
              {loading ? (
                'Verifying Session...'
              ) : (
                <>
                  <LogIn size={20} /> Access SafeRide Dashboard
                </>
              )}
            </button>
          </form>

          {/* Bottom helper */}
          <div
            style={{
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-color)',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            New account?{' '}
            <Link to="/register" style={{ color: 'var(--secondary-blue)', fontWeight: 700 }}>
              Create an Account
            </Link>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link to="/" style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600 }}>
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

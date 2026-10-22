import React from 'react';
import { Link } from 'react-router-dom';
import { Bus, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '75vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--sky-blue-light)',
          color: 'var(--secondary-blue)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <Bus size={36} />
      </div>
      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary-navy)', lineHeight: 1 }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.5rem', marginBottom: '1rem' }}>
        Route Not Found
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.6, marginBottom: '2rem' }}>
        The page you are looking for has been moved, removed, or never existed on the SafeRide platform.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/" className="btn btn-primary" style={{ gap: '0.4rem' }}>
          <Home size={16} /> Return to Home
        </Link>
        <button onClick={() => window.history.back()} className="btn btn-outline" style={{ gap: '0.4rem' }}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFound;

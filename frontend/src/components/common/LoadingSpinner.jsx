import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...', size = 32, fullScreen = false }) => {
  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '2rem' }}>
      <Loader2 size={size} className="spin-animation" style={{ color: 'var(--secondary-blue)', animation: 'spin 1s linear infinite' }} />
      {text && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{text}</p>}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)' }}>
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;

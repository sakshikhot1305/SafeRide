import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('SafeRide ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          style={{
            padding: '2rem',
            margin: '1.5rem auto',
            maxWidth: '600px',
            background: '#FFF5F5',
            borderRadius: 'var(--radius-lg, 12px)',
            border: '1px solid #FEB2B2',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#FED7D7',
              color: '#C53030',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <AlertTriangle size={28} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#9B2C2C', marginBottom: '0.5rem' }}>
            {this.props.title || 'Display Notice'}
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#742A2A', marginBottom: '1.25rem', lineHeight: 1.5 }}>
            {this.props.message ||
              'A rendering issue occurred while displaying this section. Your transit and tracking data remain safe.'}
          </p>
          <button
            onClick={this.handleReload}
            className="btn btn-primary btn-sm"
            style={{ gap: '0.4rem', margin: '0 auto' }}
          >
            <RefreshCw size={14} /> Retry / Reload View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
